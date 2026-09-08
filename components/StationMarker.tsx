import { MaterialCommunityIcons } from "@expo/vector-icons";
import { memo, useEffect, useState } from "react";
import { Platform, StyleSheet, Text, View } from "react-native";
import { Marker } from "react-native-maps";

import { FluiColors } from "@/constants/theme";
import type { Station } from "@/mocks/station";
import {
  getAvailableChargers,
  getMaxPowerKw,
  getStationStatus,
  getStatusColor,
  hasFastCharging,
} from "@/utils/station";

type StationMarkerProps = {
  station: Station;
  selected: boolean;
  onPress: (station: Station) => void;
};


function StationMarkerComponent({ station, selected, onPress }: StationMarkerProps) {
  const status = getStationStatus(station);
  const color = getStatusColor(station);
  const rapido = hasFastCharging(station);
  const disponiveis = getAvailableChargers(station);

  
  const [tracksChanges, setTracksChanges] = useState(true);
  useEffect(() => {
    setTracksChanges(true);
    const timer = setTimeout(() => setTracksChanges(false), 600);
    return () => clearTimeout(timer);
  }, [selected, status]);

  return (
    <Marker
      coordinate={station.coordinates}
      onPress={() => onPress(station)}
      anchor={{ x: 0.5, y: 1 }}
      tracksViewChanges={Platform.OS === "android" ? tracksChanges : true}
      zIndex={selected ? 99 : station.sponsored ? 10 : 1}
      accessibilityLabel={`${station.name}. ${
        status === "fechado"
          ? "Fechado agora"
          : `${disponiveis} de ${station.chargers.length} carregadores livres`
      }. Até ${getMaxPowerKw(station)} quilowatts.`}
    >
      <View style={styles.wrapper} pointerEvents="none">
        <View
          style={[
            styles.bubble,
            { backgroundColor: color },
            selected && styles.bubbleSelected,
            station.sponsored && styles.bubbleSponsored,
          ]}
        >
          <MaterialCommunityIcons
            name={rapido ? "lightning-bolt" : "power-plug"}
            size={selected ? 16 : 13}
            color="#FFFFFF"
          />
          <Text style={[styles.power, selected && styles.powerSelected]}>
            {getMaxPowerKw(station)}
          </Text>
        </View>
        <View style={[styles.pointer, { borderTopColor: color }]} />
      </View>
    </Marker>
  );
}

export const StationMarker = memo(StationMarkerComponent);

const styles = StyleSheet.create({
  bubble: {
    alignItems: "center",
    borderColor: "rgba(255,255,255,0.85)",
    borderRadius: 16,
    borderWidth: 1.5,
    flexDirection: "row",
    gap: 3,
    paddingHorizontal: 8,
    paddingVertical: 5,
  },
  bubbleSelected: {
    borderColor: "#FFFFFF",
    borderWidth: 2.5,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  bubbleSponsored: {
    borderColor: FluiColors.sponsoredText,
  },
  pointer: {
    borderLeftColor: "transparent",
    borderLeftWidth: 5,
    borderRightColor: "transparent",
    borderRightWidth: 5,
    borderTopWidth: 7,
    marginTop: -1,
  },
  power: {
    color: "#FFFFFF",
    fontSize: 11,
    fontWeight: "700",
  },
  powerSelected: {
    fontSize: 13,
  },
  wrapper: {
    alignItems: "center",
  },
});
