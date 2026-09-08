import { FluiColors } from "@/constants/theme";
import type { Station } from "@/mocks/station";

/* -------------------------------------------------------------------------- */
/* Horário de funcionamento                                                   */
/* -------------------------------------------------------------------------- */

/** Converte "22:30" em minutos desde a meia-noite (1350). */
function toMinutes(time: string): number {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
}

/**
 * Diz se o ponto está aberto no momento informado.
 * Suporta horários que viram o dia (ex.: abre 22:00 e fecha 04:00).
 */
export function isOpenNow(station: Station, now: Date = new Date()): boolean {
  const { is24h, opensAt, closesAt, weekdays } = station.openingHours;

  if (!weekdays.includes(now.getDay())) return false;
  if (is24h) return true;

  const current = now.getHours() * 60 + now.getMinutes();
  const opens = toMinutes(opensAt);
  const closes = toMinutes(closesAt);

  return opens <= closes
    ? current >= opens && current < closes
    : current >= opens || current < closes;
}

/** Texto curto de horário para exibir em cards e na ficha. */
export function formatOpeningHours(station: Station): string {
  const { is24h, opensAt, closesAt } = station.openingHours;
  return is24h ? "Aberto 24 horas" : `${opensAt} às ${closesAt}`;
}

const WEEKDAY_NAMES = [
  "Domingo",
  "Segunda",
  "Terça",
  "Quarta",
  "Quinta",
  "Sexta",
  "Sábado",
];

/** Lista de dias com o horário de cada um, para a seção "Horários" da ficha. */
export function getWeeklySchedule(station: Station) {
  return WEEKDAY_NAMES.map((label, weekday) => ({
    weekday,
    label,
    hours: station.openingHours.weekdays.includes(weekday)
      ? formatOpeningHours(station)
      : "Fechado",
    isToday: weekday === new Date().getDay(),
  }));
}

/* -------------------------------------------------------------------------- */
/* Carregadores e potência                                                    */
/* -------------------------------------------------------------------------- */

export function getAvailableChargers(station: Station): number {
  return station.chargers.filter((charger) => charger.status === "livre").length;
}

export function getMaxPowerKw(station: Station): number {
  return station.chargers.reduce((max, charger) => Math.max(max, charger.powerKw), 0);
}

/** Conectores únicos oferecidos pelo ponto, na ordem em que aparecem. */
export function getConnectorTypes(station: Station) {
  return Array.from(new Set(station.chargers.map((charger) => charger.connector)));
}

export function hasFastCharging(station: Station): boolean {
  return station.chargers.some(
    (charger) => charger.current === "DC" && charger.powerKw >= 50,
  );
}

/* -------------------------------------------------------------------------- */
/* Status agregado (usado nos marcadores do mapa)                             */
/* -------------------------------------------------------------------------- */

export type StationStatus = "fechado" | "livre" | "lotado";

export function getStationStatus(station: Station, now: Date = new Date()): StationStatus {
  if (!isOpenNow(station, now)) return "fechado";
  return getAvailableChargers(station) > 0 ? "livre" : "lotado";
}

/** Cor do marcador / borda do card conforme status e patrocínio. */
export function getStatusColor(station: Station, now: Date = new Date()): string {
  const status = getStationStatus(station, now);
  if (status === "fechado") return FluiColors.markerClosed;
  if (status === "lotado") return FluiColors.busyMedium;
  return station.sponsored ? FluiColors.markerSponsored : FluiColors.markerLivre;
}

export function getStatusLabel(station: Station, now: Date = new Date()): string {
  const status = getStationStatus(station, now);
  if (status === "fechado") return "Fechado";
  if (status === "lotado") return "Todos ocupados";
  return "Livre";
}

/* -------------------------------------------------------------------------- */
/* Movimento e períodos de menor movimento                                    */
/* -------------------------------------------------------------------------- */

export type BusyLevel = "baixo" | "medio" | "alto";

export function getBusyLevel(value: number): BusyLevel {
  if (value < 35) return "baixo";
  if (value < 65) return "medio";
  return "alto";
}

export function getBusyColor(value: number): string {
  const level = getBusyLevel(value);
  if (level === "baixo") return FluiColors.busyLow;
  if (level === "medio") return FluiColors.busyMedium;
  return FluiColors.busyHigh;
}

export function getBusyLabel(value: number): string {
  const level = getBusyLevel(value);
  if (level === "baixo") return "Pouco movimentado";
  if (level === "medio") return "Movimentado";
  return "Muito movimentado";
}

/** Movimento estimado para a hora atual. */
export function getCurrentBusy(station: Station, now: Date = new Date()): number {
  return station.busyByHour[now.getHours()] ?? 0;
}

export type QuietWindow = {
  startHour: number;
  endHour: number;
  label: string; // "10h às 12h"
  average: number;
};

/**
 * Agrupa as horas de menor movimento em faixas contínuas.
 * Só considera horas dentro do funcionamento do ponto, para não sugerir
 * um horário em que o motorista encontraria a porta fechada.
 */
export function getQuietWindows(station: Station, threshold = 35): QuietWindow[] {
  const { is24h, opensAt, closesAt } = station.openingHours;
  const openHour = is24h ? 0 : Number(opensAt.split(":")[0]);
  const closeHour = is24h ? 23 : Number(closesAt.split(":")[0]);

  const windows: QuietWindow[] = [];
  let start: number | null = null;
  let sum = 0;
  let count = 0;

  const close = (endHour: number) => {
    if (start === null) return;
    windows.push({
      startHour: start,
      endHour,
      label: `${String(start).padStart(2, "0")}h às ${String(endHour).padStart(2, "0")}h`,
      average: Math.round(sum / count),
    });
    start = null;
    sum = 0;
    count = 0;
  };

  for (let hour = 0; hour < 24; hour += 1) {
    const dentroDoHorario = hour >= openHour && hour <= closeHour;
    const value = station.busyByHour[hour] ?? 100;

    if (dentroDoHorario && value < threshold) {
      if (start === null) start = hour;
      sum += value;
      count += 1;
    } else {
      close(hour);
    }
  }
  close(24 > closeHour ? closeHour : 23);

  // Faixas de uma hora só não ajudam a decidir: mantemos as de 2h ou mais.
  const relevantes = windows.filter((w) => w.endHour - w.startHour >= 2);
  return relevantes.length > 0 ? relevantes : windows;
}

/** Frase pronta com o melhor horário para recarregar. */
export function getBestTimeLabel(station: Station): string {
  const windows = getQuietWindows(station);
  if (windows.length === 0) return "Movimento parecido ao longo do dia";
  const melhor = windows.reduce((a, b) => (a.average <= b.average ? a : b));
  return `Melhor horário: ${melhor.label}`;
}

/* -------------------------------------------------------------------------- */
/* Formatação                                                                 */
/* -------------------------------------------------------------------------- */

export function formatPrice(value: number): string {
  return `R$ ${value.toFixed(2).replace(".", ",")}`;
}

export function formatDistance(km: number): string {
  return km < 1 ? `${Math.round(km * 1000)} m` : `${km.toFixed(1).replace(".", ",")} km`;
}

export function formatMeters(meters: number): string {
  if (meters === 0) return "No local";
  return meters < 1000 ? `${meters} m` : `${(meters / 1000).toFixed(1).replace(".", ",")} km`;
}

export function formatPower(kw: number): string {
  return `${kw} kW`;
}
