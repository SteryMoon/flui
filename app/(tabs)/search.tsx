import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import { useCallback, useMemo, useRef, useState } from "react";
import {
  Dimensions,
  Keyboard,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import MapView, { PROVIDER_GOOGLE, type Region } from "react-native-maps";
import Animated, {
  FadeIn,
  FadeInDown,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Chip } from "@/components/Chip";
import { FilterSheet } from "@/components/FilterSheet";
import { IntentSelector } from "@/components/IntentSelector";
import { StationMarker } from "@/components/StationMarker";
import RechargePoint from "@/components/recharge-point";
import { StationCardSkeleton } from "@/components/StationCardSkeleton";
import { countActiveFilters } from "@/constants/filters";
import { DARK_MAP_STYLE } from "@/constants/map-style";
import { BorderRadius, FluiColors, FluiFonts, Motion, Spacing } from "@/constants/theme";
import { useStationFilters } from "@/hooks/use-station-filters";
import type { Station } from "@/mocks/station";
import { rankStations, type StopIntent } from "@/utils/stop-intent";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");

/** Duas alturas para a folha de resultados: espiando o mapa ou lendo a lista. */
const SHEET_PEEK = SCREEN_HEIGHT * 0.46;
const SHEET_EXPANDED = SCREEN_HEIGHT * 0.85;

const REGIAO_INICIAL: Region = {
  latitude: -23.5735,
  longitude: -46.6688,
  latitudeDelta: 0.09,
  longitudeDelta: 0.09,
};

export default function SearchScreen() {
  const insets = useSafeAreaInsets();
  const mapRef = useRef<MapView>(null);
  const reduzirMovimento = useReducedMotion();

  const { filters, setFilters, query, setQuery, results, loading, clearFilters } =
    useStationFilters();

  const [intent, setIntent] = useState<StopIntent>("rapida");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [filtersVisible, setFiltersVisible] = useState(false);
  const [expanded, setExpanded] = useState(false);

  const alturaFolha = useSharedValue(SHEET_PEEK);
  const estiloFolha = useAnimatedStyle(() => ({ height: alturaFolha.value }));

  const filtrosAtivos = countActiveFilters(filters);

  /**
   * Os filtros dizem quais pontos servem; a intenção diz qual deles é o
   * melhor agora. Por isso a ordenação roda depois da filtragem, e não dentro
   * dela — assim nenhum ponto some por causa da intenção escolhida.
   */
  const ordenados = useMemo(() => rankStations(results, intent), [results, intent]);

  /* ----------------------------------------------------------------------- */
  /* Ações                                                                    */
  /* ----------------------------------------------------------------------- */

  const alternarFolha = useCallback(() => {
    const proxima = !expanded;
    setExpanded(proxima);
    const alvo = proxima ? SHEET_EXPANDED : SHEET_PEEK;
    alturaFolha.value = reduzirMovimento
      ? alvo
      : withTiming(alvo, { duration: Motion.base });
  }, [expanded, alturaFolha, reduzirMovimento]);

  const focarNoPonto = useCallback(
    (station: Station) => {
      setSelectedId(station.id);
      if (Platform.OS !== "web") {
        Haptics.selectionAsync().catch(() => {});
      }
      mapRef.current?.animateToRegion(
        {
          ...station.coordinates,
          latitudeDelta: 0.02,
          longitudeDelta: 0.02,
        },
        reduzirMovimento ? 0 : 450,
      );
    },
    [reduzirMovimento],
  );

  const abrirFicha = useCallback((station: Station) => {
    router.push({ pathname: "/ponto-recarga", params: { id: station.id } });
  }, []);

  function buscar() {
    Keyboard.dismiss();
  }

  /* ----------------------------------------------------------------------- */
  /* Filtros rápidos — atalhos para os filtros completos da folha             */
  /* ----------------------------------------------------------------------- */

  const atalhos = useMemo(
    () => [
      {
        key: "todos",
        label: "Todos",
        ativo: filtrosAtivos === 0,
        acao: () => clearFilters(),
      },
      {
        key: "livres",
        label: "Livres",
        ativo: filters.onlyAvailable,
        acao: () =>
          setFilters((prev) => ({ ...prev, onlyAvailable: !prev.onlyAvailable })),
      },
      {
        key: "dc",
        label: "DC rápido",
        ativo: filters.minPowerKw === 50,
        acao: () =>
          setFilters((prev) => ({
            ...prev,
            minPowerKw: prev.minPowerKw === 50 ? null : 50,
          })),
      },
      {
        key: "aberto",
        label: "Aberto agora",
        ativo: filters.onlyOpenNow,
        acao: () => setFilters((prev) => ({ ...prev, onlyOpenNow: !prev.onlyOpenNow })),
      },
    ],
    [filters, filtrosAtivos, clearFilters, setFilters],
  );

  /* ----------------------------------------------------------------------- */

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        style={StyleSheet.absoluteFill}
        provider={Platform.OS === "android" ? PROVIDER_GOOGLE : undefined}
        customMapStyle={DARK_MAP_STYLE}
        initialRegion={REGIAO_INICIAL}
        showsUserLocation
        showsMyLocationButton={false}
        toolbarEnabled={false}
        onPress={() => setSelectedId(null)}
      >
        {ordenados.map(({ station }) => (
          <StationMarker
            key={station.id}
            station={station}
            selected={station.id === selectedId}
            onPress={focarNoPonto}
          />
        ))}
      </MapView>

      {/* ------------------------------ Busca ------------------------------ */}
      <View style={[styles.searchBar, { top: insets.top + Spacing.sm }]}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Voltar"
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={20} color={FluiColors.primary} />
        </Pressable>

        <View style={styles.searchField}>
          <Ionicons name="search" size={18} color={FluiColors.mutedText} />
          <TextInput
            accessibilityLabel="Buscar pontos de recarga por nome ou endereço"
            placeholder="Buscar pontos..."
            placeholderTextColor={FluiColors.mutedText}
            style={styles.searchInput}
            value={query}
            onChangeText={setQuery}
            onSubmitEditing={buscar}
            returnKeyType="search"
          />
          {query.length > 0 && (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Limpar busca"
              onPress={() => setQuery("")}
              hitSlop={8}
            >
              <Ionicons name="close-circle" size={18} color={FluiColors.mutedText} />
            </Pressable>
          )}
        </View>
      </View>

      {/* ---------------------- Folha de resultados ------------------------ */}
      <Animated.View style={[styles.sheet, estiloFolha]}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={expanded ? "Encolher lista" : "Expandir lista"}
          accessibilityHint="Mostra mais ou menos resultados sobre o mapa"
          onPress={alternarFolha}
          style={styles.handleArea}
        >
          <View style={styles.handle} />
        </Pressable>

        <View style={styles.sheetHeader}>
          <View style={styles.sheetTitles}>
            <Text style={styles.sheetTitle} accessibilityRole="header">
              Pontos na rota
            </Text>
            <Text style={styles.sheetCount}>
              {loading
                ? "Buscando..."
                : `${results.length} ${results.length === 1 ? "encontrado" : "encontrados"}`}
            </Text>
          </View>

          <Pressable
            accessibilityRole="button"
            accessibilityLabel={
              filtrosAtivos > 0
                ? `Filtros, ${filtrosAtivos} ativos`
                : "Abrir filtros de busca"
            }
            onPress={() => setFiltersVisible(true)}
            style={({ pressed }) => [styles.filterButton, pressed && styles.pressed]}
          >
            <Ionicons name="options-outline" size={16} color={FluiColors.text} />
            <Text style={styles.filterButtonText}>Filtrar</Text>
            {filtrosAtivos > 0 && (
              <Animated.View entering={FadeIn.duration(Motion.fast)} style={styles.filterBadge}>
                <Text style={styles.filterBadgeText}>{filtrosAtivos}</Text>
              </Animated.View>
            )}
          </Pressable>
        </View>

        <ScrollView
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.chipsRow}
          >
            {atalhos.map((atalho) => (
              <Chip
                key={atalho.key}
                label={atalho.label}
                selected={atalho.ativo}
                onPress={atalho.acao}
              />
            ))}
          </ScrollView>

          <IntentSelector value={intent} onChange={setIntent} />

          <View style={styles.listItems}>
          {loading && (
            <>
              <StationCardSkeleton />
              <StationCardSkeleton />
              <StationCardSkeleton />
            </>
          )}

          {!loading && results.length === 0 && (
            <Animated.View
              entering={reduzirMovimento ? undefined : FadeInDown.duration(Motion.base)}
              style={styles.empty}
            >
              <MaterialCommunityIcons
                name="map-marker-off-outline"
                size={40}
                color={FluiColors.mutedText}
              />
              <Text style={styles.emptyTitle}>Nenhum ponto encontrado</Text>
              <Text style={styles.emptyText}>
                Tente ampliar os filtros ou buscar por outro bairro.
              </Text>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Limpar todos os filtros"
                onPress={() => {
                  clearFilters();
                  setQuery("");
                }}
                style={({ pressed }) => [styles.emptyButton, pressed && styles.pressed]}
              >
                <Text style={styles.emptyButtonText}>Limpar filtros</Text>
              </Pressable>
            </Animated.View>
          )}

          {!loading &&
            ordenados.map((item, index) => (
              <RechargePoint
                key={item.station.id}
                station={item.station}
                stopEstimate={{
                  energyKwh: item.energyKwh,
                  cost: item.cost,
                  reason: item.reason,
                }}
                index={index}
                selected={item.station.id === selectedId}
                onPress={(alvo) =>
                  alvo.id === selectedId ? abrirFicha(alvo) : focarNoPonto(alvo)
                }
              />
            ))}

          {!loading && ordenados.length > 0 && (
            <Text style={styles.listHint}>
              Toque uma vez para ver no mapa, duas para abrir a ficha.
            </Text>
          )}
          </View>
        </ScrollView>
      </Animated.View>

      <FilterSheet
        visible={filtersVisible}
        filters={filters}
        query={query}
        onClose={() => setFiltersVisible(false)}
        onApply={(novos) => setFilters(novos)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  backButton: {
    alignItems: "center",
    backgroundColor: FluiColors.text,
    borderColor: FluiColors.primary,
    borderRadius: 18,
    borderWidth: 1.5,
    height: 36,
    justifyContent: "center",
    width: 36,
  },
  chipsRow: {
    gap: Spacing.sm,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  container: {
    backgroundColor: FluiColors.background,
    flex: 1,
  },
  empty: {
    alignItems: "center",
    gap: Spacing.sm,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.xl,
  },
  emptyButton: {
    backgroundColor: FluiColors.primary,
    borderRadius: BorderRadius.button,
    marginTop: Spacing.sm,
    minHeight: 44,
    justifyContent: "center",
    paddingHorizontal: Spacing.lg,
  },
  emptyButtonText: {
    color: FluiColors.text,
    fontFamily: FluiFonts.inter.semiBold,
    fontSize: 14,
  },
  emptyText: {
    color: FluiColors.mutedText,
    fontFamily: FluiFonts.inter.regular,
    fontSize: 13,
    textAlign: "center",
  },
  emptyTitle: {
    color: FluiColors.text,
    fontFamily: FluiFonts.inter.semiBold,
    fontSize: 16,
  },
  filterBadge: {
    alignItems: "center",
    backgroundColor: FluiColors.primary,
    borderRadius: 9,
    height: 18,
    justifyContent: "center",
    minWidth: 18,
    paddingHorizontal: 4,
  },
  filterBadgeText: {
    color: FluiColors.text,
    fontFamily: FluiFonts.inter.bold,
    fontSize: 10,
  },
  filterButton: {
    alignItems: "center",
    backgroundColor: FluiColors.chipInactive,
    borderRadius: BorderRadius.button,
    flexDirection: "row",
    gap: 6,
    minHeight: 40,
    paddingHorizontal: Spacing.md,
  },
  filterButtonText: {
    color: FluiColors.text,
    fontFamily: FluiFonts.inter.medium,
    fontSize: 13,
  },
  handle: {
    backgroundColor: FluiColors.surfaceAlt,
    borderRadius: 3,
    height: 5,
    width: 44,
  },
  handleArea: {
    alignItems: "center",
    paddingBottom: Spacing.xs,
    paddingTop: Spacing.sm + 2,
  },
  list: {
    paddingBottom: Spacing.xl * 2,
  },
  listItems: {
    paddingHorizontal: Spacing.md,
  },
  listHint: {
    color: FluiColors.mutedText,
    fontFamily: FluiFonts.inter.regular,
    fontSize: 11,
    marginTop: Spacing.md,
    textAlign: "center",
  },
  pressed: {
    opacity: 0.75,
  },
  searchBar: {
    alignItems: "center",
    flexDirection: "row",
    gap: Spacing.sm,
    left: 0,
    paddingHorizontal: Spacing.md,
    position: "absolute",
    right: 0,
  },
  searchField: {
    alignItems: "center",
    backgroundColor: FluiColors.surface,
    borderRadius: BorderRadius.button,
    flex: 1,
    flexDirection: "row",
    gap: Spacing.sm,
    paddingHorizontal: Spacing.md,
  },
  searchInput: {
    color: FluiColors.text,
    flex: 1,
    fontFamily: FluiFonts.inter.regular,
    fontSize: 15,
    paddingVertical: Spacing.sm + 4,
  },
  sheet: {
    backgroundColor: FluiColors.background,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    bottom: 0,
    left: 0,
    position: "absolute",
    right: 0,
  },
  sheetCount: {
    color: FluiColors.mutedText,
    fontFamily: FluiFonts.inter.regular,
    fontSize: 12,
    marginTop: 2,
  },
  sheetHeader: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: Spacing.md,
  },
  sheetTitle: {
    color: FluiColors.text,
    fontFamily: FluiFonts.josefin.bold,
    fontSize: 20,
  },
  sheetTitles: {
    flex: 1,
  },
});
