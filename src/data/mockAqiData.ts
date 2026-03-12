export interface CityAqi {
  id: string;
  name: string;
  country: string;
  aqi: number;
  lat: number;
  lng: number;
  pollutants: {
    pm25: number;
    pm10: number;
    o3: number;
    no2: number;
    so2: number;
    co: number;
  };
  updatedAt: string;
}

export interface RouteOption {
  id: string;
  name: string;
  distance: string;
  duration: string;
  avgAqi: number;
  path: [number, number][];
  color: string;
}

export const cities: CityAqi[] = [
  {
    id: "delhi",
    name: "New Delhi",
    country: "India",
    aqi: 187,
    lat: 28.6139,
    lng: 77.209,
    pollutants: { pm25: 92, pm10: 145, o3: 34, no2: 58, so2: 18, co: 1.4 },
    updatedAt: "2 min ago",
  },
  {
    id: "mumbai",
    name: "Mumbai",
    country: "India",
    aqi: 112,
    lat: 19.076,
    lng: 72.8777,
    pollutants: { pm25: 55, pm10: 88, o3: 41, no2: 40, so2: 12, co: 0.9 },
    updatedAt: "5 min ago",
  },
  {
    id: "london",
    name: "London",
    country: "UK",
    aqi: 42,
    lat: 51.5074,
    lng: -0.1278,
    pollutants: { pm25: 12, pm10: 22, o3: 55, no2: 28, so2: 5, co: 0.3 },
    updatedAt: "1 min ago",
  },
  {
    id: "beijing",
    name: "Beijing",
    country: "China",
    aqi: 156,
    lat: 39.9042,
    lng: 116.4074,
    pollutants: { pm25: 78, pm10: 120, o3: 28, no2: 52, so2: 22, co: 1.2 },
    updatedAt: "3 min ago",
  },
  {
    id: "tokyo",
    name: "Tokyo",
    country: "Japan",
    aqi: 38,
    lat: 35.6762,
    lng: 139.6503,
    pollutants: { pm25: 10, pm10: 18, o3: 48, no2: 22, so2: 4, co: 0.2 },
    updatedAt: "1 min ago",
  },
  {
    id: "newyork",
    name: "New York",
    country: "USA",
    aqi: 58,
    lat: 40.7128,
    lng: -74.006,
    pollutants: { pm25: 18, pm10: 30, o3: 62, no2: 32, so2: 8, co: 0.5 },
    updatedAt: "4 min ago",
  },
  {
    id: "paris",
    name: "Paris",
    country: "France",
    aqi: 51,
    lat: 48.8566,
    lng: 2.3522,
    pollutants: { pm25: 15, pm10: 25, o3: 58, no2: 30, so2: 6, co: 0.4 },
    updatedAt: "2 min ago",
  },
  {
    id: "sydney",
    name: "Sydney",
    country: "Australia",
    aqi: 25,
    lat: -33.8688,
    lng: 151.2093,
    pollutants: { pm25: 6, pm10: 12, o3: 35, no2: 14, so2: 2, co: 0.1 },
    updatedAt: "1 min ago",
  },
];

export const sampleRoutes: RouteOption[] = [
  {
    id: "green",
    name: "🌿 Green Route",
    distance: "12.4 km",
    duration: "28 min",
    avgAqi: 28,
    path: [
      [28.6139, 77.209],
      [28.62, 77.215],
      [28.625, 77.225],
      [28.63, 77.235],
      [28.635, 77.245],
      [28.64, 77.25],
    ],
    color: "#22c55e",
  },
  {
    id: "balanced",
    name: "⚖️ Balanced Route",
    distance: "10.8 km",
    duration: "22 min",
    avgAqi: 72,
    path: [
      [28.6139, 77.209],
      [28.618, 77.22],
      [28.625, 77.23],
      [28.632, 77.24],
      [28.64, 77.25],
    ],
    color: "#f59e0b",
  },
  {
    id: "fastest",
    name: "⚡ Fastest Route",
    distance: "9.2 km",
    duration: "18 min",
    avgAqi: 145,
    path: [
      [28.6139, 77.209],
      [28.62, 77.225],
      [28.63, 77.24],
      [28.64, 77.25],
    ],
    color: "#ef4444",
  },
];

export function getAqiLevel(aqi: number) {
  if (aqi <= 50) return { label: "Good", color: "bg-green-500", textColor: "text-green-700", emoji: "😊", advice: "Air quality is satisfactory. Enjoy outdoor activities!" };
  if (aqi <= 100) return { label: "Moderate", color: "bg-yellow-500", textColor: "text-yellow-700", emoji: "🙂", advice: "Acceptable air quality. Sensitive individuals should limit prolonged outdoor exertion." };
  if (aqi <= 150) return { label: "Unhealthy for Sensitive", color: "bg-orange-500", textColor: "text-orange-700", emoji: "😷", advice: "Members of sensitive groups may experience health effects. Reduce prolonged outdoor exertion." };
  if (aqi <= 200) return { label: "Unhealthy", color: "bg-red-500", textColor: "text-red-700", emoji: "🤢", advice: "Everyone may begin to experience health effects. Avoid prolonged outdoor exertion." };
  if (aqi <= 300) return { label: "Very Unhealthy", color: "bg-purple-500", textColor: "text-purple-700", emoji: "⚠️", advice: "Health alert: everyone may experience serious effects. Stay indoors if possible." };
  return { label: "Hazardous", color: "bg-rose-900", textColor: "text-rose-900", emoji: "☠️", advice: "Health emergency. All individuals should avoid outdoor activities." };
}
