export interface TurnStep {
  id: string;
  iconType: 'straight' | 'turn-left' | 'turn-right' | 'slight-left' | 'slight-right' | 'u-turn' | 'destination';
  instruction: string;
  distanceMeters: number;
  lat: number;
  lng: number;
  aqi: number;
  pathIndex: number;
}

/**
 * Calculates bearing angle in degrees between two GPS coordinates
 */
export function calculateBearing(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const toDeg = (rad: number) => (rad * 180) / Math.PI;

  const dLon = toRad(lon2 - lon1);
  const y = Math.sin(dLon) * Math.cos(toRad(lat2));
  const x =
    Math.cos(toRad(lat1)) * Math.sin(toRad(lat2)) -
    Math.sin(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.cos(dLon);

  let brng = toDeg(Math.atan2(y, x));
  return (brng + 360) % 360;
}

/**
 * Haversine formula to calculate distance between two coordinates in meters
 */
export function calculateDistanceMeters(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371000; // Earth radius in meters
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Automatically parses coordinate path changes to generate realistic turn-by-turn navigation steps
 */
export function generateTurnSteps(
  path: [number, number][],
  segments?: { lat: number; lng: number; aqi: number; advice?: string }[]
): TurnStep[] {
  if (!path || path.length < 2) return [];

  const steps: TurnStep[] = [];
  
  // Initial step
  const initialBearing = calculateBearing(path[0][0], path[0][1], path[1][0], path[1][1]);
  const initialAqi = segments && segments[0] ? segments[0].aqi : 45;
  
  steps.push({
    id: 'step-0',
    iconType: 'straight',
    instruction: `Head ${getDirectionName(initialBearing)} on green navigation corridor`,
    distanceMeters: 0,
    lat: path[0][0],
    lng: path[0][1],
    aqi: initialAqi,
    pathIndex: 0
  });

  let accumulatedDist = 0;
  let lastBearing = initialBearing;

  for (let i = 1; i < path.length - 1; i++) {
    const prev = path[i - 1];
    const curr = path[i];
    const next = path[i + 1];

    const dist = calculateDistanceMeters(prev[0], prev[1], curr[0], curr[1]);
    accumulatedDist += dist;

    const bearingToNext = calculateBearing(curr[0], curr[1], next[0], next[1]);
    let diff = bearingToNext - lastBearing;
    
    // Normalize angle difference to -180 to 180
    while (diff > 180) diff -= 360;
    while (diff < -180) diff += 360;

    // Only create a turn step if there is a noticeable angle change (> 25 degrees) or every 600m
    if (Math.abs(diff) > 25 || accumulatedDist > 600) {
      let iconType: TurnStep['iconType'] = 'straight';
      let turnAction = 'Continue straight';

      if (diff > 60) {
        iconType = 'turn-right';
        turnAction = 'Turn right onto clean route segment';
      } else if (diff > 25) {
        iconType = 'slight-right';
        turnAction = 'Slight right keeping to low pollution corridor';
      } else if (diff < -60) {
        iconType = 'turn-left';
        turnAction = 'Turn left onto eco avenue';
      } else if (diff < -25) {
        iconType = 'slight-left';
        turnAction = 'Slight left past park zone';
      } else if (Math.abs(diff) > 140) {
        iconType = 'u-turn';
        turnAction = 'Make U-turn when clear';
      }

      // Find closest segment AQI
      let segAqi = initialAqi;
      if (segments && segments.length > 0) {
        const segIdx = Math.min(
          segments.length - 1,
          Math.floor((i / path.length) * segments.length)
        );
        segAqi = segments[segIdx].aqi;
      }

      steps.push({
        id: `step-${i}`,
        iconType,
        instruction: turnAction,
        distanceMeters: Math.round(accumulatedDist),
        lat: curr[0],
        lng: curr[1],
        aqi: segAqi,
        pathIndex: i
      });

      lastBearing = bearingToNext;
      accumulatedDist = 0;
    }
  }

  // Final destination step
  const lastCoord = path[path.length - 1];
  const finalAqi = segments && segments.length > 0 ? segments[segments.length - 1].aqi : initialAqi;
  steps.push({
    id: `step-end`,
    iconType: 'destination',
    instruction: 'Arrive at your destination!',
    distanceMeters: Math.round(accumulatedDist),
    lat: lastCoord[0],
    lng: lastCoord[1],
    aqi: finalAqi,
    pathIndex: path.length - 1
  });

  return steps;
}

function getDirectionName(bearing: number): string {
  if (bearing >= 337.5 || bearing < 22.5) return 'North';
  if (bearing >= 22.5 && bearing < 67.5) return 'North-East';
  if (bearing >= 67.5 && bearing < 112.5) return 'East';
  if (bearing >= 112.5 && bearing < 157.5) return 'South-East';
  if (bearing >= 157.5 && bearing < 202.5) return 'South';
  if (bearing >= 202.5 && bearing < 247.5) return 'South-West';
  if (bearing >= 247.5 && bearing < 292.5) return 'West';
  return 'North-West';
}

/**
 * Web Speech Synthesis voice assistant for navigation prompts
 */
export function speakInstruction(text: string, isMuted: boolean = false) {
  if (isMuted || typeof window === 'undefined' || !('speechSynthesis' in window)) {
    return;
  }
  try {
    window.speechSynthesis.cancel(); // stop previous speaking
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    window.speechSynthesis.speak(utterance);
  } catch (e) {
    console.warn("Speech synthesis error:", e);
  }
}

/**
 * Calculates the shortest distance in meters from a GPS coordinate to a polyline path
 */
export function distanceToNearestPathPoint(
  lat: number,
  lon: number,
  path: [number, number][]
): { minDistanceMeters: number; nearestIndex: number } {
  if (!path || path.length === 0) {
    return { minDistanceMeters: Infinity, nearestIndex: 0 };
  }

  let minDistanceMeters = Infinity;
  let nearestIndex = 0;

  for (let i = 0; i < path.length; i++) {
    const dist = calculateDistanceMeters(lat, lon, path[i][0], path[i][1]);
    if (dist < minDistanceMeters) {
      minDistanceMeters = dist;
      nearestIndex = i;
    }
  }

  return { minDistanceMeters, nearestIndex };
}
