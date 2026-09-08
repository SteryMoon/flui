import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import Animated, { FadeInDown, useReducedMotion } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Chip } from "@/components/Chip";
import {
  BorderRadius,
  FluiColors,
  FluiFonts,
  Motion,
  Spacing,
} from "@/constants/theme";
import { stationsMock } from "@/mocks/station";
import { formatDistance } from "@/utils/station";

/** Dados da conta — nesta etapa ainda não há back-end nem login real. */
const USUARIO = {
  nome: "Stephanie da Silva Cruz",
  email: "stephanie.cruz@email.com",
  carregamentos: 18,
  kwhCarregados: 496,
  co2Evitado: 124,
};

/**
 * Os dois veículos são propositalmente opostos: um carro urbano, que aceita
 * pouca potência e por isso quase nunca aproveita um carregador ultrarrápido,
 * e um carro de viagem, que aceita muita. É o que dá sentido à recomendação
 * por intenção de parada na tela de busca.
 */
const VEICULOS = [
  {
    id: "renault-kwid",
    nome: "Renault Kwid E-Tech",
    detalhe: "2025 · Cinza · RKE-2H07",
    autonomiaKm: 185,
    cargaMaximaKw: 30,
    conector: "CCS2",
    paradaSugeridaKm: 130,
  },
  {
    id: "byd-seal",
    nome: "BYD Seal",
    detalhe: "2025 · Azul Atlântico · BSE-5C12",
    autonomiaKm: 570,
    cargaMaximaKw: 150,
    conector: "CCS2",
    paradaSugeridaKm: 400,
  },
];

type Aba = "carros" | "viagens" | "avaliacoes";

export default function PerfilScreen() {
  const insets = useSafeAreaInsets();
  const reduzirMovimento = useReducedMotion();

  const [aba, setAba] = useState<Aba>("carros");
  const [veiculoAtivo, setVeiculoAtivo] = useState(VEICULOS[0].id);

  const veiculo = VEICULOS.find((item) => item.id === veiculoAtivo) ?? VEICULOS[0];

  /** Nesta etapa os favoritos são apenas os pontos patrocinados do mock. */
  const favoritos = stationsMock.filter((station) => station.sponsored);

  return (
    <ScrollView
      style={styles.root}
      contentContainerStyle={[
        styles.content,
        { paddingTop: insets.top + Spacing.md },
      ]}
      showsVerticalScrollIndicator={false}
    >
      {/* --------------------------- Cabeçalho --------------------------- */}
      <View style={styles.userCard}>
        <View style={styles.avatar}>
          <Ionicons name="person" size={22} color={FluiColors.text} />
        </View>
        <View style={styles.userTexts}>
          <Text style={styles.userName} accessibilityRole="header">
            {USUARIO.nome}
          </Text>
          <Text style={styles.userEmail}>{USUARIO.email}</Text>
        </View>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Editar perfil"
          onPress={() =>
            router.push({ pathname: "/em-construcao", params: { title: "Perfil" } })
          }
          hitSlop={8}
        >
          <Ionicons name="create-outline" size={20} color={FluiColors.mutedText} />
        </Pressable>
      </View>

      {/* ---------------------------- Números ---------------------------- */}
      <View style={styles.statsRow}>
        <StatCard valor={`${USUARIO.carregamentos}`} rotulo="Carregamentos" />
        <StatCard valor={`${USUARIO.kwhCarregados}`} rotulo="kWh carregados" />
        <StatCard valor={`${USUARIO.co2Evitado} kg`} rotulo="CO₂ evitado" />
      </View>

      {/* ------------------------------ Abas ----------------------------- */}
      <View style={styles.tabsRow}>
        <Chip label="Carros" selected={aba === "carros"} onPress={() => setAba("carros")} />
        <Chip
          label="Viagens"
          selected={aba === "viagens"}
          onPress={() => setAba("viagens")}
        />
        <Chip
          label="Avaliações"
          selected={aba === "avaliacoes"}
          onPress={() => setAba("avaliacoes")}
        />
      </View>

      {aba === "carros" && (
        <Animated.View
          entering={reduzirMovimento ? undefined : FadeInDown.duration(Motion.base)}
        >
          <View style={styles.vehicleTabs}>
            {VEICULOS.map((item) => (
              <Chip
                key={item.id}
                label={item.nome}
                selected={item.id === veiculoAtivo}
                onPress={() => setVeiculoAtivo(item.id)}
              />
            ))}
          </View>

          <View style={styles.vehicleCard}>
            <View style={styles.vehicleHeader}>
              <MaterialCommunityIcons
                name="car-electric"
                size={26}
                color={FluiColors.primary}
              />
              <View style={styles.vehicleTexts}>
                <Text style={styles.vehicleName}>{veiculo.nome}</Text>
                <Text style={styles.vehicleDetail}>{veiculo.detalhe}</Text>
              </View>
            </View>

            <View style={styles.specsGrid}>
              <Spec
                icone="battery-charging-high"
                rotulo="Autonomia"
                valor={formatDistance(veiculo.autonomiaKm)}
              />
              <Spec
                icone="lightning-bolt"
                rotulo="Carga máxima"
                valor={`${veiculo.cargaMaximaKw} kW`}
              />
              <Spec icone="ev-plug-type2" rotulo="Conector" valor={veiculo.conector} />
              <Spec
                icone="map-marker-distance"
                rotulo="Parada sugerida"
                valor={`~${formatDistance(veiculo.paradaSugeridaKm)}`}
              />
            </View>
          </View>

          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Adicionar outro veículo"
            onPress={() =>
              router.push({ pathname: "/em-construcao", params: { title: "Veículos" } })
            }
            style={({ pressed }) => [styles.addButton, pressed && styles.pressed]}
          >
            <Ionicons name="add" size={18} color={FluiColors.text} />
            <Text style={styles.addButtonText}>Adicionar outro veículo</Text>
          </Pressable>
        </Animated.View>
      )}

      {aba === "viagens" && (
        <Animated.View
          entering={reduzirMovimento ? undefined : FadeInDown.duration(Motion.base)}
          style={styles.emptyBox}
        >
          <MaterialCommunityIcons
            name="map-clock-outline"
            size={36}
            color={FluiColors.mutedText}
          />
          <Text style={styles.emptyTitle}>Nenhuma viagem registrada</Text>
          <Text style={styles.emptyText}>
            O histórico de viagens chega na próxima etapa do projeto.
          </Text>
        </Animated.View>
      )}

      {aba === "avaliacoes" && (
        <Animated.View
          entering={reduzirMovimento ? undefined : FadeInDown.duration(Motion.base)}
          style={styles.emptyBox}
        >
          <MaterialCommunityIcons
            name="star-outline"
            size={36}
            color={FluiColors.mutedText}
          />
          <Text style={styles.emptyTitle}>Você ainda não avaliou pontos</Text>
          <Text style={styles.emptyText}>
            O sistema de avaliação entra na etapa seguinte.
          </Text>
        </Animated.View>
      )}

      {/* --------------------------- Favoritos --------------------------- */}
      <Text style={styles.sectionTitle} accessibilityRole="header">
        Meus favoritos
      </Text>

      {favoritos.map((station, index) => (
        <Animated.View
          key={station.id}
          entering={
            reduzirMovimento
              ? undefined
              : FadeInDown.delay(index * 70).duration(Motion.base)
          }
        >
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`${station.name}, ${station.location}. Abrir ficha.`}
            onPress={() =>
              router.push({ pathname: "/ponto-recarga", params: { id: station.id } })
            }
            style={({ pressed }) => [styles.favoriteRow, pressed && styles.pressed]}
          >
            <View style={styles.favoriteIcon}>
              <MaterialCommunityIcons
                name="ev-station"
                size={18}
                color={FluiColors.primary}
              />
            </View>
            <View style={styles.favoriteTexts}>
              <Text style={styles.favoriteName}>{station.name}</Text>
              <Text style={styles.favoriteDetail}>{station.location}</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={FluiColors.mutedText} />
          </Pressable>
        </Animated.View>
      ))}
    </ScrollView>
  );
}

/* -------------------------------------------------------------------------- */

function StatCard({ valor, rotulo }: { valor: string; rotulo: string }) {
  return (
    <View accessible accessibilityLabel={`${rotulo}: ${valor}`} style={styles.statCard}>
      <Text style={styles.statValue}>{valor}</Text>
      <Text style={styles.statLabel}>{rotulo}</Text>
    </View>
  );
}

function Spec({
  icone,
  rotulo,
  valor,
}: {
  icone: string;
  rotulo: string;
  valor: string;
}) {
  return (
    <View accessible accessibilityLabel={`${rotulo}: ${valor}`} style={styles.spec}>
      <MaterialCommunityIcons
        name={icone as never}
        size={16}
        color={FluiColors.mutedText}
      />
      <View>
        <Text style={styles.specLabel}>{rotulo}</Text>
        <Text style={styles.specValue}>{valor}</Text>
      </View>
    </View>
  );
}

/* -------------------------------------------------------------------------- */

const styles = StyleSheet.create({
  addButton: {
    alignItems: "center",
    backgroundColor: FluiColors.primary,
    borderRadius: BorderRadius.button,
    flexDirection: "row",
    gap: 6,
    justifyContent: "center",
    marginTop: Spacing.md,
    minHeight: 46,
  },
  addButtonText: {
    color: FluiColors.text,
    fontFamily: FluiFonts.inter.semiBold,
    fontSize: 14,
  },
  avatar: {
    alignItems: "center",
    backgroundColor: FluiColors.primaryDark,
    borderRadius: 22,
    height: 44,
    justifyContent: "center",
    width: 44,
  },
  content: {
    paddingBottom: Spacing.xl * 2,
    paddingHorizontal: Spacing.md,
  },
  emptyBox: {
    alignItems: "center",
    backgroundColor: FluiColors.card,
    borderRadius: BorderRadius.card,
    gap: 6,
    marginTop: Spacing.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xl,
  },
  emptyText: {
    color: FluiColors.mutedText,
    fontFamily: FluiFonts.inter.regular,
    fontSize: 12,
    textAlign: "center",
  },
  emptyTitle: {
    color: FluiColors.text,
    fontFamily: FluiFonts.inter.semiBold,
    fontSize: 15,
  },
  favoriteDetail: {
    color: FluiColors.mutedText,
    fontFamily: FluiFonts.inter.regular,
    fontSize: 12,
    marginTop: 2,
  },
  favoriteIcon: {
    alignItems: "center",
    backgroundColor: FluiColors.chipInactive,
    borderRadius: 18,
    height: 36,
    justifyContent: "center",
    width: 36,
  },
  favoriteName: {
    color: FluiColors.text,
    fontFamily: FluiFonts.inter.medium,
    fontSize: 14,
  },
  favoriteRow: {
    alignItems: "center",
    backgroundColor: FluiColors.card,
    borderRadius: BorderRadius.card,
    flexDirection: "row",
    gap: Spacing.sm + 4,
    marginTop: Spacing.sm,
    padding: Spacing.sm + 4,
  },
  favoriteTexts: {
    flex: 1,
  },
  pressed: {
    opacity: 0.8,
  },
  root: {
    backgroundColor: FluiColors.background,
    flex: 1,
  },
  sectionTitle: {
    color: FluiColors.text,
    fontFamily: FluiFonts.inter.semiBold,
    fontSize: 16,
    marginTop: Spacing.lg,
  },
  spec: {
    alignItems: "center",
    backgroundColor: FluiColors.background,
    borderRadius: BorderRadius.card,
    flexBasis: "47%",
    flexDirection: "row",
    flexGrow: 1,
    gap: Spacing.sm,
    padding: Spacing.sm + 2,
  },
  specLabel: {
    color: FluiColors.mutedText,
    fontFamily: FluiFonts.inter.regular,
    fontSize: 11,
  },
  specValue: {
    color: FluiColors.text,
    fontFamily: FluiFonts.inter.semiBold,
    fontSize: 13,
    marginTop: 2,
  },
  specsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.sm,
    marginTop: Spacing.md,
  },
  statCard: {
    alignItems: "center",
    backgroundColor: FluiColors.card,
    borderRadius: BorderRadius.card,
    flex: 1,
    gap: 4,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.md - 4,
  },
  statLabel: {
    color: FluiColors.mutedText,
    fontFamily: FluiFonts.inter.regular,
    fontSize: 10,
    textAlign: "center",
  },
  statValue: {
    color: FluiColors.text,
    fontFamily: FluiFonts.josefin.bold,
    fontSize: 18,
  },
  statsRow: {
    flexDirection: "row",
    gap: Spacing.sm,
    marginTop: Spacing.md,
  },
  tabsRow: {
    flexDirection: "row",
    gap: Spacing.sm,
    marginTop: Spacing.lg,
  },
  userCard: {
    alignItems: "center",
    backgroundColor: FluiColors.card,
    borderRadius: BorderRadius.card,
    flexDirection: "row",
    gap: Spacing.sm + 4,
    padding: Spacing.md - 2,
  },
  userEmail: {
    color: FluiColors.mutedText,
    fontFamily: FluiFonts.inter.regular,
    fontSize: 12,
    marginTop: 2,
  },
  userName: {
    color: FluiColors.text,
    fontFamily: FluiFonts.inter.semiBold,
    fontSize: 16,
  },
  userTexts: {
    flex: 1,
  },
  vehicleCard: {
    backgroundColor: FluiColors.card,
    borderRadius: BorderRadius.card,
    marginTop: Spacing.md,
    padding: Spacing.md,
  },
  vehicleDetail: {
    color: FluiColors.mutedText,
    fontFamily: FluiFonts.inter.regular,
    fontSize: 12,
    marginTop: 2,
  },
  vehicleHeader: {
    alignItems: "center",
    flexDirection: "row",
    gap: Spacing.sm + 4,
  },
  vehicleName: {
    color: FluiColors.text,
    fontFamily: FluiFonts.inter.semiBold,
    fontSize: 15,
  },
  vehicleTexts: {
    flex: 1,
  },
  vehicleTabs: {
    flexDirection: "row",
    gap: Spacing.sm,
    marginTop: Spacing.md,
  },
});
