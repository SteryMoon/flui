import { useCallback, useEffect, useState } from "react";

import { CHAVES, gravar, ler } from "@/utils/storage";

export type Visita = {
    stationId: string;
    intent: string;
    visitadaEm: string;
};

/** Mesmo padrão dos outros hooks: cache de módulo com assinantes. */
let cache: Visita[] = [];
let carregado = false;
const ouvintes = new Set<(lista: Visita[]) => void>();

/** O histórico não precisa crescer sem limite para cumprir seu papel. */
const LIMITE = 30;

function publicar(novas: Visita[]) {
    cache = novas;
    ouvintes.forEach((avisar) => avisar(cache));
}

export function useHistory() {
    const [visitas, setVisitas] = useState<Visita[]>(cache);

    useEffect(() => {
        ouvintes.add(setVisitas);

        if (!carregado) {
            ler<Visita[]>(CHAVES.historico, []).then((salvas) => {
                carregado = true;
                publicar(salvas);
            });
        }

        return () => {
            ouvintes.delete(setVisitas);
        };
    }, []);

    /**
     * Abrir o mesmo ponto duas vezes seguidas não gera duas entradas: a
     * anterior é substituída, para o histórico não virar uma lista de
     * repetições do último ponto consultado.
     */
    const registrar = useCallback((stationId: string, intent: string) => {
        const nova: Visita = {
            stationId,
            intent,
            visitadaEm: new Date().toISOString(),
        };

        const proximo = [nova, ...cache.filter((v) => v.stationId !== stationId)].slice(
            0,
            LIMITE,
        );

        publicar(proximo);
        gravar(CHAVES.historico, proximo);
    }, []);

    const limpar = useCallback(() => {
        publicar([]);
        gravar(CHAVES.historico, []);
    }, []);

    return { visitas, registrar, limpar };
}