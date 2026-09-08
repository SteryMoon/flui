

import { Platform } from "react-native";

const tintColorLight = "#0a7ea4";
const tintColorDark = "#fff";

export const BrandColors = {
  background: "#0e1b22",
  text: "#ffffff",
  mutedText: "#9fb3bd",
  border: "#d7e2e8",
  inputText: "#3a4a52",
  primary: "#157bb8",
  primaryDark: "#0c4e77",
};

export const FluiColors = {

  background: "#0e1b22",
  text: "#ffffff",
  mutedText: "#9fb3bd",
  inputBackground: "#ffffff",
  inputText: "#3a4a52",
  border: "#d7e2e8",

  primary: "#157bb8",
  primaryDark: "#0c4e77",
  primaryLight: "#47b7f8",
  card: "#1a2e38",
  surface: "#12222b",
  surfaceAlt: "#2a414c",
  skeleton: "#243a45",
  placeholder: "#d9d9d9",

  sponsored: "#C98A2C",
  available: "#21b383",
  danger: "#FF5353",
  chipInactive: "#1f343e",
  star: "#F5B301",
  markerSponsored: "#EF9F27",
  markerLivre: "#21b383",
  markerClosed: "#E24B4A",
  busyLow: "#21b383",
  busyMedium: "#e0a226",
  busyHigh: "#e24b4a",
  sponsoredBg: "#412402",
  sponsoredText: "#FAC775",
  livreBg: "#06342a",
  livreText: "#5DCAA5",
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
};

export const BorderRadius = {
  input: 4,
  button: 24,
  card: 12,
};


export const Motion = {
  fast: 120,
  base: 260,
  slow: 380,
  spring: { damping: 14, stiffness: 180, mass: 0.6 },
};

export const FluiFonts = {
  josefin: {
    regular: "JosefinSans_400Regular",
    bold: "JosefinSans_700Bold",
  },
  inter: {
    regular: "Inter_400Regular",
    medium: "Inter_500Medium",
    semiBold: "Inter_600SemiBold",
    bold: "Inter_700Bold",
  },
};

export const Colors = {
  light: {
    text: "#11181C",
    background: "#fff",
    tint: tintColorLight,
    icon: "#687076",
    tabIconDefault: "#687076",
    tabIconSelected: tintColorLight,
  },
  dark: {
    text: "#ECEDEE",
    background: "#151718",
    tint: tintColorDark,
    icon: "#9BA1A6",
    tabIconDefault: "#9BA1A6",
    tabIconSelected: tintColorDark,
  },
};

export const Fonts = Platform.select({
  ios: {
    sans: "system-ui",
    serif: "ui-serif",
    rounded: "ui-rounded",
    mono: "ui-monospace",
  },
  default: {
    sans: "normal",
    serif: "serif",
    rounded: "normal",
    mono: "monospace",
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded:
      "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});
