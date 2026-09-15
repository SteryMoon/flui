import { useCallback, useEffect, useState } from "react";

import { CHAVES, gravar, ler } from "@/utils/storage";

/** Os quatro aspectos avaliados, na ordem em que aparecem na tela. */
export const ASPECTOS = [
    { chave: "velocidade", label: "Velocidade de carga" },
    { chave: "seguranca", label: "Segurança do local" },
    { chave: "iluminacao", label: "Iluminação" },
    { chave: "sinalizacao", label: "Sinalização" },
] as const;

export type AspectoChave = (typeof ASPECTOS)[number]["chave"];

export type Notas = Record<AspectoChave, number>;

export type Avaliacao = {
    stationId: string;
    notas: Notas;
    comentario: string;
    criadaEm: string;
};

/** Mesmo padrão do hook de favoritos: cache de módulo com assinantes. */
let cache: Avaliacao[] = [];
let carregado = false;
const ouvintes = new Set<(lista: Avaliacao[]) => void>();

function publicar(novas: Avaliacao[]) {
    cache = novas;
    ouvintes.forEach((avisar) => avisar(cache));
}

/** Média simples das quatro notas, usada para exibir a nota geral. */
export function mediaGeral(notas: Notas): number {
    const valores = ASPECTOS.map((a) => notas[a.chave]);
    return valores.reduce((soma, n) => soma + n, 0) / valores.length;
}

export function useReviews() {
    const [avaliacoes, setAvaliacoes] = useState<Avaliacao[]>(cache);

    useEffect(() => {
        ouvintes.add(setAvaliacoes);

        if (!carregado) {
            ler<Avaliacao[]>(CHAVES.avaliacoes, []).then((salvas) => {
                carregado = true;
                publicar(salvas);
            });
        }

        return () => {
            ouvintes.delete(setAvaliacoes);
        };
    }, []);

    const minhaAvaliacao = useCallback(
        (stationId: string) => avaliacoes.find((a) => a.stationId === stationId),
        [avaliacoes],
    );

    /** Uma avaliação por ponto: avaliar de novo substitui a anterior. */
    const salvar = useCallback(
        (stationId: string, notas: Notas, comentario: string) => {
            const nova: Avaliacao = {
                stationId,
                notas,
                comentario,
                criadaEm: new Date().toISOString(),
            };

            const proximo = [nova, ...cache.filter((a) => a.stationId !== stationId)];

            publicar(proximo);
            gravar(CHAVES.avaliacoes, proximo);
        },
        [],
    );

    const remover = useCallback((stationId: string) => {
        const proximo = cache.filter((a) => a.stationId !== stationId);
        publicar(proximo);
        gravar(CHAVES.avaliacoes, proximo);
    }, []);

    return { avaliacoes, minhaAvaliacao, salvar, remover };
}