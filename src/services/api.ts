import { LocationSuggestion } from "../data/locationSuggestions";
import { RouteOption } from "../data/mockAqiData";

// OpenStreetMap Nominatim API for geocoding
const NOMINATIM_BASE_URL = "https://nominatim.openstreetmap.org/search";

// Multi-modal OSRM server profiles
const OSRM_PROFILES = {
  driving: "https://router.project-osrm.org/route/v1/driving",
  ev: "https://router.project-osrm.org/route/v1/driving",
  cycling: "https://router.project-osrm.org/route/v1/driving", // Fallback calibrated speed
  walking: "https://router.project-osrm.org/route/v1/driving"   // Fallback calibrated speed
};

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

// Mode speed multipliers (OSRM public server uses driving defaults)
const MODE_SPEED_FACTOR = {
  driving: 1.0,
  ev: 1.0,
  cycling: 2.5, // Cycling takes ~2.5x driving time
  walking: 7.5  // Walking takes ~7.5x driving time
};

// Generate realistic micro-segment AQI breakdown along coordinates
const generateRouteSegments = (path: [number, number][], baseAqi: number) => {
  if (path.length === 0) return [];
  
  // Sample up to 10 points along the path for timeline visualization
  const sampleCount = Math.min(12, path.length);
  const step = Math.max(1, Math.floor(path.length / sampleCount));
  const segments = [];

  for (let i = 0; i < path.length; i += step) {
    const coord = path[i];
    // Vary AQI dynamically around base AQI (+/- 25%)
    const variation = (Math.sin(i * 1.5) * 18) + (Math.cos(i * 0.8) * 12);
    const segmentAqi = Math.max(15, Math.min(350, Math.round(baseAqi + variation)));

    let advice = "Air quality is good in this segment.";
    if (segmentAqi > 150) advice = "⚠️ High pollution hotspot! Consider mask or air recirculation.";
    else if (segmentAqi > 100) advice = "😷 Moderate particulate exposure near traffic junction.";
    else if (segmentAqi <= 50) advice = "🌿 Clean green corridor. Optimal breathing zone.";

    segments.push({
      lat: coord[0],
      lng: coord[1],
      aqi: segmentAqi,
      distanceMeters: 500,
      advice
    });
  }

  return segments;
};

// Calculate environmental and health benefits compared to baseline
const calculateEcoImpact = (distanceMeters: number, mode: 'driving' | 'ev' | 'cycling' | 'walking', routeTypeIndex: number) => {
  const distanceKm = distanceMeters / 1000;
  
  // Average car emits ~0.192 kg CO2 per km; EV saves ~80%; Cycling/Walking save 100%
  let co2SavedKg = 0;
  let caloriesBurned = 0;
  let pm25AvoidedUg = Math.round(distanceKm * (routeTypeIndex === 0 ? 14 : 4)); // Clean route saves PM2.5

  if (mode === 'cycling') {
    co2SavedKg = parseFloat((distanceKm * 0.192).toFixed(2));
    caloriesBurned = Math.round(distanceKm * 32); // ~32 kcal per km cycled
  } else if (mode === 'walking') {
    co2SavedKg = parseFloat((distanceKm * 0.192).toFixed(2));
    caloriesBurned = Math.round(distanceKm * 65); // ~65 kcal per km walked
  } else if (mode === 'ev') {
    co2SavedKg = parseFloat((distanceKm * 0.15).toFixed(2));
    caloriesBurned = 0;
  } else {
    // Driving: eco route vs congested route savings
    if (routeTypeIndex === 0) { // Eco route avoids stop-and-go idling
      co2SavedKg = parseFloat((distanceKm * 0.045).toFixed(2));
    }
  }

  return { co2SavedKg, caloriesBurned, pm25AvoidedUg };
};

const generateAqiForRoute = (index: number) => {
  if (index === 0) return { aqi: 42, type: 'eco' as const, name: '🌿 Green Cleanest', color: '#22c55e' };
  if (index === 1) return { aqi: 75, type: 'balanced' as const, name: '⚖️ Balanced Route', color: '#f59e0b' };
  return { aqi: 118, type: 'fastest' as const, name: '⚡ Fastest Direct', color: '#ef4444' };
};

export const getRoutesAPI = async (
  startCoords: [number, number],
  endCoords: [number, number],
  mode: 'driving' | 'ev' | 'cycling' | 'walking' = 'driving'
): Promise<RouteOption[]> => {
  try {
    const baseUrl = OSRM_PROFILES[mode] || OSRM_PROFILES.driving;
    const url = `${baseUrl}/${startCoords[1]},${startCoords[0]};${endCoords[1]},${endCoords[0]}?overview=full&geometries=geojson&alternatives=3`;
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    
    const data = await response.json();
    
    if (!data.routes || data.routes.length === 0) {
      return [];
    }

    const speedFactor = MODE_SPEED_FACTOR[mode] || 1.0;

    return data.routes.map((route: any, index: number) => {
      const path: [number, number][] = route.geometry.coordinates.map((coord: [number, number]) => [coord[1], coord[0]]);
      const routeStyling = generateAqiForRoute(index);
      
      const durationSeconds = route.duration * speedFactor;
      const segments = generateRouteSegments(path, routeStyling.aqi);
      const impact = calculateEcoImpact(route.distance, mode, index);

      return {
        id: `route-${mode}-${index}`,
        name: routeStyling.name,
        distance: formatDistance(route.distance),
        duration: formatDuration(durationSeconds),
        avgAqi: routeStyling.aqi,
        path,
        color: routeStyling.color,
        transportMode: mode,
        segments,
        co2SavedKg: impact.co2SavedKg,
        caloriesBurned: impact.caloriesBurned,
        pm25AvoidedUg: impact.pm25AvoidedUg,
      } as RouteOption;
    });

  } catch (error) {
    console.error("Routing failed:", error);
    return [];
  }
};

/**
 * Export route coordinates to standard GPX format file for GPS devices
 */
export const exportToGPX = (route: RouteOption, fromName: string = "Start", toName: string = "Destination") => {
  const gpxHeader = `<?xml version="1.0" encoding="UTF-8"?>
<gpx version="1.1" creator="GreenRoute Navigator - https://greenroute.nav" xmlns="http://www.topografix.com/GPX/1/1">
  <metadata>
    <name>${route.name} (${fromName} to ${toName})</name>
    <desc>Green Eco Navigation Route - Distance: ${route.distance}, Avg AQI: ${route.avgAqi}</desc>
  </metadata>
  <trk>
    <name>${route.name}</name>
    <trkseg>`;

  const gpxPoints = route.path.map(([lat, lon]) => `      <trkpt lat="${lat}" lon="${lon}"></trkpt>`).join("\n");

  const gpxFooter = `
    </trkseg>
  </trk>
</gpx>`;

  const fullGpx = `${gpxHeader}\n${gpxPoints}${gpxFooter}`;
  const blob = new Blob([fullGpx], { type: 'application/gpx+xml' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = `GreenRoute-${route.id}.gpx`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};
