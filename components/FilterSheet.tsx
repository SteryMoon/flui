import { Ionicons } from "@expo/vector-icons";
import { useEffect, useMemo, useState } from "react";
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  View,
} from "react-native";
import Animated, { SlideInDown, useReducedMotion } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Chip } from "@/components/Chip";
import {
  AMENITY_OPTIONS,
  CONNECTOR_OPTIONS,
  EMPTY_FILTERS,
  POWER_OPTIONS,
  StationFilters,
  countActiveFilters,
  toggleInList,
} from "@/constants/filters";
import { BorderRadius, FluiColors, Motion, Spacing } from "@/constants/theme";
import { applyFilters } from "@/hooks/use-station-filters";
import { stationsMock } from "@/mocks/station";

type FilterSheetProps = {
  visible: boolean;
  filters: StationFilters;
  query: string;
  onClose: () => void;
  onApply: (filters: StationFilters) => void;
};

export function FilterSheet({
  visible,
  filters,
  query,
  onClose,
  onApply,
}: FilterSheetProps) {
  const insets = useSafeAreaInsets();
  const reduzirMovimento = useReducedMotion();

  const [draft, setDraft] = useState<StationFilters>(filters);

  useEffect(() => {
    if (visible) setDraft(filters);
  }, [visible, filters]);

  const previewCount = useMemo(
    () => applyFilters(stationsMock, draft, query).length,
    [draft, query],
  );

  const ativos = countActiveFilters(draft);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <Pressable
        accessibilityLabel="Fechar filtros"
        accessibilityRole="button"
        onPress={onClose}
        style={styles.backdrop}
      />

      <Animated.View
        entering={reduzirMovimento ? undefined : SlideInDown.duration(Motion.slow)}
        style={[styles.sheet, { paddingBottom: insets.bottom + Spacing.md }]}
      >
        <View style={styles.handle} />

        <View style={styles.header}>
          <Text style={styles.title} accessibilityRole="header">
            Filtros
          </Text>

          <View style={styles.headerActions}>
            {ativos > 0 && (
              <Pressable
                accessibilityRole="button"
                accessibilityHint="Remove todos os filtros aplicados"
                onPress={() => setDraft(EMPTY_FILTERS)}
                style={styles.clearButton}
              >
                <Text style={styles.clearText}>Limpar</Text>
              </Pressable>
            )}

            <Pressable
              accessibilityLabel="Fechar filtros"
              accessibilityRole="button"
              onPress={onClose}
              style={styles.closeButton}
            >
              <Ionicons name="close" size={20} color={FluiColors.text} />
            </Pressable>
          </View>
        </View>

        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          <Section
            title="Tipo de conector"
            hint="Escolha os padrões que o seu carro aceita"
          >
            <View style={styles.chipsRow}>
              {CONNECTOR_OPTIONS.map((option) => (
                <Chip
                  key={option.value}
                  label={option.label}
                  selected={draft.connectors.includes(option.value)}
                  onPress={() =>
                    setDraft((prev) => ({
                      ...prev,
                      connectors: toggleInList(prev.connectors, option.value),
                    }))
                  }
                />
              ))}
            </View>
          </Section>

          <Section title="Potência mínima" hint="Quanto maior, mais rápida a recarga">
            <View style={styles.chipsRow}>
              {POWER_OPTIONS.map((option) => (
                <Chip
                  key={option.label}
                  label={option.label}
                  accessibilityLabel={`${option.label}. ${option.hint}`}
                  selected={draft.minPowerKw === option.value}
                  onPress={() =>
                    setDraft((prev) => ({ ...prev, minPowerKw: option.value }))
                  }
                />
              ))}
            </View>
          </Section>

          <Section title="Comodidades" hint="O que você quer encontrar por perto">
            <View style={styles.chipsRow}>
              {AMENITY_OPTIONS.map((option) => (
                <Chip
                  key={option.value}
                  label={option.label}
                  selected={draft.amenities.includes(option.value)}
                  onPress={() =>
                    setDraft((prev) => ({
                      ...prev,
                      amenities: toggleInList(prev.amenities, option.value),
                    }))
                  }
                />
              ))}
            </View>
          </Section>

          <Section title="Horário e disponibilidade">
            <ToggleRow
              label="Aberto agora"
              hint="Considera o horário do seu celular"
              value={draft.onlyOpenNow}
              onChange={(value) => setDraft((prev) => ({ ...prev, onlyOpenNow: value }))}
            />
            <ToggleRow
              label="Funciona 24 horas"
              value={draft.only24h}
              onChange={(value) => setDraft((prev) => ({ ...prev, only24h: value }))}
            />
            <ToggleRow
              label="Com carregador livre"
              hint="Esconde pontos com todos os carregadores ocupados"
              value={draft.onlyAvailable}
              onChange={(value) =>
                setDraft((prev) => ({ ...prev, onlyAvailable: value }))
              }
            />
          </Section>
        </ScrollView>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Ver ${previewCount} pontos de recarga`}
          onPress={() => {
            onApply(draft);
            onClose();
          }}
          style={({ pressed }) => [styles.applyButton, pressed && styles.applyPressed]}
        >
          <Text style={styles.applyLabel}>
            {previewCount === 0
              ? "Nenhum ponto encontrado"
              : `Ver ${previewCount} ${previewCount === 1 ? "ponto" : "pontos"}`}
          </Text>
        </Pressable>
      </Animated.View>
    </Modal>
  );
}


function Section({
  title,
  hint,
  children,
}: {
  title: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle} accessibilityRole="header">
        {title}
      </Text>
      {hint && <Text style={styles.sectionHint}>{hint}</Text>}
      {children}
    </View>
  );
}

function ToggleRow({
  label,
  hint,
  value,
  onChange,
}: {
  label: string;
  hint?: string;
  value: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <View style={styles.toggleRow}>
      <View style={styles.toggleTexts}>
        <Text style={styles.toggleLabel}>{label}</Text>
        {hint && <Text style={styles.toggleHint}>{hint}</Text>}
      </View>
      <Switch
        accessibilityLabel={label}
        accessibilityHint={hint}
        value={value}
        onValueChange={onChange}
        thumbColor={value ? FluiColors.primary : "#f4f3f4"}
        trackColor={{ false: FluiColors.chipInactive, true: FluiColors.primaryDark }}
      />
    </View>
  );
}


const styles = StyleSheet.create({
  applyButton: {
    alignItems: "center",
    backgroundColor: FluiColors.primary,
    borderRadius: BorderRadius.button,
    justifyContent: "center",
    marginHorizontal: Spacing.md,
    marginTop: Spacing.sm,
    minHeight: 48,
  },
  applyLabel: {
    color: FluiColors.text,
    fontSize: 16,
    fontWeight: "700",
  },
  applyPressed: {
    opacity: 0.85,
  },
  backdrop: {
    backgroundColor: "rgba(0,0,0,0.55)",
    bottom: 0,
    left: 0,
    position: "absolute",
    right: 0,
    top: 0,
  },
  chipsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.sm,
    marginTop: Spacing.sm + 2,
  },
  clearButton: {
    minHeight: 40,
    justifyContent: "center",
    paddingHorizontal: Spacing.sm,
  },
  clearText: {
    color: FluiColors.primary,
    fontSize: 14,
    fontWeight: "600",
  },
  closeButton: {
    alignItems: "center",
    backgroundColor: FluiColors.chipInactive,
    borderRadius: 20,
    height: 40,
    justifyContent: "center",
    width: 40,
  },
  content: {
    paddingBottom: Spacing.md,
    paddingHorizontal: Spacing.md,
  },
  handle: {
    alignSelf: "center",
    backgroundColor: FluiColors.chipInactive,
    borderRadius: 3,
    height: 5,
    marginBottom: Spacing.sm,
    marginTop: Spacing.sm,
    width: 44,
  },
  header: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  headerActions: {
    alignItems: "center",
    flexDirection: "row",
    gap: Spacing.sm,
  },
  section: {
    marginTop: Spacing.lg,
  },
  sectionHint: {
    color: FluiColors.mutedText,
    fontSize: 12,
    marginTop: 2,
  },
  sectionTitle: {
    color: FluiColors.text,
    fontSize: 16,
    fontWeight: "700",
  },
  sheet: {
    backgroundColor: FluiColors.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    bottom: 0,
    left: 0,
    maxHeight: "88%",
    position: "absolute",
    right: 0,
  },
  title: {
    color: FluiColors.text,
    fontSize: 20,
    fontWeight: "700",
  },
  toggleHint: {
    color: FluiColors.mutedText,
    fontSize: 12,
    marginTop: 2,
  },
  toggleLabel: {
    color: FluiColors.text,
    fontSize: 15,
  },
  toggleRow: {
    alignItems: "center",
    borderBottomColor: FluiColors.surfaceAlt,
    borderBottomWidth: StyleSheet.hairlineWidth,
    flexDirection: "row",
    justifyContent: "space-between",
    minHeight: 56,
  },
  toggleTexts: {
    flex: 1,
    paddingRight: Spacing.md,
  },
});
