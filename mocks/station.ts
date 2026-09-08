import { ImageSourcePropType } from "react-native";

/* -------------------------------------------------------------------------- */
/* Tipos                                                                      */
/* -------------------------------------------------------------------------- */

/** Padrões de conector usados no Brasil. */
export type ConnectorType = "CCS2" | "CHAdeMO" | "Type2" | "GBT";

/** Corrente alternada (mais lenta) ou contínua (recarga rápida). */
export type CurrentType = "AC" | "DC";

export type ChargerStatus = "livre" | "ocupado" | "manutencao";

/** Chaves de comodidade — as mesmas usadas nos filtros de busca. */
export type AmenityKey =
  | "banheiro"
  | "wifi"
  | "cafe"
  | "restaurante"
  | "mercado"
  | "estacionamento"
  | "acessivel";

export type Charger = {
  id: string;
  connector: ConnectorType;
  powerKw: number;
  current: CurrentType;
  status: ChargerStatus;
};

/** Comodidade real por perto, com a distância a pé em metros. */
export type NearbyPlace = {
  name: string;
  amenity: AmenityKey;
  distanceMeters: number;
};

export type OpeningHours = {
  is24h: boolean;
  opensAt: string;
  closesAt: string;
  /** Dias em que abre (0 = domingo, igual ao getDay do JavaScript). */
  weekdays: number[];
};

export type Coordinates = {
  latitude: number;
  longitude: number;
};

export type Station = {
  id: string;
  name: string;
  /** Título completo exibido na ficha. */
  title: string;
  address: string;
  location: string;
  coordinates: Coordinates;
  photo: ImageSourcePropType;
  /** Fotos extras do ponto — alimentam o carrossel da ficha. */
  photos: ImageSourcePropType[];
  /** Ponto patrocinado aparece com destaque âmbar no mapa e na lista. */
  sponsored: boolean;
  rating: number;
  reviewsCount: number;
  /** Preço do kWh em reais. */
  priceKwh: number;
  distanceKm: number;
  etaMinutes: number;
  chargers: Charger[];
  amenities: AmenityKey[];
  nearbyPlaces: NearbyPlace[];
  accessibility: string[];
  paymentMethods: string[];
  openingHours: OpeningHours;
  /** Movimento estimado de 0 a 100 para cada hora do dia (24 posições). */
  busyByHour: number[];
  about: string;
};

/* -------------------------------------------------------------------------- */
/* Rótulos                                                                    */
/* -------------------------------------------------------------------------- */

export const CONNECTOR_LABELS: Record<ConnectorType, string> = {
  CCS2: "CCS Tipo 2",
  CHAdeMO: "CHAdeMO",
  Type2: "Tipo 2 (AC)",
  GBT: "GB/T",
};

export const AMENITY_LABELS: Record<AmenityKey, string> = {
  banheiro: "Banheiro",
  wifi: "Wi-Fi gratuito",
  cafe: "Café",
  restaurante: "Restaurante",
  mercado: "Mercado",
  estacionamento: "Estacionamento coberto",
  acessivel: "Acesso adaptado",
};

/** Ícone do MaterialCommunityIcons para cada comodidade. */
export const AMENITY_ICONS: Record<AmenityKey, string> = {
  banheiro: "toilet",
  wifi: "wifi",
  cafe: "coffee",
  restaurante: "silverware-fork-knife",
  mercado: "cart-outline",
  estacionamento: "garage",
  acessivel: "wheelchair-accessibility",
};

const TODOS_OS_DIAS = [0, 1, 2, 3, 4, 5, 6];
const DIAS_UTEIS = [1, 2, 3, 4, 5];

/* -------------------------------------------------------------------------- */
/* Dados simulados                                                            */
/* -------------------------------------------------------------------------- */

export const stationsMock: Station[] = [
  {
    id: "fluindo-pinheiros",
    name: "Flui(ndo)",
    title: "Flui(ndo) — Ponto de recarga",
    address: "R. dos Pinheiros, 1424",
    location: "Pinheiros, São Paulo",
    coordinates: { latitude: -23.5629, longitude: -46.6821 },
    photo: require("@/assets/images/ponto-recarga-fluindo.jpg"),
    photos: [
      require("@/assets/images/ponto-recarga-fluindo.jpg"),
      require("@/assets/images/ponto-recarga-EcoCargaItaim.jpg"),
      require("@/assets/images/ponto-recarga-RecargaFacilPaulista.jpg"),
    ],
    sponsored: true,
    rating: 4.9,
    reviewsCount: 16,
    priceKwh: 2.19,
    distanceKm: 3.2,
    etaMinutes: 8,
    chargers: [
      { id: "flu-1", connector: "CCS2", powerKw: 150, current: "DC", status: "livre" },
      { id: "flu-2", connector: "CCS2", powerKw: 150, current: "DC", status: "ocupado" },
      { id: "flu-3", connector: "Type2", powerKw: 22, current: "AC", status: "livre" },
    ],
    amenities: ["banheiro", "wifi", "cafe", "acessivel"],
    nearbyPlaces: [
      { name: "Café da esquina", amenity: "cafe", distanceMeters: 0 },
      { name: "Banheiro do posto", amenity: "banheiro", distanceMeters: 0 },
      { name: "Padaria Pinheirinho", amenity: "restaurante", distanceMeters: 180 },
    ],
    accessibility: [
      "Entrada e vaga adaptadas para cadeira de rodas",
      "Banheiro adaptado no local",
      "Piso tátil até o carregador",
    ],
    paymentMethods: ["Pix", "Cartão de crédito", "Cartão de débito", "Dinheiro"],
    openingHours: {
      is24h: false,
      opensAt: "06:00",
      closesAt: "22:30",
      weekdays: TODOS_OS_DIAS,
    },
    busyByHour: [
      5, 4, 3, 3, 4, 8, 18, 42, 68, 74, 55, 38, 30, 28, 32, 45, 62, 85, 92, 78, 54, 36, 20,
      10,
    ],
    about:
      "Ponto coberto com três carregadores, café e banheiro no local. Costuma esvaziar no meio da manhã.",
  },
  {
    id: "ecocarga-itaim-bibi",
    name: "EcoCarga Itaim",
    title: "EcoCarga Itaim — Ponto de recarga",
    address: "Av. Brig. Faria Lima, 3477",
    location: "Itaim Bibi, São Paulo",
    coordinates: { latitude: -23.585, longitude: -46.6797 },
    photo: require("@/assets/images/ponto-recarga-EcoCargaItaim.jpg"),
    photos: [
      require("@/assets/images/ponto-recarga-EcoCargaItaim.jpg"),
      require("@/assets/images/ponto-recarga-SantanaPowerPoint.jpg"),
    ],
    sponsored: false,
    rating: 4.6,
    reviewsCount: 42,
    priceKwh: 2.45,
    distanceKm: 5.8,
    etaMinutes: 14,
    chargers: [
      { id: "eco-1", connector: "CCS2", powerKw: 60, current: "DC", status: "livre" },
      { id: "eco-2", connector: "CCS2", powerKw: 60, current: "DC", status: "ocupado" },
      { id: "eco-3", connector: "CHAdeMO", powerKw: 50, current: "DC", status: "ocupado" },
      { id: "eco-4", connector: "Type2", powerKw: 11, current: "AC", status: "manutencao" },
    ],
    amenities: ["cafe", "wifi", "estacionamento", "restaurante"],
    nearbyPlaces: [
      { name: "Shopping Faria Lima", amenity: "mercado", distanceMeters: 240 },
      { name: "Praça de alimentação", amenity: "restaurante", distanceMeters: 260 },
      { name: "Estacionamento coberto", amenity: "estacionamento", distanceMeters: 0 },
    ],
    accessibility: ["Elevador até o subsolo", "Vaga reservada ao lado do carregador"],
    paymentMethods: ["Pix", "Cartão de crédito", "Cartão de débito"],
    openingHours: {
      is24h: false,
      opensAt: "08:00",
      closesAt: "23:00",
      weekdays: TODOS_OS_DIAS,
    },
    busyByHour: [
      8, 6, 5, 4, 5, 10, 22, 58, 82, 76, 60, 52, 66, 58, 44, 40, 58, 88, 95, 82, 60, 42, 26,
      14,
    ],
    about:
      "Fica no subsolo do shopping. Quatro carregadores, mas um está em manutenção nesta semana.",
  },
  {
    id: "volt-express-moema",
    name: "Volt Express Moema",
    title: "Volt Express Moema — Ponto de recarga",
    address: "Av. Ibirapuera, 2927",
    location: "Moema, São Paulo",
    coordinates: { latitude: -23.6001, longitude: -46.6664 },
    photo: require("@/assets/images/ponto-recarga-VoltExpressMoema.jpg"),
    photos: [require("@/assets/images/ponto-recarga-VoltExpressMoema.jpg")],
    sponsored: false,
    rating: 4.3,
    reviewsCount: 9,
    priceKwh: 1.98,
    distanceKm: 8.4,
    etaMinutes: 21,
    chargers: [
      { id: "volt-1", connector: "Type2", powerKw: 22, current: "AC", status: "livre" },
      { id: "volt-2", connector: "Type2", powerKw: 7, current: "AC", status: "livre" },
    ],
    amenities: ["banheiro", "acessivel"],
    nearbyPlaces: [
      { name: "Banheiro da loja", amenity: "banheiro", distanceMeters: 40 },
      { name: "Parque Ibirapuera", amenity: "restaurante", distanceMeters: 850 },
    ],
    accessibility: ["Banheiro adaptado", "Rampa de acesso na entrada"],
    paymentMethods: ["Pix", "Cartão de crédito"],
    openingHours: {
      is24h: false,
      opensAt: "09:00",
      closesAt: "20:00",
      weekdays: DIAS_UTEIS,
    },
    busyByHour: [
      0, 0, 0, 0, 0, 0, 0, 0, 0, 24, 30, 26, 38, 44, 36, 30, 42, 58, 66, 40, 0, 0, 0, 0,
    ],
    about:
      "Só carregadores AC — bom para quem vai deixar o carro parado algumas horas. Fecha aos fins de semana.",
  },
  {
    id: "recarga-facil-paulista",
    name: "Recarga Fácil Paulista",
    title: "Recarga Fácil Paulista — Ponto de recarga",
    address: "Av. Paulista, 1578",
    location: "Bela Vista, São Paulo",
    coordinates: { latitude: -23.5613, longitude: -46.6565 },
    photo: require("@/assets/images/ponto-recarga-RecargaFacilPaulista.jpg"),
    photos: [
      require("@/assets/images/ponto-recarga-RecargaFacilPaulista.jpg"),
      require("@/assets/images/ponto-recarga-fluindo.jpg"),
    ],
    sponsored: true,
    rating: 4.7,
    reviewsCount: 128,
    priceKwh: 2.65,
    distanceKm: 1.6,
    etaMinutes: 6,
    chargers: [
      { id: "paul-1", connector: "CCS2", powerKw: 180, current: "DC", status: "ocupado" },
      { id: "paul-2", connector: "CCS2", powerKw: 180, current: "DC", status: "ocupado" },
      { id: "paul-3", connector: "CCS2", powerKw: 90, current: "DC", status: "ocupado" },
      { id: "paul-4", connector: "CHAdeMO", powerKw: 50, current: "DC", status: "ocupado" },
      { id: "paul-5", connector: "Type2", powerKw: 22, current: "AC", status: "ocupado" },
      { id: "paul-6", connector: "Type2", powerKw: 22, current: "AC", status: "ocupado" },
    ],
    amenities: ["banheiro", "wifi", "mercado", "restaurante", "acessivel"],
    nearbyPlaces: [
      { name: "Conveniência 24h", amenity: "mercado", distanceMeters: 0 },
      { name: "Praça de alimentação MASP", amenity: "restaurante", distanceMeters: 320 },
      { name: "Banheiro público", amenity: "banheiro", distanceMeters: 60 },
    ],
    accessibility: [
      "Entrada nivelada, sem degraus",
      "Banheiro adaptado",
      "Vaga reservada próxima ao carregador",
    ],
    paymentMethods: ["Pix", "Cartão de crédito", "Cartão de débito", "Dinheiro"],
    openingHours: {
      is24h: true,
      opensAt: "00:00",
      closesAt: "23:59",
      weekdays: TODOS_OS_DIAS,
    },
    busyByHour: [
      28, 20, 16, 14, 18, 30, 55, 88, 96, 90, 72, 64, 78, 70, 62, 66, 84, 98, 99, 92, 74, 58,
      44, 34,
    ],
    about:
      "O ponto mais movimentado da região e o único aberto 24 horas. Agora está com todos os carregadores ocupados.",
  },
  {
    id: "santana-power-point",
    name: "Santana Power Point",
    title: "Santana Power Point — Ponto de recarga",
    address: "R. Voluntários da Pátria, 3050",
    location: "Santana, São Paulo",
    coordinates: { latitude: -23.506, longitude: -46.6236 },
    photo: require("@/assets/images/ponto-recarga-SantanaPowerPoint.jpg"),
    photos: [require("@/assets/images/ponto-recarga-SantanaPowerPoint.jpg")],
    sponsored: false,
    rating: 4.1,
    reviewsCount: 5,
    priceKwh: 2.05,
    distanceKm: 12.8,
    etaMinutes: 29,
    chargers: [
      { id: "san-1", connector: "CCS2", powerKw: 50, current: "DC", status: "livre" },
      { id: "san-2", connector: "GBT", powerKw: 30, current: "DC", status: "livre" },
    ],
    amenities: ["wifi", "estacionamento"],
    nearbyPlaces: [
      { name: "Estacionamento do mercado", amenity: "estacionamento", distanceMeters: 0 },
      { name: "Mercado Santana", amenity: "mercado", distanceMeters: 120 },
    ],
    accessibility: ["Entrada com acessibilidade para cadeira de rodas"],
    paymentMethods: ["Pix", "Cartão de débito"],
    openingHours: {
      is24h: false,
      opensAt: "07:00",
      closesAt: "21:30",
      weekdays: TODOS_OS_DIAS,
    },
    busyByHour: [
      2, 2, 2, 2, 2, 4, 12, 34, 48, 30, 22, 26, 40, 34, 24, 22, 36, 60, 72, 58, 38, 20, 8, 4,
    ],
    about:
      "Ponto tranquilo e um dos poucos da cidade com conector GB/T. Raramente tem fila fora do horário de pico.",
  },
  {
    id: "eletroposto-iguatemi",
    name: "Eletroposto Iguatemi",
    title: "Eletroposto Iguatemi — Ponto de recarga",
    address: "Av. Brig. Faria Lima, 2232",
    location: "Jardim Paulistano, São Paulo",
    coordinates: { latitude: -23.5762, longitude: -46.6892 },
    photo: require("@/assets/images/ponto-recarga-EcoCargaItaim.jpg"),
    photos: [require("@/assets/images/ponto-recarga-EcoCargaItaim.jpg")],
    sponsored: false,
    rating: 4.4,
    reviewsCount: 63,
    priceKwh: 2.3,
    distanceKm: 4.1,
    etaMinutes: 11,
    chargers: [
      { id: "igu-1", connector: "CCS2", powerKw: 120, current: "DC", status: "livre" },
      { id: "igu-2", connector: "CHAdeMO", powerKw: 50, current: "DC", status: "livre" },
      { id: "igu-3", connector: "Type2", powerKw: 11, current: "AC", status: "ocupado" },
    ],
    amenities: ["cafe", "restaurante", "banheiro", "estacionamento", "wifi", "acessivel"],
    nearbyPlaces: [
      { name: "Café do shopping", amenity: "cafe", distanceMeters: 90 },
      { name: "Praça de alimentação", amenity: "restaurante", distanceMeters: 140 },
      { name: "Banheiro família", amenity: "banheiro", distanceMeters: 110 },
    ],
    accessibility: [
      "Vaga PCD ao lado do carregador",
      "Elevador e banheiro adaptados no shopping",
    ],
    paymentMethods: ["Pix", "Cartão de crédito", "Cartão de débito"],
    openingHours: {
      is24h: false,
      opensAt: "10:00",
      closesAt: "22:00",
      weekdays: TODOS_OS_DIAS,
    },
    busyByHour: [
      0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 26, 30, 52, 46, 32, 28, 44, 70, 86, 74, 52, 30, 0, 0,
    ],
    about:
      "Fica no piso térreo do estacionamento do shopping, com todas as comodidades a menos de 150 metros.",
  },
];

/** Busca um ponto pelo id — usado pela ficha detalhada. */
export function getStationById(id?: string | null): Station | undefined {
  if (!id) return undefined;
  return stationsMock.find((station) => station.id === id);
}
