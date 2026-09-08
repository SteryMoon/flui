import type { AmenityKey, ConnectorType } from "@/mocks/station";

/** Estado completo dos filtros de busca. */
export type StationFilters = {
  /** Conectores aceitos (OU entre eles). Vazio = qualquer conector. */
  connectors: ConnectorType[];
  /** Potência mínima em kW. null = qualquer potência. */
  minPowerKw: number | null;
  /** Comodidades exigidas (E entre elas). */
  amenities: AmenityKey[];
  /** Só pontos abertos neste momento. */
  onlyOpenNow: boolean;
  /** Só pontos que funcionam 24 horas. */
  only24h: boolean;
  /** Só pontos com pelo menos um carregador livre. */
  onlyAvailable: boolean;
};

export const EMPTY_FILTERS: StationFilters = {
  connectors: [],
  minPowerKw: null,
  amenities: [],
  onlyOpenNow: false,
  only24h: false,
  onlyAvailable: false,
};

export const CONNECTOR_OPTIONS: { value: ConnectorType; label: string }[] = [
  { value: "CCS2", label: "CCS Tipo 2" },
  { value: "CHAdeMO", label: "CHAdeMO" },
  { value: "Type2", label: "Tipo 2 (AC)" },
  { value: "GBT", label: "GB/T" },
];

export const POWER_OPTIONS: { value: number | null; label: string; hint: string }[] = [
  { value: null, label: "Qualquer", hint: "Todas as potências" },
  { value: 22, label: "22 kW+", hint: "Recarga semirrápida" },
  { value: 50, label: "50 kW+", hint: "DC rápido" },
  { value: 150, label: "150 kW+", hint: "DC ultrarrápido" },
];

export const AMENITY_OPTIONS: { value: AmenityKey; label: string }[] = [
  { value: "banheiro", label: "Banheiro" },
  { value: "wifi", label: "Wi-Fi" },
  { value: "cafe", label: "Café" },
  { value: "restaurante", label: "Restaurante" },
  { value: "mercado", label: "Mercado" },
  { value: "estacionamento", label: "Estacionamento coberto" },
  { value: "acessivel", label: "Acesso adaptado" },
];

/** Quantos filtros o usuário ativou — vira o número na bolinha do botão "Filtrar". */
export function countActiveFilters(filters: StationFilters): number {
  return (
    filters.connectors.length +
    filters.amenities.length +
    (filters.minPowerKw !== null ? 1 : 0) +
    (filters.onlyOpenNow ? 1 : 0) +
    (filters.only24h ? 1 : 0) +
    (filters.onlyAvailable ? 1 : 0)
  );
}

/** Alterna um valor dentro de uma lista de seleção múltipla. */
export function toggleInList<T>(list: T[], value: T): T[] {
  return list.includes(value) ? list.filter((item) => item !== value) : [...list, value];
}
