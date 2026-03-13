import { LocationSuggestion } from "../data/locationSuggestions";
import { RouteOption } from "../data/mockAqiData";

// OpenStreetMap Nominatim API for geocoding
const NOMINATIM_BASE_URL = "https://nominatim.openstreetmap.org/search";

// OSRM Public Server for routing
const OSRM_BASE_URL = "https://router.project-osrm.org/route/v1/driving";

export const searchQueryLocations = async (query: string): Promise<LocationSuggestion[]> => {
  if (!query || query.length < 2) return [];

  try {
    const response = await fetch(`${NOMINATIM_BASE_URL}?format=json&q=${encodeURIComponent(query)}&limit=8`);
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    const data = await response.json();
    
    return data.map((item: any) => ({
      id: item.place_id.toString(),
      name: item.display_name.split(',')[0],
      parent: item.display_name.split(',').slice(1).join(',').trim(),
      type: "locality",
      lat: parseFloat(item.lat),
      lon: parseFloat(item.lon),
      popularity: item.importance ? Math.round(item.importance * 100) : 50
    }));
  } catch (error) {
    console.error("Geocoding failed:", error);
    return [];
  }
};

const formatDistance = (meters: number): string => {
  if (meters < 1000) return `${Math.round(meters)} m`;
  return `${(meters / 1000).toFixed(1)} km`;
};

const formatDuration = (seconds: number): string => {
  const min = Math.round(seconds / 60);
  if (min < 60) return `${min} min`;
  const hrs = Math.floor(min / 60);
  const remainingMin = min % 60;
  return `${hrs} hr ${remainingMin} min`;
};

// Dummy AQI Generator based on route context to satisfy the UI requirement of eco-routing
const generateAqiForRoute = (index: number) => {
  if (index === 0) return { aqi: 45, type: 'eco' as const, name: '🌿 Green Route', color: '#22c55e' }; // First alt is usually greener in our mock logic
  if (index === 1) return { aqi: 72, type: 'balanced' as const, name: '⚖️ Balanced Route', color: '#f59e0b' };
  return { aqi: 105, type: 'fastest' as const, name: '⚡ Fastest Route', color: '#ef4444' };
};

export const getRoutesAPI = async (startCoords: [number, number], endCoords: [number, number]): Promise<RouteOption[]> => {
  try {
    // OSRM coordinates are in longitude, latitude format
    const url = `${OSRM_BASE_URL}/${startCoords[1]},${startCoords[0]};${endCoords[1]},${endCoords[0]}?overview=full&geometries=geojson&alternatives=3`;
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    
    const data = await response.json();
    
    if (!data.routes || data.routes.length === 0) {
      return [];
    }

    return data.routes.map((route: any, index: number) => {
      // OSRM GeoJSON geometry returns [lon, lat], Leaflet wants [lat, lon]
      const path: [number, number][] = route.geometry.coordinates.map((coord: [number, number]) => [coord[1], coord[0]]);
      
      const routeStyling = generateAqiForRoute(index);

      return {
        id: `route-${index}`,
        name: routeStyling.name,
        distance: formatDistance(route.distance),
        duration: formatDuration(route.duration),
        avgAqi: routeStyling.aqi,
        path,
        color: routeStyling.color,
      } as RouteOption;
    });

  } catch (error) {
    console.error("Routing failed:", error);
    return [];
  }
};
