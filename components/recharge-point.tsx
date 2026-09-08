import { MaterialCommunityIcons, MaterialIcons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { Platform, Pressable, StyleSheet, Text, View } from "react-native";
import Animated, {
  FadeInDown,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withSpring,
  withTiming,
} from "react-native-reanimated";

import { BorderRadius, FluiColors, FluiFonts, Motion, Spacing } from "@/constants/theme";
import {
  AMENITY_ICONS,
  AMENITY_LABELS,
  CONNECTOR_LABELS,
  type Station,
} from "@/mocks/station";
import {
  formatDistance,
  formatPrice,
  getAvailableChargers,
  getConnectorTypes,
  getMaxPowerKw,
  getStationStatus,
  getStatusColor,
  getStatusLabel,
} from "@/utils/station";

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

type RechargePointProps = {
  station: Station;
  stopEstimate?: { energyKwh: number; cost: number; reason: string };
  selected?: boolean;
  index?: number;
  onPress: (station: Station) => void;
};


export default function RechargePoint({
  station,
  stopEstimate,
  selected = false,
  index = 0,
  onPress,
}: RechargePointProps) {
  const scale = useSharedValue(1);
  const reduzirMovimento = useReducedMotion();

  const status = getStationStatus(station);
  const disponiveis = getAvailableChargers(station);
  const total = station.chargers.length;
  const conectores = getConnectorTypes(station);
  const borderColor = getStatusColor(station);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  function handlePressIn() {
    if (reduzirMovimento) return;
    scale.value = withTiming(0.98, { duration: Motion.fast });
  }

  function handlePressOut() {
    scale.value = withSpring(1, Motion.spring);
  }

  function handlePress() {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    }
    onPress(station);
  }

  const rotuloAcessivel =
    `${station.name}. ${getStatusLabel(station)}. ` +
    `${disponiveis} de ${total} carregadores livres. ` +
    `Até ${getMaxPowerKw(station)} quilowatts. ` +
    `${formatDistance(station.distanceKm)}, cerca de ${station.etaMinutes} minutos. ` +
    `Nota ${station.rating.toFixed(1).replace(".", ",")} de 5.` +
    (stopEstimate ? ` Nesta parada: ${stopEstimate.reason}.` : "") +
    (station.sponsored ? " Ponto patrocinado." : "");

  return (
    <AnimatedPressable
      accessibilityRole="button"
      accessibilityLabel={rotuloAcessivel}
      accessibilityHint="Abre a ficha completa do ponto de recarga"
      accessibilityState={{ selected }}
      entering={
        reduzirMovimento
          ? undefined
          : FadeInDown.delay(index * 60).duration(Motion.base)
      }
      onPress={handlePress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={[
        styles.card,
        { borderLeftColor: borderColor },
        selected && styles.cardSelected,
        animatedStyle,
      ]}
    >
      <View style={styles.headerRow}>
        <View style={styles.headerTexts}>
          <Text numberOfLines={1} style={styles.name}>
            {station.name}
          </Text>
          <Text style={styles.subInfo}>
            {formatDistance(station.distanceKm)} · {station.etaMinutes} min ·{" "}
            {station.location}
          </Text>
        </View>

        <Badge station={station} />
      </View>

      <View style={styles.statsRow}>
        <MaterialIcons name="star" size={14} color={FluiColors.star} />
        <Text style={styles.statsText}>
          {station.rating.toFixed(1).replace(".", ",")}
        </Text>
        <Text style={styles.statsDivider}>·</Text>
        <Text style={[styles.statsText, status === "fechado" && styles.statsMuted]}>
          {disponiveis}/{total} livres
        </Text>
        <Text style={styles.statsDivider}>·</Text>
        <Text style={styles.statsText}>até {getMaxPowerKw(station)} kW</Text>
      </View>

      <View style={styles.pillsRow}>
        {conectores.map((connector) => (
          <View key={connector} style={styles.pill}>
            <MaterialCommunityIcons
              name="ev-plug-type2"
              size={12}
              color={FluiColors.mutedText}
            />
            <Text style={styles.pillText}>{CONNECTOR_LABELS[connector]}</Text>
          </View>
        ))}

        {station.amenities.slice(0, 2).map((amenity) => (
          <View key={amenity} style={styles.pill}>
            <MaterialCommunityIcons
              name={AMENITY_ICONS[amenity] as never}
              size={12}
              color={FluiColors.mutedText}
            />
            <Text style={styles.pillText}>{AMENITY_LABELS[amenity]}</Text>
          </View>
        ))}
      </View>

      <Text style={styles.priceLine}>
        {formatPrice(station.priceKwh)}
        <Text style={styles.priceUnit}> / kWh</Text>
      </Text>

      {stopEstimate && (
        <View style={styles.estimate}>
          <MaterialCommunityIcons
            name="timer-sand"
            size={13}
            color={FluiColors.primaryLight}
          />
          <Text style={styles.estimateText}>{stopEstimate.reason}</Text>
        </View>
      )}
    </AnimatedPressable>
  );
}

function Badge({ station }: { station: Station }) {
  const status = getStationStatus(station);

  if (station.sponsored) {
    return (
      <View style={[styles.badge, { backgroundColor: FluiColors.sponsoredBg }]}>
        <Text style={[styles.badgeText, { color: FluiColors.sponsoredText }]}>
          Patrocinado
        </Text>
      </View>
    );
  }

  if (status === "fechado") {
    return (
      <View style={[styles.badge, { backgroundColor: "#3a1f22" }]}>
        <Text style={[styles.badgeText, { color: FluiColors.markerClosed }]}>
          Fechado
        </Text>
      </View>
    );
  }

  if (status === "lotado") {
    return (
      <View style={[styles.badge, { backgroundColor: "#3a2e10" }]}>
        <Text style={[styles.badgeText, { color: FluiColors.busyMedium }]}>
          Todos ocupados
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.badge, { backgroundColor: FluiColors.livreBg }]}>
      <Text style={[styles.badgeText, { color: FluiColors.livreText }]}>Livre</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    borderRadius: 10,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
  },
  badgeText: {
    fontFamily: FluiFonts.inter.medium,
    fontSize: 10,
  },
  card: {
    backgroundColor: FluiColors.card,
    borderBottomRightRadius: BorderRadius.card,
    borderLeftWidth: 4,
    borderTopRightRadius: BorderRadius.card,
    marginTop: Spacing.sm + 4,
    padding: Spacing.md - 2,
  },
  cardSelected: {
    backgroundColor: "#223a46",
    borderLeftWidth: 6,
  },
  estimate: {
    alignItems: "center",
    borderTopColor: FluiColors.surfaceAlt,
    borderTopWidth: StyleSheet.hairlineWidth,
    flexDirection: "row",
    gap: 6,
    marginTop: Spacing.sm,
    paddingTop: Spacing.sm,
  },
  estimateText: {
    color: FluiColors.primaryLight,
    flex: 1,
    fontFamily: FluiFonts.inter.medium,
    fontSize: 12,
  },
  headerRow: {
    alignItems: "flex-start",
    flexDirection: "row",
    gap: Spacing.sm,
    justifyContent: "space-between",
  },
  headerTexts: {
    flex: 1,
  },
  name: {
    color: FluiColors.text,
    fontFamily: FluiFonts.inter.semiBold,
    fontSize: 16,
  },
  pill: {
    alignItems: "center",
    backgroundColor: FluiColors.chipInactive,
    borderColor: FluiColors.surfaceAlt,
    borderRadius: 12,
    borderWidth: 1,
    flexDirection: "row",
    gap: 4,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
  },
  pillText: {
    color: FluiColors.mutedText,
    fontFamily: FluiFonts.inter.regular,
    fontSize: 11,
  },
  pillsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.sm - 2,
    marginTop: Spacing.sm,
  },
  priceLine: {
    color: FluiColors.text,
    fontFamily: FluiFonts.inter.semiBold,
    fontSize: 16,
    marginTop: Spacing.sm,
  },
  priceUnit: {
    color: FluiColors.mutedText,
    fontFamily: FluiFonts.inter.regular,
    fontSize: 12,
  },
  statsDivider: {
    color: FluiColors.mutedText,
    fontSize: 12,
  },
  statsMuted: {
    color: FluiColors.mutedText,
  },
  statsRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: 6,
    marginTop: Spacing.sm,
  },
  statsText: {
    color: FluiColors.text,
    fontFamily: FluiFonts.inter.medium,
    fontSize: 13,
  },
  subInfo: {
    color: FluiColors.mutedText,
    fontFamily: FluiFonts.inter.regular,
    fontSize: 12,
    marginTop: 2,
  },
});
