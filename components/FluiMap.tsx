import { useEffect, useMemo, useRef } from "react";
import { WebView } from "react-native-webview";

import { mapHtml } from "@/constants/mapHtml";
import type { Station } from "@/mocks/station";
import {
  getMaxPowerKw,
  getStatusColor,
  getStatusLabel,
  hasFastCharging,
  getAvailableChargers,
} from "@/utils/station";

type Props = {
  stations: Station[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onClear: () => void;
};

export default function FluiMap({ stations, selectedId, onSelect, onClear }: Props) {
  const webRef = useRef<WebView>(null);

  /**
   * O app resolve a regra de negócio e manda o marcador pronto. A WebView
   * não recalcula status, para que mapa e lista nunca divirjam.
   */
  const dados = useMemo(() => {
    const pontos = stations.map((station) => ({
      id: station.id,
      lat: station.coordinates.latitude,
      lng: station.coordinates.longitude,
      cor: getStatusColor(station),
      potencia: getMaxPowerKw(station),
      rapido: hasFastCharging(station),
      rotulo: `${station.name}, ${getStatusLabel(station)}, ${getAvailableChargers(
        station,
      )} de ${station.chargers.length} livres, até ${getMaxPowerKw(station)} kW`,
    }));

    return JSON.stringify({ pontos, selecionadoId: selectedId });
  }, [stations, selectedId]);

  /* Reinjetado a cada mudança de dados ou de seleção. */
  const injecao = `window.FLUI_DADOS = ${dados}; if (window.aplicar) aplicar(); true;`;
    /* Quando a seleção muda no app, o mapa acompanha. */
  useEffect(() => {
    if (!selectedId) return;
    const alvo = stations.find((s) => s.id === selectedId);
    if (!alvo) return;

    webRef.current?.injectJavaScript(
      `if (window.focar) focar(${alvo.coordinates.latitude}, ${alvo.coordinates.longitude}); true;`,
    );
  }, [selectedId, stations]);

  return (
    <WebView
      ref={webRef}
      originWhitelist={["*"]}
      source={{ html: mapHtml, baseUrl: "https://flui.local" }}
      style={{ flex: 1, backgroundColor: "#0E1B22" }}
      javaScriptEnabled
      domStorageEnabled
      mixedContentMode="always"
      scrollEnabled={false}
      setSupportMultipleWindows={false}
      injectedJavaScript={injecao}
      onLoadEnd={() => webRef.current?.injectJavaScript(injecao)}
      onMessage={(e) => {
        try {
          const msg = JSON.parse(e.nativeEvent.data);
          if (msg.tipo === "ponto") onSelect(msg.id);
          if (msg.tipo === "limpar") onClear();
        } catch {
          /* mensagem fora do formato esperado: ignora */
        }
      }}
    />
  );
}