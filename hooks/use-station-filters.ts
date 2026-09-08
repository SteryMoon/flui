import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { EMPTY_FILTERS, StationFilters } from "@/constants/filters";
import { Station, stationsMock } from "@/mocks/station";
import { getAvailableChargers, getMaxPowerKw, isOpenNow } from "@/utils/station";

const FAKE_LATENCY_MS = 650;

export function applyFilters(
  stations: Station[],
  filters: StationFilters,
  query = "",
  now: Date = new Date(),
): Station[] {
  const termo = query.trim().toLowerCase();

  return stations.filter((station) => {
    if (termo.length > 0) {
      const alvo = `${station.name} ${station.location} ${station.address}`.toLowerCase();
      if (!alvo.includes(termo)) return false;
    }

    if (filters.connectors.length > 0) {
      const aceita = station.chargers.some((charger) =>
        filters.connectors.includes(charger.connector),
      );
      if (!aceita) return false;
    }

    if (filters.minPowerKw !== null && getMaxPowerKw(station) < filters.minPowerKw) {
      return false;
    }

    if (filters.amenities.length > 0) {
      const temTodas = filters.amenities.every((amenity) =>
        station.amenities.includes(amenity),
      );
      if (!temTodas) return false;
    }

    if (filters.onlyOpenNow && !isOpenNow(station, now)) return false;
    if (filters.only24h && !station.openingHours.is24h) return false;
    if (filters.onlyAvailable && getAvailableChargers(station) === 0) return false;

    return true;
  });
}


export function useStationFilters(stations: Station[] = stationsMock) {
  const [filters, setFilters] = useState<StationFilters>(EMPTY_FILTERS);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const primeiraRenderizacao = useRef(true);

  const results = useMemo(
    () => applyFilters(stations, filters, query),
    [stations, filters, query],
  );

  useEffect(() => {
    if (primeiraRenderizacao.current) {
      primeiraRenderizacao.current = false;
      return;
    }
    setLoading(true);
    const timer = setTimeout(() => setLoading(false), FAKE_LATENCY_MS);
    return () => clearTimeout(timer);
  }, [filters, query]);

  const clearFilters = useCallback(() => setFilters(EMPTY_FILTERS), []);

  return {
    filters,
    setFilters,
    query,
    setQuery,
    results,
    loading,
    clearFilters,
  };
}
