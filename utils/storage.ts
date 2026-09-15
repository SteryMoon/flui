import AsyncStorage from "@react-native-async-storage/async-storage";

/** Prefixo para não colidir com outras chaves do dispositivo. */
const PREFIXO = "@flui:";

export const CHAVES = {
    favoritos: "favoritos",
    historico: "historico",
    avaliacoes: "avaliacoes",
} as const;

export async function ler<T>(chave: string, padrao: T): Promise<T> {
    try {
        const bruto = await AsyncStorage.getItem(PREFIXO + chave);
        return bruto ? (JSON.parse(bruto) as T) : padrao;
    } catch {
        return padrao;
    }
}

export async function gravar<T>(chave: string, valor: T): Promise<void> {
    try {
        await AsyncStorage.setItem(PREFIXO + chave, JSON.stringify(valor));
    } catch {
        /* Falha de escrita não deve derrubar a interface. */
    }
}