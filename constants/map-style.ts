/**
 * Estilo escuro do Google Maps alinhado à identidade visual do Flui.
 * As vias ficam mais claras que o fundo para manter contraste suficiente,
 * e os POIs são escondidos para que os marcadores de recarga se destaquem.
 */
export const DARK_MAP_STYLE = [
  { elementType: "geometry", stylers: [{ color: "#242322" }] },
  { elementType: "labels.icon", stylers: [{ visibility: "off" }] },
  { elementType: "labels.text.fill", stylers: [{ color: "#9C9A99" }] },
  { elementType: "labels.text.stroke", stylers: [{ color: "#1B1A19" }] },
  {
    featureType: "administrative",
    elementType: "geometry.stroke",
    stylers: [{ color: "#3F3D3C" }],
  },
  {
    featureType: "poi",
    stylers: [{ visibility: "off" }],
  },
  {
    featureType: "poi.park",
    elementType: "geometry",
    stylers: [{ color: "#1E2B24" }, { visibility: "on" }],
  },
  {
    featureType: "road",
    elementType: "geometry",
    stylers: [{ color: "#3D3B3A" }],
  },
  {
    featureType: "road.arterial",
    elementType: "geometry",
    stylers: [{ color: "#4A4746" }],
  },
  {
    featureType: "road.highway",
    elementType: "geometry",
    stylers: [{ color: "#5B5654" }],
  },
  {
    featureType: "transit",
    stylers: [{ visibility: "off" }],
  },
  {
    featureType: "water",
    elementType: "geometry",
    stylers: [{ color: "#141313" }],
  },
];
