import { MaterialCommunityIcons, MaterialIcons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { Image } from "expo-image";
import { router, useLocalSearchParams } from "expo-router";
import { ComponentProps, ReactNode, useState } from "react";
import {
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from "react-native";
import Animated, {
  FadeIn,
  FadeInDown,
  useReducedMotion,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { BackButton } from "@/components/BackButton";
import { BusyChart } from "@/components/BusyChart";
import {
  BorderRadius,
  FluiColors,
  FluiFonts,
  Motion,
  Spacing,
} from "@/constants/theme";
import { useFavorites } from "@/hooks/use-favorites";
import { ReviewSheet } from "@/components/ReviewSheet";
import { mediaGeral, useReviews } from "@/hooks/use-reviews";
import {
  AMENITY_ICONS,
  AMENITY_LABELS,
  CONNECTOR_LABELS,
  getStationById,
  stationsMock,
  type Charger,
} from "@/mocks/station";
import {
  formatDistance,
  formatMeters,
  formatOpeningHours,
  formatPrice,
  getAvailableChargers,
  getBusyColor,
  getCurrentBusy,
  getMaxPowerKw,
  getStatusColor,
  getStatusLabel,
  getWeeklySchedule,
  isOpenNow,
} from "@/utils/station";

export default function PontoRecargaScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const station = getStationById(id) ?? stationsMock[0];

  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const reduzirMovimento = useReducedMotion();

  const [fotoAtual, setFotoAtual] = useState(0);
  const { isFavorito, alternar } = useFavorites();
  const favorito = isFavorito(station.id);
  const { minhaAvaliacao } = useReviews();
  const avaliacao = minhaAvaliacao(station.id);
  const [avaliarVisivel, setAvaliarVisivel] = useState(false);

  const aberto = isOpenNow(station);
  const disponiveis = getAvailableChargers(station);
  const movimentoAgora = getCurrentBusy(station);
  const semana = getWeeklySchedule(station);

  function alternarFavorito() {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => { });
    }
    alternar(station.id);
  }

  return (
    <View style={styles.root}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.headerImage}>
          <ScrollView
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onMomentumScrollEnd={(event) =>
              setFotoAtual(Math.round(event.nativeEvent.contentOffset.x / width))
            }
          >
            {station.photos.map((foto, index) => (
              <Image
                key={index}
                accessibilityLabel={`Foto ${index + 1} de ${station.photos.length} do ponto ${station.name}`}
                contentFit="cover"
                source={foto}
                style={{ height: 240, width }}
                transition={reduzirMovimento ? 0 : Motion.base}
              />
            ))}
          </ScrollView>

          <BackButton />

          <View
            style={[styles.dotsRow, { bottom: Spacing.md }]}
            importantForAccessibility="no-hide-descendants"
          >
            {station.photos.map((_, index) => (
              <View
                key={index}
                style={[styles.dot, index === fotoAtual && styles.dotActive]}
              />
            ))}
          </View>
        </View>

        <View style={styles.statusBadgeWrap}>
          <Animated.View
            entering={reduzirMovimento ? undefined : FadeIn.duration(Motion.base)}
            style={[styles.statusBadge, { backgroundColor: getBusyColor(movimentoAgora) }]}
          >
            <Text style={styles.statusBadgeText}>
              {aberto ? getStatusLabel(station) : "Fechado agora"}
            </Text>
          </Animated.View>
        </View>

        <View style={styles.body}>
          <Text style={styles.title} accessibilityRole="header">
            {station.title}
          </Text>

          <View style={styles.locationRow}>
            <MaterialIcons color={FluiColors.mutedText} name="location-on" size={14} />
            <Text style={styles.locationText}>
              {station.address} · {station.location}
            </Text>
          </View>

          <View style={styles.metaRow}>
            <View
              style={[styles.openDot, { backgroundColor: getStatusColor(station) }]}
            />
            <Text style={styles.metaText}>{aberto ? "Aberto" : "Fechado"}</Text>
            <Text style={styles.metaSeparator}>·</Text>
            <Text style={styles.metaText}>{formatOpeningHours(station)}</Text>
            <Text style={styles.metaSeparator}>·</Text>
            <Text style={styles.metaText}>
              {formatDistance(station.distanceKm)} · {station.etaMinutes} min
            </Text>
          </View>

          <View
            accessible
            accessibilityLabel={`Nota ${station.rating.toFixed(1).replace(".", ",")} de 5, em ${station.reviewsCount} avaliações`}
            style={styles.ratingRow}
          >
            <MaterialIcons color={FluiColors.star} name="star" size={16} />
            <Text style={styles.ratingText}>
              {station.rating.toFixed(1).replace(".", ",")} ({station.reviewsCount}{" "}
              avaliações)
            </Text>
          </View>

          <View style={styles.actionsRow}>
            <ActionButton
              icon="directions"
              label="Rotas"
              onPress={() => router.push({ pathname: "/em-construcao", params: { title: "Rotas" } })}
            />
            <ActionButton
              icon={favorito ? "favorite" : "favorite-border"}
              label={favorito ? "Favorito" : "Favoritar"}
              active={favorito}
              onPress={alternarFavorito}
            />
            <ActionButton
              icon="share"
              label="Compartilhar"
              onPress={() => router.push({ pathname: "/em-construcao", params: { title: "Compartilhar" } })}
            />
          </View>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={
              avaliacao
                ? `Editar sua avaliação, ${mediaGeral(avaliacao.notas).toFixed(1).replace(".", ",")} de 5`
                : "Avaliar este ponto de recarga"
            }
            onPress={() => setAvaliarVisivel(true)}
            style={({ pressed }) => [styles.reviewButton, pressed && styles.pressed]}
          >
            <MaterialIcons
              color={FluiColors.star}
              name={avaliacao ? "star" : "star-border"}
              size={18}
            />
            <Text style={styles.reviewButtonText}>
              {avaliacao
                ? `Sua nota: ${mediaGeral(avaliacao.notas).toFixed(1).replace(".", ",")}`
                : "Avaliar este ponto"}
            </Text>
          </Pressable>

          <View style={styles.summaryRow}>
            <SummaryCard
              icon="ev-station"
              value={`${disponiveis}/${station.chargers.length}`}
              label="Carregadores livres"
              highlight={disponiveis > 0}
            />
            <SummaryCard
              icon="lightning-bolt"
              value={`${getMaxPowerKw(station)} kW`}
              label="Potência máxima"
            />
            <SummaryCard
              icon="cash"
              value={formatPrice(station.priceKwh)}
              label="Por kWh"
            />
          </View>

          <Text style={styles.about}>{station.about}</Text>

          <Section title="Carregadores disponíveis">
            {station.chargers.map((charger, index) => (
              <ChargerRow key={charger.id} charger={charger} index={index} />
            ))}
          </Section>

          <BusyChart station={station} />

          <Section title="Horários de funcionamento">
            {semana.map((dia) => (
              <View
                key={dia.weekday}
                style={[styles.scheduleRow, dia.isToday && styles.scheduleToday]}
              >
                <Text
                  style={[styles.scheduleDay, dia.isToday && styles.scheduleTodayText]}
                >
                  {dia.label}
                  {dia.isToday ? " (hoje)" : ""}
                </Text>
                <Text
                  style={[styles.scheduleHours, dia.isToday && styles.scheduleTodayText]}
                >
                  {dia.hours}
                </Text>
              </View>
            ))}
          </Section>

          <Section title="Comodidades no local">
            <View style={styles.amenitiesGrid}>
              {station.amenities.map((amenity) => (
                <View key={amenity} style={styles.amenityPill}>
                  <MaterialCommunityIcons
                    name={AMENITY_ICONS[amenity] as never}
                    size={14}
                    color={FluiColors.primary}
                  />
                  <Text style={styles.amenityText}>{AMENITY_LABELS[amenity]}</Text>
                </View>
              ))}
            </View>
          </Section>

          <Section title="O que tem por perto">
            {station.nearbyPlaces.map((lugar) => (
              <View
                key={lugar.name}
                accessible
                accessibilityLabel={`${lugar.name}, ${AMENITY_LABELS[lugar.amenity]}, a ${formatMeters(lugar.distanceMeters).toLowerCase()}`}
                style={styles.nearbyRow}
              >
                <View style={styles.nearbyIcon}>
                  <MaterialCommunityIcons
                    name={AMENITY_ICONS[lugar.amenity] as never}
                    size={16}
                    color={FluiColors.text}
                  />
                </View>
                <View style={styles.nearbyTexts}>
                  <Text style={styles.nearbyName}>{lugar.name}</Text>
                  <Text style={styles.nearbyCategory}>
                    {AMENITY_LABELS[lugar.amenity]}
                  </Text>
                </View>
                <Text style={styles.nearbyDistance}>
                  {formatMeters(lugar.distanceMeters)}
                </Text>
              </View>
            ))}
          </Section>

          <Section title="Acessibilidade">
            <BulletList items={station.accessibility} />
          </Section>

          <Section title="Formas de pagamento">
            <BulletList items={station.paymentMethods} />
          </Section>
        </View>
      </ScrollView>

      <View style={[styles.bottomBar, { paddingBottom: insets.bottom + Spacing.sm }]}>
        <View style={styles.bottomTexts}>
          <Text style={styles.bottomLabel}>Estimativa da parada</Text>
          <Text style={styles.bottomValue}>
            {formatPrice(station.priceKwh * 40)} · ~{station.etaMinutes + 20} min
          </Text>
        </View>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Iniciar rota até este ponto de recarga"
          onPress={() => router.push({ pathname: "/em-construcao", params: { title: "Rotas" } })}
          style={({ pressed }) => [styles.bottomButton, pressed && styles.pressed]}
        >
          <MaterialIcons name="navigation" size={18} color={FluiColors.text} />
          <Text style={styles.bottomButtonText}>Traçar rota</Text>
        </Pressable>
      </View>
            <ReviewSheet
        visible={avaliarVisivel}
        stationId={station.id}
        stationName={station.name}
        onClose={() => setAvaliarVisivel(false)}
      />
    </View>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle} accessibilityRole="header">
        {title}
      </Text>
      {children}
    </View>
  );
}

function ActionButton({
  icon,
  label,
  active,
  onPress,
}: {
  icon: ComponentProps<typeof MaterialIcons>["name"];
  label: string;
  active?: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ selected: active }}
      onPress={onPress}
      style={({ pressed }) => [
        styles.actionButton,
        active && styles.actionButtonActive,
        pressed && styles.pressed,
      ]}
    >
      <MaterialIcons color={FluiColors.text} name={icon} size={16} />
      <Text style={styles.actionButtonLabel}>{label}</Text>
    </Pressable>
  );
}

function SummaryCard({
  icon,
  value,
  label,
  highlight,
}: {
  icon: string;
  value: string;
  label: string;
  highlight?: boolean;
}) {
  return (
    <View
      accessible
      accessibilityLabel={`${label}: ${value}`}
      style={styles.summaryCard}
    >
      <MaterialCommunityIcons
        name={icon as never}
        size={18}
        color={highlight ? FluiColors.markerLivre : FluiColors.primary}
      />
      <Text style={styles.summaryValue}>{value}</Text>
      <Text style={styles.summaryLabel}>{label}</Text>
    </View>
  );
}

const STATUS_CARREGADOR = {
  livre: { label: "Livre", color: FluiColors.markerLivre },
  ocupado: { label: "Ocupado", color: FluiColors.busyMedium },
  manutencao: { label: "Em manutenção", color: FluiColors.markerClosed },
};

function ChargerRow({ charger, index }: { charger: Charger; index: number }) {
  const reduzirMovimento = useReducedMotion();
  const status = STATUS_CARREGADOR[charger.status];

  return (
    <Animated.View
      accessible
      accessibilityLabel={`Carregador ${CONNECTOR_LABELS[charger.connector]}, ${charger.powerKw} quilowatts, corrente ${charger.current}, ${status.label}`}
      entering={
        reduzirMovimento ? undefined : FadeInDown.delay(index * 60).duration(Motion.base)
      }
      style={styles.chargerRow}
    >
      <View style={[styles.chargerIcon, { borderColor: status.color }]}>
        <MaterialCommunityIcons
          name={charger.current === "DC" ? "lightning-bolt" : "power-plug"}
          size={18}
          color={status.color}
        />
      </View>

      <View style={styles.chargerTexts}>
        <Text style={styles.chargerConnector}>{CONNECTOR_LABELS[charger.connector]}</Text>
        <Text style={styles.chargerDetail}>
          {charger.powerKw} kW · {charger.current === "DC" ? "Corrente contínua" : "Corrente alternada"}
        </Text>
      </View>

      <View style={[styles.chargerBadge, { borderColor: status.color }]}>
        <Text style={[styles.chargerBadgeText, { color: status.color }]}>
          {status.label}
        </Text>
      </View>
    </Animated.View>
  );
}

function BulletList({ items }: { items: string[] }) {
  return (
    <View style={styles.list}>
      {items.map((item) => (
        <View key={item} style={styles.listItem}>
          <View style={styles.bullet} />
          <Text style={styles.listText}>{item}</Text>
        </View>
      ))}
    </View>
  );
}


const styles = StyleSheet.create({
  about: {
    color: FluiColors.mutedText,
    fontFamily: FluiFonts.inter.regular,
    fontSize: 13,
    lineHeight: 19,
    marginTop: Spacing.md,
  },
  actionButton: {
    alignItems: "center",
    backgroundColor: FluiColors.primaryDark,
    borderRadius: BorderRadius.button,
    flex: 1,
    flexDirection: "row",
    gap: 6,
    justifyContent: "center",
    minHeight: 44,
  },
  actionButtonActive: {
    backgroundColor: FluiColors.primary,
  },
  actionButtonLabel: {
    color: FluiColors.text,
    fontFamily: FluiFonts.inter.medium,
    fontSize: 12,
  },
  actionsRow: {
    flexDirection: "row",
    gap: Spacing.sm,
    marginTop: Spacing.md,
  },
  amenitiesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.sm,
    marginTop: Spacing.sm,
  },
  amenityPill: {
    alignItems: "center",
    backgroundColor: FluiColors.card,
    borderRadius: BorderRadius.button,
    flexDirection: "row",
    gap: 6,
    paddingHorizontal: Spacing.md - 4,
    paddingVertical: Spacing.sm,
  },
  amenityText: {
    color: FluiColors.text,
    fontFamily: FluiFonts.inter.regular,
    fontSize: 12,
  },
  body: {
    paddingHorizontal: Spacing.lg,
  },
  bottomBar: {
    alignItems: "center",
    backgroundColor: FluiColors.surface,
    borderTopColor: FluiColors.surfaceAlt,
    borderTopWidth: StyleSheet.hairlineWidth,
    flexDirection: "row",
    gap: Spacing.md,
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.sm,
  },
  bottomButton: {
    alignItems: "center",
    backgroundColor: FluiColors.primary,
    borderRadius: BorderRadius.button,
    flexDirection: "row",
    gap: 6,
    minHeight: 46,
    paddingHorizontal: Spacing.lg,
  },
  bottomButtonText: {
    color: FluiColors.text,
    fontFamily: FluiFonts.inter.semiBold,
    fontSize: 14,
  },
  bottomLabel: {
    color: FluiColors.mutedText,
    fontFamily: FluiFonts.inter.regular,
    fontSize: 11,
  },
  bottomTexts: {
    flex: 1,
  },
  bottomValue: {
    color: FluiColors.text,
    fontFamily: FluiFonts.inter.semiBold,
    fontSize: 15,
    marginTop: 2,
  },
  bullet: {
    backgroundColor: FluiColors.primary,
    borderRadius: 2,
    height: 4,
    marginTop: 7,
    width: 4,
  },
  chargerBadge: {
    borderRadius: 10,
    borderWidth: 1,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 3,
  },
  chargerBadgeText: {
    fontFamily: FluiFonts.inter.medium,
    fontSize: 10,
  },
  chargerConnector: {
    color: FluiColors.text,
    fontFamily: FluiFonts.inter.semiBold,
    fontSize: 14,
  },
  chargerDetail: {
    color: FluiColors.mutedText,
    fontFamily: FluiFonts.inter.regular,
    fontSize: 12,
    marginTop: 2,
  },
  chargerIcon: {
    alignItems: "center",
    borderRadius: 18,
    borderWidth: 1.5,
    height: 36,
    justifyContent: "center",
    width: 36,
  },
  chargerRow: {
    alignItems: "center",
    backgroundColor: FluiColors.card,
    borderRadius: BorderRadius.card,
    flexDirection: "row",
    gap: Spacing.sm + 4,
    marginTop: Spacing.sm,
    padding: Spacing.sm + 4,
  },
  chargerTexts: {
    flex: 1,
  },
  dot: {
    backgroundColor: "rgba(255,255,255,0.5)",
    borderRadius: 3,
    height: 6,
    width: 6,
  },
  dotActive: {
    backgroundColor: FluiColors.text,
    width: 16,
  },
  dotsRow: {
    alignSelf: "center",
    flexDirection: "row",
    gap: 6,
    position: "absolute",
  },
  headerImage: {
    height: 240,
    width: "100%",
  },
  list: {
    gap: 6,
    marginTop: Spacing.sm,
  },
  listItem: {
    flexDirection: "row",
    gap: Spacing.sm,
  },
  listText: {
    color: FluiColors.mutedText,
    flex: 1,
    fontFamily: FluiFonts.inter.regular,
    fontSize: 13,
    lineHeight: 18,
  },
  locationRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: 4,
    marginTop: 4,
  },
  locationText: {
    color: FluiColors.mutedText,
    flex: 1,
    fontFamily: FluiFonts.inter.regular,
    fontSize: 12,
  },
  metaRow: {
    alignItems: "center",
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    marginTop: Spacing.sm,
  },
  metaSeparator: {
    color: FluiColors.mutedText,
    fontSize: 12,
  },
  metaText: {
    color: FluiColors.mutedText,
    fontFamily: FluiFonts.inter.regular,
    fontSize: 12,
  },
  nearbyCategory: {
    color: FluiColors.mutedText,
    fontFamily: FluiFonts.inter.regular,
    fontSize: 11,
    marginTop: 2,
  },
  nearbyDistance: {
    color: FluiColors.primary,
    fontFamily: FluiFonts.inter.medium,
    fontSize: 12,
  },
  nearbyIcon: {
    alignItems: "center",
    backgroundColor: FluiColors.chipInactive,
    borderRadius: 16,
    height: 32,
    justifyContent: "center",
    width: 32,
  },
  nearbyName: {
    color: FluiColors.text,
    fontFamily: FluiFonts.inter.medium,
    fontSize: 13,
  },
  nearbyRow: {
    alignItems: "center",
    borderBottomColor: FluiColors.surfaceAlt,
    borderBottomWidth: StyleSheet.hairlineWidth,
    flexDirection: "row",
    gap: Spacing.sm + 4,
    paddingVertical: Spacing.sm + 2,
  },
  nearbyTexts: {
    flex: 1,
  },
  openDot: {
    borderRadius: 4,
    height: 8,
    width: 8,
  },
  pressed: {
    opacity: 0.8,
  },
  ratingRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: 6,
    marginTop: Spacing.sm,
  },
  ratingText: {
    color: FluiColors.text,
    fontFamily: FluiFonts.inter.medium,
    fontSize: 13,
  },
    reviewButton: {
    alignItems: "center",
    backgroundColor: FluiColors.card,
    borderRadius: BorderRadius.button,
    flexDirection: "row",
    gap: 6,
    justifyContent: "center",
    marginTop: Spacing.sm,
    minHeight: 44,
  },
  reviewButtonText: {
    color: FluiColors.text,
    fontFamily: FluiFonts.inter.medium,
    fontSize: 13,
  },
  root: {
    backgroundColor: FluiColors.background,
    flex: 1,
  },
  scheduleDay: {
    color: FluiColors.mutedText,
    fontFamily: FluiFonts.inter.regular,
    fontSize: 13,
  },
  scheduleHours: {
    color: FluiColors.mutedText,
    fontFamily: FluiFonts.inter.regular,
    fontSize: 13,
  },
  scheduleRow: {
    borderRadius: 6,
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: Spacing.sm,
    paddingVertical: 7,
  },
  scheduleToday: {
    backgroundColor: FluiColors.card,
  },
  scheduleTodayText: {
    color: FluiColors.text,
    fontFamily: FluiFonts.inter.semiBold,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: Spacing.xl,
  },
  section: {
    marginTop: Spacing.lg,
  },
  sectionTitle: {
    color: FluiColors.text,
    fontFamily: FluiFonts.inter.semiBold,
    fontSize: 16,
  },
  statusBadge: {
    borderRadius: BorderRadius.button,
    paddingHorizontal: Spacing.md,
    paddingVertical: 6,
  },
  statusBadgeText: {
    color: "#FFFFFF",
    fontFamily: FluiFonts.inter.semiBold,
    fontSize: 11,
  },
  statusBadgeWrap: {
    alignItems: "center",
    marginTop: -14,
    zIndex: 2,
  },
  summaryCard: {
    alignItems: "center",
    backgroundColor: FluiColors.card,
    borderRadius: BorderRadius.card,
    flex: 1,
    gap: 4,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.md - 4,
  },
  summaryLabel: {
    color: FluiColors.mutedText,
    fontFamily: FluiFonts.inter.regular,
    fontSize: 10,
    textAlign: "center",
  },
  summaryRow: {
    flexDirection: "row",
    gap: Spacing.sm,
    marginTop: Spacing.md,
  },
  summaryValue: {
    color: FluiColors.text,
    fontFamily: FluiFonts.inter.semiBold,
    fontSize: 15,
  },
  title: {
    color: FluiColors.text,
    fontFamily: FluiFonts.josefin.bold,
    fontSize: 20,
    marginTop: Spacing.md,
  },
});
