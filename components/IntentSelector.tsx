import { MaterialCommunityIcons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { Platform, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withSpring,
  withTiming,
} from "react-native-reanimated";

import { BorderRadius, FluiColors, FluiFonts, Motion, Spacing } from "@/constants/theme";
import { STOP_INTENTS, type StopIntent, type StopIntentOption } from "@/utils/stop-intent";

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

type IntentSelectorProps = {
  value: StopIntent;
  onChange: (intent: StopIntent) => void;
};

/**
 * Pergunta o que o motorista vai fazer durante a parada.
 *
 * É a entrada da recomendação: a resposta reordena os resultados, porque o
 * melhor ponto para quem tem quinze minutos não é o mesmo de quem vai almoçar.
 */
export function IntentSelector({ value, onChange }: IntentSelectorProps) {
  return (
    <View>
      <Text style={styles.pergunta} accessibilityRole="header">
        O que você vai fazer enquanto carrega?
      </Text>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.linha}
      >
        {STOP_INTENTS.map((opcao) => (
          <IntentCard
            key={opcao.key}
            opcao={opcao}
            selecionado={opcao.key === value}
            onPress={() => onChange(opcao.key)}
          />
        ))}
      </ScrollView>
    </View>
  );
}

function IntentCard({
  opcao,
  selecionado,
  onPress,
}: {
  opcao: StopIntentOption;
  selecionado: boolean;
  onPress: () => void;
}) {
  const escala = useSharedValue(1);
  const reduzirMovimento = useReducedMotion();

  const estilo = useAnimatedStyle(() => ({
    transform: [{ scale: escala.value }],
  }));

  function pressIn() {
    if (reduzirMovimento) return;
    escala.value = withTiming(0.97, { duration: Motion.fast });
  }

  function pressOut() {
    escala.value = withSpring(1, Motion.spring);
  }

  function handlePress() {
    if (Platform.OS !== "web") {
      Haptics.selectionAsync().catch(() => {});
    }
    onPress();
  }

  return (
    <AnimatedPressable
      accessibilityRole="radio"
      accessibilityLabel={`${opcao.label}. ${opcao.hint}. Parada de cerca de ${opcao.minutes} minutos.`}
      accessibilityState={{ selected: selecionado }}
      onPress={handlePress}
      onPressIn={pressIn}
      onPressOut={pressOut}
      style={[styles.card, selecionado && styles.cardAtivo, estilo]}
    >
      <MaterialCommunityIcons
        name={opcao.icon as never}
        size={18}
        color={selecionado ? FluiColors.text : FluiColors.mutedText}
      />
      <Text style={[styles.label, selecionado && styles.labelAtivo]}>{opcao.label}</Text>
      <Text style={[styles.tempo, selecionado && styles.tempoAtivo]}>
        ~{opcao.minutes} min
      </Text>
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: FluiColors.chipInactive,
    borderColor: FluiColors.surfaceAlt,
    borderRadius: BorderRadius.card,
    borderWidth: 1,
    gap: 4,
    minHeight: 44,
    minWidth: 132,
    paddingHorizontal: Spacing.md - 4,
    paddingVertical: Spacing.sm + 2,
  },
  cardAtivo: {
    backgroundColor: FluiColors.primary,
    borderColor: FluiColors.primary,
  },
  label: {
    color: FluiColors.mutedText,
    fontFamily: FluiFonts.inter.semiBold,
    fontSize: 13,
  },
  labelAtivo: {
    color: FluiColors.text,
  },
  linha: {
    gap: Spacing.sm,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  pergunta: {
    color: FluiColors.mutedText,
    fontFamily: FluiFonts.inter.regular,
    fontSize: 12,
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.sm,
  },
  tempo: {
    color: FluiColors.mutedText,
    fontFamily: FluiFonts.inter.regular,
    fontSize: 11,
  },
  tempoAtivo: {
    color: "#E4F1FA",
  },
});
