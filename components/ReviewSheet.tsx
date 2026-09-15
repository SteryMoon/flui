import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useEffect, useState } from "react";
import {
    Modal,
    Platform,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View,
} from "react-native";
import Animated, { FadeIn, SlideInDown, useReducedMotion } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import {
    BorderRadius,
    FluiColors,
    FluiFonts,
    Motion,
    Spacing,
} from "@/constants/theme";
import { ASPECTOS, useReviews, type Notas } from "@/hooks/use-reviews";

const NOTAS_VAZIAS: Notas = {
    velocidade: 0,
    seguranca: 0,
    iluminacao: 0,
    sinalizacao: 0,
};

type Props = {
    visible: boolean;
    stationId: string;
    stationName: string;
    onClose: () => void;
};

export function ReviewSheet({ visible, stationId, stationName, onClose }: Props) {
    const insets = useSafeAreaInsets();
    const reduzirMovimento = useReducedMotion();
    const { minhaAvaliacao, salvar } = useReviews();

    const existente = minhaAvaliacao(stationId);

    const [notas, setNotas] = useState<Notas>(NOTAS_VAZIAS);
    const [comentario, setComentario] = useState("");

    /* Reavaliar abre com o que já foi dado, em vez de começar do zero. */
    useEffect(() => {
        if (!visible) return;
        setNotas(existente ? existente.notas : NOTAS_VAZIAS);
        setComentario(existente ? existente.comentario : "");
    }, [visible, existente]);

    /* Todos os aspectos precisam de nota: uma avaliação pela metade
       distorceria a média do ponto. */
    const completo = ASPECTOS.every((aspecto) => notas[aspecto.chave] > 0);

    function definirNota(chave: keyof Notas, valor: number) {
        if (Platform.OS !== "web") {
            Haptics.selectionAsync().catch(() => { });
        }
        setNotas((atual) => ({ ...atual, [chave]: valor }));
    }

    function enviar() {
        if (!completo) return;
        if (Platform.OS !== "web") {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => { });
        }
        salvar(stationId, notas, comentario.trim());
        onClose();
    }

    return (
        <Modal visible={visible} transparent animationType="none" onRequestClose={onClose}>
            <Animated.View
                entering={reduzirMovimento ? undefined : FadeIn.duration(Motion.fast)}
                style={styles.backdrop}
            >
                <Pressable style={styles.backdropArea} onPress={onClose} accessibilityLabel="Fechar" />

                <Animated.View
                    entering={reduzirMovimento ? undefined : SlideInDown.duration(Motion.slow)}
                    style={[styles.sheet, { paddingBottom: insets.bottom + Spacing.md }]}
                >
                    <View style={styles.handle} />

                    <View style={styles.header}>
                        <View style={styles.headerTexts}>
                            <Text style={styles.title} accessibilityRole="header">
                                {existente ? "Editar avaliação" : "Avaliar ponto"}
                            </Text>
                            <Text style={styles.subtitle}>{stationName}</Text>
                        </View>
                        <Pressable
                            accessibilityRole="button"
                            accessibilityLabel="Fechar"
                            onPress={onClose}
                            hitSlop={8}
                        >
                            <Ionicons name="close" size={22} color={FluiColors.mutedText} />
                        </Pressable>
                    </View>

                    <ScrollView
                        contentContainerStyle={styles.content}
                        keyboardShouldPersistTaps="handled"
                        showsVerticalScrollIndicator={false}
                    >
                        {ASPECTOS.map((aspecto) => (
                            <View key={aspecto.chave} style={styles.aspectoRow}>
                                <Text style={styles.aspectoLabel}>{aspecto.label}</Text>
                                <Estrelas
                                    valor={notas[aspecto.chave]}
                                    label={aspecto.label}
                                    onChange={(valor) => definirNota(aspecto.chave, valor)}
                                />
                            </View>
                        ))}

                        <Text style={styles.comentarioLabel}>Comentário (opcional)</Text>
                        <TextInput
                            accessibilityLabel="Comentário sobre o ponto de recarga"
                            multiline
                            numberOfLines={4}
                            onChangeText={setComentario}
                            placeholder="O que outros motoristas precisam saber?"
                            placeholderTextColor={FluiColors.mutedText}
                            style={styles.comentario}
                            textAlignVertical="top"
                            value={comentario}
                        />
                    </ScrollView>

                    <Pressable
                        accessibilityRole="button"
                        accessibilityLabel="Salvar avaliação"
                        accessibilityState={{ disabled: !completo }}
                        accessibilityHint={
                            completo ? undefined : "Dê uma nota a cada aspecto para liberar"
                        }
                        disabled={!completo}
                        onPress={enviar}
                        style={({ pressed }) => [
                            styles.saveButton,
                            !completo && styles.saveButtonDisabled,
                            pressed && styles.pressed,
                        ]}
                    >
                        <Text style={styles.saveButtonText}>
                            {completo ? "Salvar avaliação" : "Avalie os quatro aspectos"}
                        </Text>
                    </Pressable>
                </Animated.View>
            </Animated.View>
        </Modal>
    );
}

/* -------------------------------------------------------------------------- */

function Estrelas({
    valor,
    label,
    onChange,
}: {
    valor: number;
    label: string;
    onChange: (valor: number) => void;
}) {
    return (
        <View style={styles.estrelas}>
            {[1, 2, 3, 4, 5].map((nota) => (
                <Pressable
                    key={nota}
                    accessibilityRole="button"
                    accessibilityLabel={`${label}: ${nota} ${nota === 1 ? "estrela" : "estrelas"}`}
                    accessibilityState={{ selected: valor === nota }}
                    onPress={() => onChange(nota)}
                    style={styles.estrelaAlvo}
                >
                    <MaterialIcons
                        color={nota <= valor ? FluiColors.star : FluiColors.surfaceAlt}
                        name={nota <= valor ? "star" : "star-border"}
                        size={28}
                    />
                </Pressable>
            ))}
        </View>
    );
}

/* -------------------------------------------------------------------------- */

const styles = StyleSheet.create({
    aspectoLabel: {
        color: FluiColors.text,
        fontFamily: FluiFonts.inter.medium,
        fontSize: 14,
    },
    aspectoRow: {
        borderBottomColor: FluiColors.surfaceAlt,
        borderBottomWidth: StyleSheet.hairlineWidth,
        gap: Spacing.sm,
        paddingVertical: Spacing.sm + 2,
    },
    backdrop: {
        backgroundColor: "rgba(0,0,0,0.55)",
        flex: 1,
        justifyContent: "flex-end",
    },
    backdropArea: {
        flex: 1,
    },
    comentario: {
        backgroundColor: FluiColors.background,
        borderRadius: BorderRadius.card,
        color: FluiColors.text,
        fontFamily: FluiFonts.inter.regular,
        fontSize: 14,
        marginTop: Spacing.sm,
        minHeight: 92,
        padding: Spacing.sm + 4,
    },
    comentarioLabel: {
        color: FluiColors.text,
        fontFamily: FluiFonts.inter.medium,
        fontSize: 14,
        marginTop: Spacing.md,
    },
    content: {
        paddingBottom: Spacing.md,
    },
    estrelaAlvo: {
        alignItems: "center",
        height: 44,
        justifyContent: "center",
        width: 44,
    },
    estrelas: {
        flexDirection: "row",
    },
    handle: {
        alignSelf: "center",
        backgroundColor: FluiColors.surfaceAlt,
        borderRadius: 3,
        height: 5,
        marginBottom: Spacing.md,
        width: 44,
    },
    header: {
        alignItems: "center",
        flexDirection: "row",
        gap: Spacing.sm,
        marginBottom: Spacing.sm,
    },
    headerTexts: {
        flex: 1,
    },
    pressed: {
        opacity: 0.8,
    },
    saveButton: {
        alignItems: "center",
        backgroundColor: FluiColors.primary,
        borderRadius: BorderRadius.button,
        justifyContent: "center",
        marginTop: Spacing.sm,
        minHeight: 48,
    },
    saveButtonDisabled: {
        backgroundColor: FluiColors.chipInactive,
    },
    saveButtonText: {
        color: FluiColors.text,
        fontFamily: FluiFonts.inter.semiBold,
        fontSize: 15,
    },
    sheet: {
        backgroundColor: FluiColors.card,
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        maxHeight: "85%",
        paddingHorizontal: Spacing.lg,
        paddingTop: Spacing.sm,
    },
    subtitle: {
        color: FluiColors.mutedText,
        fontFamily: FluiFonts.inter.regular,
        fontSize: 13,
        marginTop: 2,
    },
    title: {
        color: FluiColors.text,
        fontFamily: FluiFonts.josefin.bold,
        fontSize: 20,
    },
});