
export const DARK_MAP_STYLE = [
  { elementType: "geometry", stylers: [{ color: "#122029" }] },
  { elementType: "labels.icon", stylers: [{ visibility: "off" }] },
  { elementType: "labels.text.fill", stylers: [{ color: "#8fa6b1" }] },
  { elementType: "labels.text.stroke", stylers: [{ color: "#0b161c" }] },
  {
    featureType: "administrative",
    elementType: "geometry.stroke",
    stylers: [{ color: "#2b414c" }],
  },
  {
    featureType: "poi",
    stylers: [{ visibility: "off" }],
  },
  {
    featureType: "poi.park",
    elementType: "geometry",
    stylers: [{ color: "#132e26" }, { visibility: "on" }],
  },
  {
    featureType: "road",
    elementType: "geometry",
    stylers: [{ color: "#22383f" }],
  },
  {
    featureType: "road.arterial",
    elementType: "geometry",
    stylers: [{ color: "#2d4751" }],
  },
  {
    featureType: "road.highway",
    elementType: "geometry",
    stylers: [{ color: "#3a5b68" }],
  },
  {
    featureType: "transit",
    stylers: [{ visibility: "off" }],
  },
  {
    featureType: "water",
    elementType: "geometry",
    stylers: [{ color: "#0a1a22" }],
  },
];
