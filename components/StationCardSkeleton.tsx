import { useEffect } from "react";
import { StyleSheet, View } from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated";

import { BorderRadius, FluiColors, Spacing } from "@/constants/theme";

/**
 * Esqueleto exibido enquanto a busca "carrega".
 * Sem o brilho pulsante quando o sistema pede menos movimento.
 */
export function StationCardSkeleton() {
  const progress = useSharedValue(0.4);
  const reduzirMovimento = useReducedMotion();

  useEffect(() => {
    if (reduzirMovimento) {
      progress.value = 0.6;
      return;
    }
    progress.value = withRepeat(
      withTiming(1, { duration: 800, easing: Easing.inOut(Easing.ease) }),
      -1,
      true,
    );
  }, [progress, reduzirMovimento]);

  const shimmer = useAnimatedStyle(() => ({ opacity: progress.value }));

  return (
    <View
      accessible
      accessibilityLabel="Carregando pontos de recarga"
      style={styles.card}
    >
      <Animated.View style={[styles.line, styles.title, shimmer]} />
      <Animated.View style={[styles.line, styles.subtitle, shimmer]} />
      <View style={styles.row}>
        <Animated.View style={[styles.pill, shimmer]} />
        <Animated.View style={[styles.pill, shimmer]} />
      </View>
      <Animated.View style={[styles.line, styles.price, shimmer]} />
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: FluiColors.card,
    borderBottomRightRadius: BorderRadius.card,
    borderLeftColor: FluiColors.skeleton,
    borderLeftWidth: 4,
    borderTopRightRadius: BorderRadius.card,
    marginTop: Spacing.sm + 4,
    padding: Spacing.md - 2,
  },
  line: {
    backgroundColor: FluiColors.skeleton,
    borderRadius: 4,
  },
  price: {
    height: 18,
    marginTop: Spacing.sm,
    width: "45%",
  },
  pill: {
    backgroundColor: FluiColors.skeleton,
    borderRadius: 12,
    height: 22,
    width: 70,
  },
  row: {
    flexDirection: "row",
    gap: Spacing.sm,
    marginTop: Spacing.sm,
  },
  subtitle: {
    height: 12,
    marginTop: Spacing.sm,
    width: "40%",
  },
  title: {
    height: 16,
    width: "62%",
  },
});
