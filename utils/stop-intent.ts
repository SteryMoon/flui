import type { AmenityKey, Station } from "@/mocks/station";
import {
  formatPrice,
  getAvailableChargers,
  getCurrentBusy,
  getMaxPowerKw,
  isOpenNow,
} from "@/utils/station";


export type StopIntent = "rapida" | "pausa" | "longa";

export type StopIntentOption = {
  key: StopIntent;
  label: string;
  minutes: number;
  icon: string;
  hint: string;
};

export const STOP_INTENTS: StopIntentOption[] = [
  {
    key: "rapida",
    label: "Só recarregar",
    minutes: 20,
    icon: "lightning-bolt",
    hint: "O mais rápido e mais perto",
  },
  {
    key: "pausa",
    label: "Café ou pausa",
    minutes: 45,
    icon: "coffee",
    hint: "Com onde sentar e esperar",
  },
  {
    key: "longa",
    label: "Refeição ou compras",
    minutes: 90,
    icon: "silverware-fork-knife",
    hint: "O mais barato, com o que fazer",
  },
];

export function getIntentOption(intent: StopIntent): StopIntentOption {
  return STOP_INTENTS.find((item) => item.key === intent) ?? STOP_INTENTS[0];
}

const LIMITE_DO_VEICULO_KW = 60;


const ENERGIA_DESEJADA_KWH = 30;


export function getSessionEnergyKwh(station: Station, minutes: number): number {
  const potenciaUtil = Math.min(getMaxPowerKw(station), LIMITE_DO_VEICULO_KW);
  const energia = potenciaUtil * (minutes / 60);
  return Math.min(energia, ENERGIA_DESEJADA_KWH);
}

export function getSessionCost(station: Station, minutes: number): number {
  return getSessionEnergyKwh(station, minutes) * station.priceKwh;
}

const COMODIDADES_POR_INTENCAO: Record<StopIntent, AmenityKey[]> = {
  rapida: ["banheiro"],
  pausa: ["cafe", "banheiro", "wifi"],
  longa: ["restaurante", "mercado", "estacionamento", "banheiro"],
};


const PESOS: Record<
  StopIntent,
  { energia: number; custo: number; comodidades: number; distancia: number; fila: number }
> = {
  rapida: { energia: 0.4, custo: 0.05, comodidades: 0.05, distancia: 0.3, fila: 0.2 },
  pausa: { energia: 0.2, custo: 0.2, comodidades: 0.3, distancia: 0.15, fila: 0.15 },
  longa: { energia: 0.05, custo: 0.4, comodidades: 0.35, distancia: 0.05, fila: 0.15 },
};

function inverso(valor: number, pior: number): number {
  return Math.max(0, Math.min(1, 1 - valor / pior));
}

export type ScoredStation = {
  station: Station;
  score: number;
  energyKwh: number;
  cost: number;
  reason: string;
};

export function scoreStation(station: Station, intent: StopIntent): ScoredStation {
  const opcao = getIntentOption(intent);
  const pesos = PESOS[intent];

  const energia = getSessionEnergyKwh(station, opcao.minutes);
  const custo = getSessionCost(station, opcao.minutes);

  const desejadas = COMODIDADES_POR_INTENCAO[intent];
  const atendidas = desejadas.filter((item) => station.amenities.includes(item)).length;

  const notas = {
    energia: Math.min(1, energia / ENERGIA_DESEJADA_KWH),
    custo: inverso(custo, 90),
    comodidades: desejadas.length === 0 ? 1 : atendidas / desejadas.length,
    distancia: inverso(station.distanceKm, 15),
    fila: inverso(getCurrentBusy(station), 100),
  };

  let score =
    notas.energia * pesos.energia +
    notas.custo * pesos.custo +
    notas.comodidades * pesos.comodidades +
    notas.distancia * pesos.distancia +
    notas.fila * pesos.fila;

  
  if (!isOpenNow(station)) score *= 0.2;
  else if (getAvailableChargers(station) === 0) score *= 0.4;

  return {
    station,
    score: Math.round(score * 100),
    energyKwh: energia,
    cost: custo,
    reason: montarMotivo(station, intent, energia, custo, atendidas),
  };
}

function montarMotivo(
  station: Station,
  intent: StopIntent,
  energia: number,
  custo: number,
  comodidadesAtendidas: number,
): string {
  if (!isOpenNow(station)) return "Fechado neste horário";
  if (getAvailableChargers(station) === 0) return "Todos os carregadores ocupados";

  const kwh = Math.round(energia);

  if (intent === "rapida") {
    return `${kwh} kWh em ${getIntentOption(intent).minutes} min, a ${station.distanceKm.toString().replace(".", ",")} km`;
  }

  if (intent === "longa") {
    return comodidadesAtendidas > 0
      ? `${formatPrice(custo)} na parada, com ${comodidadesAtendidas} comodidade${comodidadesAtendidas > 1 ? "s" : ""} no local`
      : `${formatPrice(custo)} na parada, mas sem comodidades por perto`;
  }

  return comodidadesAtendidas > 0
    ? `${kwh} kWh por ${formatPrice(custo)}, com onde esperar`
    : `${kwh} kWh por ${formatPrice(custo)}, sem onde esperar`;
}

export function rankStations(stations: Station[], intent: StopIntent): ScoredStation[] {
  return stations
    .map((station) => scoreStation(station, intent))
    .sort((a, b) => b.score - a.score);
}
