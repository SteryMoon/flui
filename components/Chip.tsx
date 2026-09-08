import * as Haptics from "expo-haptics";
import { Platform, Pressable, StyleSheet, Text, ViewStyle } from "react-native";
import Animated, {
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withSpring,
  withTiming,
} from "react-native-reanimated";

import { BorderRadius, FluiColors, Motion, Spacing } from "@/constants/theme";

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

type ChipProps = {
  label: string;
  selected?: boolean;
  onPress: () => void;
  accessibilityLabel?: string;
  accessibilityHint?: string;
  style?: ViewStyle;
};


export function Chip({
  label,
  selected = false,
  onPress,
  accessibilityLabel,
  accessibilityHint,
  style,
}: ChipProps) {
  const scale = useSharedValue(1);
  const reduzirMovimento = useReducedMotion();

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  function handlePressIn() {
    if (reduzirMovimento) return;
    scale.value = withTiming(0.94, { duration: Motion.fast });
  }

  function handlePressOut() {
    scale.value = withSpring(1, Motion.spring);
  }

  function handlePress() {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    }
    onPress();
  }

  return (
    <AnimatedPressable
      accessibilityRole="button"
      accessibilityState={{ selected }}
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityHint={accessibilityHint}
      onPress={handlePress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={[styles.chip, selected && styles.chipSelected, animatedStyle, style]}
    >
      <Text style={[styles.label, selected && styles.labelSelected]}>{label}</Text>
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    alignItems: "center",
    backgroundColor: FluiColors.chipInactive,
    borderColor: "transparent",
    borderRadius: BorderRadius.button,
    borderWidth: 1,
    justifyContent: "center",
    minHeight: 40,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  chipSelected: {
    backgroundColor: FluiColors.primary,
    borderColor: FluiColors.primary,
  },
  label: {
    color: FluiColors.mutedText,
    fontSize: 13,
  },
  labelSelected: {
    color: FluiColors.text,
    fontWeight: "600",
  },
});
