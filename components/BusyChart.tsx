import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useEffect } from "react";
import { StyleSheet, Text, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withDelay,
  withTiming,
} from "react-native-reanimated";

import { BorderRadius, FluiColors, Motion, Spacing } from "@/constants/theme";
import type { Station } from "@/mocks/station";
import { getBusyColor, getBusyLabel, getCurrentBusy, getQuietWindows } from "@/utils/station";

const CHART_HEIGHT = 96;

export function BusyChart({ station }: { station: Station }) {
  const horaAtual = new Date().getHours();
  const movimentoAgora = getCurrentBusy(station);
  const janelas = getQuietWindows(station);

  const resumoAcessivel =
    `Movimento ao longo do dia. Agora: ${getBusyLabel(movimentoAgora).toLowerCase()}. ` +
    (janelas.length > 0
      ? `Períodos de menor movimento: ${janelas.map((j) => j.label).join(", ")}.`
      : "O movimento é parecido ao longo do dia.");

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.title} accessibilityRole="header">
          Movimento por horário
        </Text>
        <View style={[styles.nowBadge, { backgroundColor: getBusyColor(movimentoAgora) }]}>
          <Text style={styles.nowBadgeText}>Agora: {getBusyLabel(movimentoAgora)}</Text>
        </View>
      </View>

      <View
        accessible
        accessibilityLabel={resumoAcessivel}
        style={styles.chart}
      >
        {station.busyByHour.map((valor, hora) => (
          <Bar
            key={hora}
            value={valor}
            hour={hora}
            isNow={hora === horaAtual}
            index={hora}
          />
        ))}
      </View>

      <View style={styles.axis} importantForAccessibility="no-hide-descendants">
        {[0, 6, 12, 18, 23].map((hora) => (
          <Text key={hora} style={styles.axisLabel}>
            {String(hora).padStart(2, "0")}h
          </Text>
        ))}
      </View>

      {janelas.length > 0 && (
        <View style={styles.quietBox}>
          <MaterialCommunityIcons
            name="clock-check-outline"
            size={18}
            color={FluiColors.busyLow}
          />
          <View style={styles.quietTexts}>
            <Text style={styles.quietTitle}>Períodos de menor movimento</Text>
            <Text style={styles.quietValue}>
              {janelas.map((janela) => janela.label).join("  ·  ")}
            </Text>
          </View>
        </View>
      )}
    </View>
  );
}

function Bar({
  value,
  hour,
  isNow,
  index,
}: {
  value: number;
  hour: number;
  isNow: boolean;
  index: number;
}) {
  const altura = useSharedValue(0);
  const reduzirMovimento = useReducedMotion();
  const alvo = Math.max(4, (value / 100) * CHART_HEIGHT);

  useEffect(() => {
    if (reduzirMovimento) {
      altura.value = alvo;
      return;
    }
    altura.value = withDelay(index * 18, withTiming(alvo, { duration: Motion.base }));
  }, [altura, alvo, index, reduzirMovimento]);

  const animatedStyle = useAnimatedStyle(() => ({ height: altura.value }));

  return (
    <View style={styles.barSlot}>
      <Animated.View
        style={[
          styles.bar,
          { backgroundColor: getBusyColor(value) },
          isNow && styles.barNow,
          animatedStyle,
        ]}
      />
      {isNow && <Text style={styles.barNowLabel}>{String(hour).padStart(2, "0")}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  axis: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: Spacing.xs,
  },
  axisLabel: {
    color: FluiColors.mutedText,
    fontSize: 10,
  },
  bar: {
    borderRadius: 3,
    width: "100%",
  },
  barNow: {
    borderColor: FluiColors.text,
    borderWidth: 1.5,
  },
  barNowLabel: {
    color: FluiColors.text,
    fontSize: 8,
    marginTop: 2,
  },
  barSlot: {
    alignItems: "center",
    flex: 1,
    justifyContent: "flex-end",
  },
  chart: {
    alignItems: "flex-end",
    flexDirection: "row",
    gap: 2,
    height: CHART_HEIGHT + 12,
    marginTop: Spacing.md,
  },
  container: {
    backgroundColor: FluiColors.card,
    borderRadius: BorderRadius.card,
    marginTop: Spacing.md,
    padding: Spacing.md,
  },
  headerRow: {
    alignItems: "center",
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.sm,
    justifyContent: "space-between",
  },
  nowBadge: {
    borderRadius: 10,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
  },
  nowBadgeText: {
    color: "#FFFFFF",
    fontSize: 11,
    fontWeight: "600",
  },
  quietBox: {
    alignItems: "center",
    backgroundColor: FluiColors.livreBg,
    borderRadius: BorderRadius.card,
    flexDirection: "row",
    gap: Spacing.sm,
    marginTop: Spacing.md,
    padding: Spacing.sm + 4,
  },
  quietTexts: {
    flex: 1,
  },
  quietTitle: {
    color: FluiColors.livreText,
    fontSize: 12,
  },
  quietValue: {
    color: FluiColors.text,
    fontSize: 14,
    fontWeight: "600",
    marginTop: 2,
  },
  title: {
    color: FluiColors.text,
    fontSize: 16,
    fontWeight: "700",
  },
});
