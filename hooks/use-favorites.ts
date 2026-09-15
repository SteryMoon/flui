import { useCallback, useEffect, useState } from "react";

import { CHAVES, gravar, ler } from "@/utils/storage";

/**
 * O estado vive fora do hook, num cache de módulo com assinantes. Sem isso,
 * cada tela teria a própria cópia da lista: favoritar na ficha do ponto não
 * atualizaria a lista do perfil até o app ser reaberto.
 */
let cache: string[] = [];
let carregado = false;
const ouvintes = new Set<(ids: string[]) => void>();

function publicar(novos: string[]) {
    cache = novos;
    ouvintes.forEach((avisar) => avisar(cache));
}

export function useFavorites() {
    const [ids, setIds] = useState<string[]>(cache);
    const [carregando, setCarregando] = useState(!carregado);

    useEffect(() => {
        ouvintes.add(setIds);

        if (!carregado) {
            ler<string[]>(CHAVES.favoritos, []).then((salvos) => {
                carregado = true;
                publicar(salvos);
                setCarregando(false);
            });
        }

        return () => {
            ouvintes.delete(setIds);
        };
    }, []);

    const isFavorito = useCallback((id: string) => ids.includes(id), [ids]);

    const alternar = useCallback((id: string) => {
        const proximo = cache.includes(id)
            ? cache.filter((atual) => atual !== id)
            : [...cache, id];

        publicar(proximo);
        gravar(CHAVES.favoritos, proximo);
    }, []);

    return { ids, isFavorito, alternar, carregando };
}