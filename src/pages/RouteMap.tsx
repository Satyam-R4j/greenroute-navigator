import { useState, useRef, useEffect } from "react";
import { MapContainer, TileLayer, Polyline, Popup, CircleMarker, Marker, useMap, useMapEvents } from "react-leaflet";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  MapPin,
  Navigation2,
  Leaf,
  Info,
  Car,
  Zap,
  Bike,
  Footprints,
  Download,
  Flame,
  Shield,
  ChevronUp,
  ChevronDown,
  Locate,
  MousePointerClick,
  Crosshair,
  Target,
  Play
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { type RouteOption, type RouteSegment } from "@/data/mockAqiData";
import { searchQueryLocations, getRoutesAPI, exportToGPX, reverseGeocodeLocation } from "@/services/api";
import { LocationSuggestion } from "@/data/locationSuggestions";
import { RouteAqiTimeline } from "@/components/RouteAqiTimeline";
import Navbar from "@/components/Navbar";
import { toast } from "sonner";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

import {
  calculateBearing,
  calculateDistanceMeters,
  generateTurnSteps,
  speakInstruction,
  distanceToNearestPathPoint,
  type TurnStep
} from "@/services/navigationEngine";
import { ActiveNavigationOverlay } from "@/components/ActiveNavigationOverlay";

const typeIcons: Record<string, string> = {
  city: "🏙️", area: "📍", state: "🗺️", locality: "📍", administrative: "🗺️"
};

type TransportMode = 'driving' | 'ev' | 'cycling' | 'walking';

interface LocationInputProps {
  icon: React.ReactNode;
  placeholder: string;
  value: LocationSuggestion | null;
  onChange: (val: LocationSuggestion | null) => void;
  onUseCurrentLocation: () => void;
  onPickOnMap: () => void;
  isPickingOnMap?: boolean;
}

const LocationInput = ({
  icon,
  placeholder,
  value,
  onChange,
  onUseCurrentLocation,
  onPickOnMap,
  isPickingOnMap
}: LocationInputProps) => {
  const [query, setQuery] = useState(value?.name || "");
  const [focused, setFocused] = useState(false);
  const [suggestions, setSuggestions] = useState<LocationSuggestion[]>([]);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (value?.name) setQuery(value.name);
  }, [value]);

  useEffect(() => {
    const fetchDebounced = setTimeout(async () => {
      if (query.length > 2 && focused) {
        const results = await searchQueryLocations(query);
        setSuggestions(results);
      } else {
        setSuggestions([]);
      }
    }, 400);
    return () => clearTimeout(fetchDebounced);
  }, [query, focused]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setFocused(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const showDropdown = focused;

  return (
    <div ref={wrapperRef} className="relative w-full">
      <div className="absolute left-2 top-1/2 -translate-y-1/2 z-10 flex items-center gap-1">
        {icon}
      </div>

      <Input
        placeholder={placeholder}
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          if (e.target.value === "") onChange(null);
        }}
        onFocus={() => setFocused(true)}
        className="pl-7 pr-14 h-9 bg-transparent border-0 outline-none focus-visible:ring-0 shadow-none text-foreground font-medium text-xs truncate"
      />

      {/* Quick Action Buttons inside input */}
      <div className="absolute right-1 top-1/2 -translate-y-1/2 z-10 flex items-center gap-0.5">
        <button
          type="button"
          onClick={onUseCurrentLocation}
          className="p-1 rounded-md text-emerald-600 hover:bg-emerald-500/10 transition-colors"
          title="Use My Current GPS Location"
        >
          <Locate className="w-3.5 h-3.5" />
        </button>

        <button
          type="button"
          onClick={onPickOnMap}
          className={`p-1 rounded-md transition-colors ${
            isPickingOnMap
              ? "bg-emerald-500 text-white font-bold animate-pulse"
              : "text-muted-foreground hover:text-foreground hover:bg-muted"
          }`}
          title="Pick point on Map"
        >
          <MousePointerClick className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Autocomplete Dropdown */}
      <AnimatePresence>
        {showDropdown && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            className="absolute top-full left-0 right-0 mt-2 bg-card border border-border rounded-xl shadow-xl z-50 overflow-hidden max-h-60 overflow-y-auto"
          >
            {/* Direct Option: Use GPS */}
            <button
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => {
                onUseCurrentLocation();
                setFocused(false);
              }}
              className="w-full flex items-center gap-3 px-3 py-2.5 text-left bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 font-bold text-xs border-b border-border/40 transition-colors"
            >
              <Locate className="w-4 h-4 text-emerald-500 shrink-0" />
              <span>Use My Current GPS Location</span>
            </button>

            {/* Direct Option: Pick on Map */}
            <button
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => {
                onPickOnMap();
                setFocused(false);
              }}
              className="w-full flex items-center gap-3 px-3 py-2 text-left hover:bg-muted text-xs font-semibold border-b border-border/40 transition-colors"
            >
              <MousePointerClick className="w-4 h-4 text-orange-500 shrink-0" />
              <span>Select location on map...</span>
            </button>

            {/* Search Suggestions */}
            {suggestions.map((s) => (
              <button
                key={s.id}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => {
                  onChange(s);
                  setQuery(s.name);
                  setFocused(false);
                }}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-left hover:bg-primary/5 transition-colors border-b border-border/40 last:border-b-0"
              >
                <span className="text-sm">{typeIcons[s.type || "locality"] || "📍"}</span>
                <div className="min-w-0">
                  <p className="text-xs font-medium text-foreground truncate">{s.name}</p>
                  <p className="text-[10px] text-muted-foreground truncate">{s.parent}</p>
                </div>
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

type RouteCategory = 'fastest' | 'balanced' | 'eco';

// Quick location presets for instant testing
const PRESET_COMMUTES = [
  {
    name: "London Bridge ➔ Hyde Park",
    from: { id: "p1", name: "London Bridge", parent: "London", lat: 51.5079, lon: -0.0877 },
    to: { id: "p2", name: "Hyde Park", parent: "London", lat: 51.5073, lon: -0.1657 }
  },
  {
    name: "Big Ben ➔ Camden Town",
    from: { id: "p3", name: "Big Ben", parent: "London", lat: 51.5007, lon: -0.1246 },
    to: { id: "p4", name: "Camden Market", parent: "London", lat: 51.5416, lon: -0.1462 }
  }
];

// Leaflet Auto Map Bounds helper
interface MapBoundsProps {
  routes: Record<RouteCategory, RouteOption | null>;
  fromLoc: LocationSuggestion | null;
  toLoc: LocationSuggestion | null;
  isNavigating: boolean;
}

const MapBounds: React.FC<MapBoundsProps> = ({ routes, fromLoc, toLoc, isNavigating }) => {
  const map = useMap();
  useEffect(() => {
    if (isNavigating) return; // Do not refit bounds during navigation
    
    const allCoords: [number, number][] = [];
    if (routes.fastest && routes.fastest.path) allCoords.push(...routes.fastest.path);
    if (routes.balanced && routes.balanced.path) allCoords.push(...routes.balanced.path);
    if (routes.eco && routes.eco.path) allCoords.push(...routes.eco.path);

    if (allCoords.length > 0) {
      try {
        const bounds = L.latLngBounds(allCoords);
        if (bounds.isValid()) {
          map.fitBounds(bounds, { padding: [50, 50], maxZoom: 16 });
        }
      } catch (e) {
        console.warn("Invalid bounds:", e);
      }
    } else if (fromLoc && toLoc && fromLoc.lat != null && fromLoc.lon != null && toLoc.lat != null && toLoc.lon != null) {
      try {
        const bounds = L.latLngBounds([[fromLoc.lat, fromLoc.lon], [toLoc.lat, toLoc.lon]]);
        if (bounds.isValid()) {
          map.fitBounds(bounds, { padding: [50, 50] });
        }
      } catch (e) {
        console.warn("Invalid bounds:", e);
      }
    }
  }, [routes, fromLoc, toLoc, map, isNavigating]);
  return null;
};

// Map Auto Camera Controller during Navigation
interface MapCameraControllerProps {
  center: [number, number] | null;
  isLocked: boolean;
  isNavigating: boolean;
}

const MapCameraController: React.FC<MapCameraControllerProps> = ({ center, isLocked, isNavigating }) => {
  const map = useMap();
  useEffect(() => {
    if (center && center[0] != null && center[1] != null && !isNaN(center[0]) && !isNaN(center[1]) && isLocked && isNavigating) {
      try {
        map.panTo(center, { animate: true, duration: 0.6 });
      } catch (e) {
        console.warn("Map panTo error:", e);
      }
    }
  }, [center, isLocked, isNavigating, map]);
  return null;
};

// Leaflet Map Click Listener Component
interface MapClickHandlerProps {
  mapClickMode: 'from' | 'to' | null;
  onSelectTarget: (targetLoc: LocationSuggestion, mode: 'from' | 'to') => void;
  onClearMode: () => void;
}

const MapClickHandler: React.FC<MapClickHandlerProps> = ({ mapClickMode, onSelectTarget, onClearMode }) => {
  useMapEvents({
    async click(e) {
      if (!mapClickMode) return;
      const toastId = toast.loading("Resolving map target location...");
      const targetLoc = await reverseGeocodeLocation(e.latlng.lat, e.latlng.lng);
      toast.dismiss(toastId);
      onSelectTarget(targetLoc, mapClickMode);
      onClearMode();
    }
  });
  return null;
};

const RouteMap = () => {
  const [fromLoc, setFromLoc] = useState<LocationSuggestion | null>(PRESET_COMMUTES[0].from);
  const [toLoc, setToLoc] = useState<LocationSuggestion | null>(PRESET_COMMUTES[0].to);
  const [mode, setMode] = useState<TransportMode>('driving');
  const [isPanelCollapsed, setIsPanelCollapsed] = useState(false);
  const [hoveredSegment, setHoveredSegment] = useState<RouteSegment | null>(null);

  // MAP CLICK PICKER MODE ('from' | 'to' | null)
  const [mapClickMode, setMapClickMode] = useState<'from' | 'to' | null>(null);

  const [loading, setLoading] = useState(false);
  const [routes, setRoutes] = useState<Record<RouteCategory, RouteOption | null>>({
    fastest: null, balanced: null, eco: null
  });
  const [selectedRouteType, setSelectedRouteType] = useState<RouteCategory>('fastest');
  
  // ACTIVE NAVIGATION STATES
  const [isNavigating, setIsNavigating] = useState(false);
  const [navPathIndex, setNavPathIndex] = useState(0);
  const [isNavPaused, setIsNavPaused] = useState(false);
  const [navSpeedMultiplier, setNavSpeedMultiplier] = useState(1);
  const [isNavMuted, setIsNavMuted] = useState(false);
  const [isCameraLocked, setIsCameraLocked] = useState(true);
  const [isLiveGps, setIsLiveGps] = useState(false);
  const [isDestinationReached, setIsDestinationReached] = useState(false);
  const [isRerouting, setIsRerouting] = useState(false);
  
  const [turnSteps, setTurnSteps] = useState<TurnStep[]>([]);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  
  // Live GPS Coords
  const [liveGpsCoords, setLiveGpsCoords] = useState<[number, number] | null>(null);

  const defaultCenter: [number, number] = [51.505, -0.09];

  const handleSearch = async (overrideFrom?: LocationSuggestion | null, overrideTo?: LocationSuggestion | null, overrideMode?: TransportMode) => {
    const activeFrom = overrideFrom !== undefined ? overrideFrom : fromLoc;
    const activeTo = overrideTo !== undefined ? overrideTo : toLoc;
    const activeMode = overrideMode || mode;

    if (!activeFrom || !activeTo) return;
    
    setLoading(true);
    if (activeFrom.lat && activeFrom.lon && activeTo.lat && activeTo.lon) {
      const results = await getRoutesAPI([activeFrom.lat, activeFrom.lon], [activeTo.lat, activeTo.lon], activeMode);
      
      const newRoutes = {
         fastest: results[0] || null,
         balanced: results[1] || null,
         eco: results[2] || results[0] || null
      };

      setRoutes(newRoutes);
      setSelectedRouteType('fastest');
    }
    setLoading(false);
  };

  // Auto search on initial mount
  useEffect(() => {
    handleSearch();
  }, []);

  const handleModeChange = (newMode: TransportMode) => {
    setMode(newMode);
    if (fromLoc && toLoc) {
      handleSearch(fromLoc, toLoc, newMode);
    }
  };

  // GPS Current Location Detection Handler
  const handleUseMyCurrentLocation = (target: 'from' | 'to') => {
    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      toast.error("Geolocation is not supported by your browser.");
      return;
    }

    const toastId = toast.loading("Fetching current GPS coordinates...");

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        toast.loading("Reverse geocoding address...", { id: toastId });
        const loc = await reverseGeocodeLocation(latitude, longitude);
        toast.dismiss(toastId);

        if (target === 'from') {
          setFromLoc(loc);
          toast.success(`Starting location set to: ${loc.name}`);
          if (toLoc) handleSearch(loc, toLoc);
        } else {
          setToLoc(loc);
          toast.success(`Destination set to: ${loc.name}`);
          if (fromLoc) handleSearch(fromLoc, loc);
        }
      },
      (err) => {
        toast.dismiss(toastId);
        console.warn("GPS detection error:", err);
        toast.error("Could not obtain GPS location. Check browser permissions.");
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  const currentRoute = routes[selectedRouteType];

  // START NAVIGATION HANDLER
  const handleStartNavigation = (enableSimulation: boolean = false) => {
    if (!currentRoute || currentRoute.path.length < 2) {
      toast.error("Please calculate a route before starting navigation.");
      return;
    }

    const steps = generateTurnSteps(currentRoute.path, currentRoute.segments);
    setTurnSteps(steps);
    setCurrentStepIndex(0);
    setNavPathIndex(0);
    setIsDestinationReached(false);

    if (enableSimulation) {
      setIsLiveGps(false);
      setIsNavPaused(false);
      toast.success("Demo Simulation started! Vehicle will auto-drive along path.");
    } else {
      setIsLiveGps(true);
      setIsNavPaused(false);

      if (typeof navigator !== 'undefined' && navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            setLiveGpsCoords([pos.coords.latitude, pos.coords.longitude]);
          },
          (err) => {
            console.warn("Initial GPS fetch warning:", err);
          },
          { enableHighAccuracy: true, timeout: 5000 }
        );
      }

      toast.success("Live GPS Navigation started! Vehicle will stay still when you are stationary.");
    }

    setIsNavigating(true);

    if (steps.length > 0) {
      speakInstruction(steps[0].instruction, isNavMuted);
    }
  };

  // END NAVIGATION HANDLER
  const handleEndNavigation = () => {
    setIsNavigating(false);
    setIsNavPaused(false);
    setIsDestinationReached(false);
    setNavPathIndex(0);
    setCurrentStepIndex(0);
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    toast.info("Navigation ended.");
  };

  // LIVE GPS WATCHER
  useEffect(() => {
    let watchId: number | null = null;
    if (isNavigating && isLiveGps && typeof navigator !== 'undefined' && navigator.geolocation) {
      watchId = navigator.geolocation.watchPosition(
        (pos) => {
          setLiveGpsCoords([pos.coords.latitude, pos.coords.longitude]);
        },
        (err) => {
          console.warn("Geolocation error:", err);
          toast.error("Could not fetch device GPS. Falling back to simulation mode.");
          setIsLiveGps(false);
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 1000 }
      );
    }
    return () => {
      if (watchId !== null) navigator.geolocation.clearWatch(watchId);
    };
  }, [isNavigating, isLiveGps]);

  // OFF-ROUTE AUTOMATIC REROUTING IN LIVE GPS MODE
  useEffect(() => {
    if (!isNavigating || !isLiveGps || !liveGpsCoords || !currentRoute || isRerouting || !toLoc || !toLoc.lat || !toLoc.lon) {
      return;
    }

    const { minDistanceMeters } = distanceToNearestPathPoint(
      liveGpsCoords[0],
      liveGpsCoords[1],
      currentRoute.path
    );

    if (minDistanceMeters > 120 && minDistanceMeters !== Infinity) {
      setIsRerouting(true);
      toast.warning("⚠️ Off route detected! Recalculating eco route...", { id: "off-route-toast" });

      (async () => {
        const newFrom = await reverseGeocodeLocation(liveGpsCoords[0], liveGpsCoords[1]);
        setFromLoc(newFrom);
        const newResults = await getRoutesAPI([liveGpsCoords[0], liveGpsCoords[1]], [toLoc.lat, toLoc.lon!], mode);
        
        if (newResults.length > 0) {
          const newRoutes = {
            fastest: newResults[0] || null,
            balanced: newResults[1] || null,
            eco: newResults[2] || newResults[0] || null
          };
          setRoutes(newRoutes);
          const steps = generateTurnSteps(newResults[0].path, newResults[0].segments);
          setTurnSteps(steps);
          setNavPathIndex(0);
          setCurrentStepIndex(0);
          speakInstruction("Off route detected. Recalculated new clean route to destination.", isNavMuted);
          toast.success("Rerouted to new green path!");
        }
        setIsRerouting(false);
      })();
    }
  }, [isNavigating, isLiveGps, liveGpsCoords, currentRoute, isRerouting, toLoc, mode, isNavMuted]);

  // SIMULATION PLAYBACK TIMER
  useEffect(() => {
    if (!isNavigating || isNavPaused || isLiveGps || isDestinationReached || !currentRoute) {
      return;
    }

    const baseIntervalMs = 1200; // time per coordinate step
    const intervalMs = Math.max(100, Math.round(baseIntervalMs / navSpeedMultiplier));

    const timer = setInterval(() => {
      setNavPathIndex((prevIndex) => {
        const nextIdx = prevIndex + 1;
        if (nextIdx >= currentRoute.path.length) {
          clearInterval(timer);
          setIsDestinationReached(true);
          speakInstruction("You have arrived at your destination!", isNavMuted);
          return currentRoute.path.length - 1;
        }

        // Check if we reached next turn step maneuver
        if (turnSteps.length > 0) {
          const nextStepIdx = currentStepIndex + 1;
          if (nextStepIdx < turnSteps.length) {
            const nextStep = turnSteps[nextStepIdx];
            if (nextIdx >= nextStep.pathIndex) {
              setCurrentStepIndex(nextStepIdx);
              speakInstruction(nextStep.instruction, isNavMuted);
            }
          }
        }

        return nextIdx;
      });
    }, intervalMs);

    return () => clearInterval(timer);
  }, [isNavigating, isNavPaused, isLiveGps, isDestinationReached, navSpeedMultiplier, currentRoute, turnSteps, currentStepIndex, isNavMuted]);

  // NAVIGATION DERIVED METRICS
  const activeVehicleCoords: [number, number] = isLiveGps && liveGpsCoords
    ? liveGpsCoords
    : (currentRoute && currentRoute.path[navPathIndex]) || defaultCenter;

  // Bearing calculation for rotated vehicle marker
  const vehicleBearing = (() => {
    if (!currentRoute || currentRoute.path.length < 2) return 0;
    const curr = currentRoute.path[navPathIndex] || currentRoute.path[0];
    const next = currentRoute.path[Math.min(currentRoute.path.length - 1, navPathIndex + 1)];
    return calculateBearing(curr[0], curr[1], next[0], next[1]);
  })();

  // Traveled & Remaining Paths
  const traveledPath = currentRoute ? currentRoute.path.slice(0, navPathIndex + 1) : [];
  const remainingPath = currentRoute ? currentRoute.path.slice(navPathIndex) : [];

  // Current Step & Next Step
  const currentStep = turnSteps[currentStepIndex] || null;
  const nextStep = turnSteps[currentStepIndex + 1] || null;

  // Distance to Next Maneuver
  const distanceToNextManeuver = (() => {
    if (!currentRoute || !nextStep) return 0;
    const curr = activeVehicleCoords;
    return calculateDistanceMeters(curr[0], curr[1], nextStep.lat, nextStep.lng);
  })();

  // Remaining total distance in meters
  const remainingDistanceMeters = (() => {
    if (!currentRoute || remainingPath.length < 2) return 0;
    let total = 0;
    for (let i = 0; i < remainingPath.length - 1; i++) {
      total += calculateDistanceMeters(
        remainingPath[i][0], remainingPath[i][1],
        remainingPath[i + 1][0], remainingPath[i + 1][1]
      );
    }
    return total;
  })();

  // Mode speed (km/h)
  const modeSpeeds: Record<TransportMode, number> = {
    driving: 45,
    ev: 45,
    cycling: 18,
    walking: 5
  };
  const baseSpeedKmh = modeSpeeds[mode] || 40;
  const currentSpeedKmh = isNavPaused ? 0 : baseSpeedKmh * (isLiveGps ? 1 : navSpeedMultiplier);

  const remainingDurationSeconds = currentSpeedKmh > 0
    ? (remainingDistanceMeters / 1000) / (currentSpeedKmh / 3600)
    : 0;

  const progressPercent = currentRoute && currentRoute.path.length > 1
    ? (navPathIndex / (currentRoute.path.length - 1)) * 100
    : 0;

  // Current AQI along route segment
  const currentAqi = (() => {
    if (!currentRoute || !currentRoute.segments || currentRoute.segments.length === 0) {
      return currentRoute?.avgAqi || 45;
    }
    const segIdx = Math.min(
      currentRoute.segments.length - 1,
      Math.floor((navPathIndex / currentRoute.path.length) * currentRoute.segments.length)
    );
    return currentRoute.segments[segIdx].aqi;
  })();

  // Accumulated environmental benefits
  const co2SavedAccumulated = currentRoute ? ((currentRoute.co2SavedKg || 0) * (progressPercent / 100)) : 0;
  const caloriesBurnedAccumulated = currentRoute ? ((currentRoute.caloriesBurned || 0) * (progressPercent / 100)) : 0;
  const pm25AvoidedAccumulated = currentRoute ? Math.round((currentRoute.pm25AvoidedUg || 0) * (progressPercent / 100)) : 0;

  const handleExportGPX = () => {
    if (!currentRoute) return;
    exportToGPX(currentRoute, fromLoc?.name || "Origin", toLoc?.name || "Destination");
    toast.success("Downloaded GPX route file!");
  };

  // Custom marker icon for segment hover highlight
  const createHoverMarkerIcon = (aqi: number) => {
    return L.divIcon({
      className: "custom-hover-pin",
      html: `
        <div style="background: #1e293b; color: #fff; padding: 4px 8px; border-radius: 8px; font-weight: 800; font-size: 11px; border: 2px solid #22c55e; box-shadow: 0 4px 12px rgba(0,0,0,0.3); white-space: nowrap;">
          📍 Waypoint AQI ${aqi}
        </div>
      `,
      iconSize: [100, 30],
      iconAnchor: [50, 35]
    });
  };

  // Custom vehicle icon with smooth orientation angle & dynamic halo glow based on AQI
  const createVehicleMarkerIcon = (mode: TransportMode, bearing: number, aqi: number) => {
    let modeEmoji = "🚗";
    if (mode === 'ev') modeEmoji = "⚡";
    else if (mode === 'cycling') modeEmoji = "🚴";
    else if (mode === 'walking') modeEmoji = "🚶";

    let haloColor = "#22c55e"; // green
    if (aqi > 150) haloColor = "#ef4444";
    else if (aqi > 100) haloColor = "#f59e0b";

    return L.divIcon({
      className: "custom-vehicle-marker",
      html: `
        <div style="position: relative; width: 44px; height: 44px; display: flex; align-items: center; justify-content: center;">
          <div style="position: absolute; inset: 0; border-radius: 50%; background: ${haloColor}; opacity: 0.4; animation: ping 1.6s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
          <div style="position: relative; width: 38px; height: 38px; background: #0f172a; border: 3px solid ${haloColor}; border-radius: 50%; display: flex; align-items: center; justify-content: center; transform: rotate(${bearing}deg); transition: transform 0.3s ease-out; box-shadow: 0 10px 25px rgba(0,0,0,0.5);">
            <span style="font-size: 18px; line-height: 1;">${modeEmoji}</span>
          </div>
        </div>
      `,
      iconSize: [44, 44],
      iconAnchor: [22, 22]
    });
  };

  return (
    <div className="min-h-screen bg-background flex flex-col pt-16 font-sans">
      <Navbar />

      <main className="flex-1 relative overflow-hidden">
        {/* MAP CLICK TARGET SELECTION FLOATING BANNER */}
        <AnimatePresence>
          {mapClickMode && (
            <motion.div
              initial={{ y: -50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -50, opacity: 0 }}
              className="absolute top-20 left-1/2 -translate-x-1/2 z-[420] bg-emerald-600 text-white px-5 py-2.5 rounded-2xl shadow-2xl flex items-center gap-3 border border-emerald-400/30 backdrop-blur-xl"
            >
              <Target className="w-5 h-5 animate-spin-slow shrink-0" />
              <div>
                <p className="text-xs font-black">
                  Tap anywhere on the map to set {mapClickMode === 'from' ? 'Starting Point' : 'Destination Target'}
                </p>
                <p className="text-[10px] text-emerald-100/90">
                  Clicking the map will resolve exact coordinates & address.
                </p>
              </div>
              <button
                onClick={() => setMapClickMode(null)}
                className="ml-2 px-2 py-1 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-[10px] font-bold"
              >
                Cancel
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Full Bleed Map Container */}
        <div className="absolute inset-0 z-0">
          <MapContainer
            center={defaultCenter}
            zoom={13}
            className="w-full h-full"
            scrollWheelZoom={true}
            zoomControl={false}
          >
            <TileLayer
              attribution='&copy; OpenStreetMap contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            
            <MapBounds routes={routes} fromLoc={fromLoc} toLoc={toLoc} isNavigating={isNavigating} />
            <MapCameraController center={activeVehicleCoords} isLocked={isCameraLocked} isNavigating={isNavigating} />
            <MapClickHandler
              mapClickMode={mapClickMode}
              onSelectTarget={(targetLoc, clickMode) => {
                if (clickMode === 'from') {
                  setFromLoc(targetLoc);
                  toast.success(`Start location set to: ${targetLoc.name}`);
                  if (toLoc) handleSearch(targetLoc, toLoc);
                } else if (clickMode === 'to') {
                  setToLoc(targetLoc);
                  toast.success(`Destination set to: ${targetLoc.name}`);
                  if (fromLoc) handleSearch(fromLoc, targetLoc);
                }
              }}
              onClearMode={() => setMapClickMode(null)}
            />

            {!isNavigating ? (
              <>
                {/* Inactive Routes (Thin Gray) */}
                {routes.fastest && selectedRouteType !== 'fastest' && (
                  <Polyline positions={routes.fastest.path} pathOptions={{ color: '#9ca3af', weight: 4, opacity: 0.6 }} />
                )}
                {routes.balanced && selectedRouteType !== 'balanced' && (
                  <Polyline positions={routes.balanced.path} pathOptions={{ color: '#9ca3af', weight: 4, opacity: 0.6 }} />
                )}
                {routes.eco && selectedRouteType !== 'eco' && (
                  <Polyline positions={routes.eco.path} pathOptions={{ color: '#9ca3af', weight: 4, opacity: 0.6 }} />
                )}

                {/* Active Overview Route */}
                {currentRoute && (
                  <Polyline 
                    positions={currentRoute.path} 
                    pathOptions={{ 
                      color: selectedRouteType === 'eco' ? '#34D399' : '#FB923C',
                      weight: 8, 
                      opacity: 1,
                      lineCap: "round",
                      lineJoin: "round"
                    }} 
                  />
                )}
              </>
            ) : (
              <>
                {/* Active Navigation: Traveled vs Remaining Polylines */}
                {traveledPath.length > 1 && (
                  <Polyline
                    positions={traveledPath}
                    pathOptions={{ color: '#64748b', weight: 5, opacity: 0.55, dashArray: '8, 8' }}
                  />
                )}
                {remainingPath.length > 0 && (
                  <Polyline
                    positions={remainingPath}
                    pathOptions={{
                      color: selectedRouteType === 'eco' ? '#22c55e' : '#f59e0b',
                      weight: 9,
                      opacity: 1,
                      lineCap: "round",
                      lineJoin: "round"
                    }}
                  />
                )}

                {/* Animated Navigation Vehicle Marker */}
                <Marker
                  position={activeVehicleCoords}
                  icon={createVehicleMarkerIcon(mode, vehicleBearing, currentAqi)}
                />
              </>
            )}

            {/* Hovered Waypoint Pin on Timeline Scrub */}
            {hoveredSegment && !isNavigating && (
              <Marker
                position={[hoveredSegment.lat, hoveredSegment.lng]}
                icon={createHoverMarkerIcon(hoveredSegment.aqi)}
              />
            )}

            {/* Start/End Markers */}
            {fromLoc && fromLoc.lat && fromLoc.lon && (
               <CircleMarker center={[fromLoc.lat, fromLoc.lon]} radius={7} pathOptions={{ fillColor: "#1e293b", color: "#ffffff", weight: 2, fillOpacity: 1 }}>
                 <Popup>Start: {fromLoc.name}</Popup>
               </CircleMarker>
            )}
            {toLoc && toLoc.lat && toLoc.lon && (
                <CircleMarker center={[toLoc.lat, toLoc.lon]} radius={8} pathOptions={{ fillColor: "#ef4444", color: "#ffffff", weight: 2, fillOpacity: 1 }}>
                  <Popup>Destination: {toLoc.name}</Popup>
                </CircleMarker>
            )}
          </MapContainer>
        </div>

        {/* ACTIVE NAVIGATION FULLSCREEN HUD OVERLAY */}
        {isNavigating && currentRoute && (
          <ActiveNavigationOverlay
            currentRoute={currentRoute}
            currentStep={currentStep}
            nextStep={nextStep}
            distanceToNextManeuver={distanceToNextManeuver}
            progressPercent={progressPercent}
            remainingDistanceMeters={remainingDistanceMeters}
            remainingDurationSeconds={remainingDurationSeconds}
            currentSpeedKmh={currentSpeedKmh}
            currentAqi={currentAqi}
            isPaused={isNavPaused}
            onTogglePause={() => setIsNavPaused(!isNavPaused)}
            speedMultiplier={navSpeedMultiplier}
            onChangeSpeedMultiplier={setNavSpeedMultiplier}
            isMuted={isNavMuted}
            onToggleMute={() => setIsNavMuted(!isNavMuted)}
            isCameraLocked={isCameraLocked}
            onToggleCameraLock={() => setIsCameraLocked(!isCameraLocked)}
            isLiveGps={isLiveGps}
            onToggleLiveGps={() => setIsLiveGps(!isLiveGps)}
            onEndNavigation={handleEndNavigation}
            co2SavedAccumulated={co2SavedAccumulated}
            caloriesBurnedAccumulated={caloriesBurnedAccumulated}
            pm25AvoidedAccumulated={pm25AvoidedAccumulated}
            isDestinationReached={isDestinationReached}
          />
        )}

        {/* Floating Top Search & Selection Panel (Hidden during Navigation) */}
        {!isNavigating && (
          <div className="absolute top-4 left-6 right-auto w-full max-w-md px-4 md:px-0 z-[410] pointer-events-none space-y-2">
             {/* Compact Main Panel */}
             <div className="bg-card/95 backdrop-blur-xl rounded-2xl shadow-2xl p-2.5 border border-border/50 pointer-events-auto space-y-2">
               
               {/* Multi-Modal Mode Tabs */}
               <div className="flex items-center justify-between gap-1 bg-muted/40 p-1 rounded-xl border border-border/40">
                 {[
                   { id: 'driving', label: 'Driving', icon: Car },
                   { id: 'ev', label: 'Electric', icon: Zap },
                   { id: 'cycling', label: 'Cycling', icon: Bike },
                   { id: 'walking', label: 'Walking', icon: Footprints }
                 ].map((m) => {
                   const Icon = m.icon;
                   const isActive = mode === m.id;
                   return (
                     <button
                       key={m.id}
                       onClick={() => handleModeChange(m.id as TransportMode)}
                       className={`flex-1 flex items-center justify-center gap-1 py-1 px-1.5 rounded-lg text-[11px] font-bold transition-all ${
                         isActive
                           ? "bg-card text-emerald-600 shadow-sm border border-emerald-500/20"
                           : "text-muted-foreground hover:text-foreground hover:bg-background/40"
                       }`}
                     >
                       <Icon className={`w-3 h-3 ${isActive ? 'text-emerald-500' : ''}`} />
                       <span>{m.label}</span>
                     </button>
                   );
                 })}
               </div>

               {/* Search Inputs */}
               <div className="flex flex-col md:flex-row gap-1 divide-y md:divide-y-0 md:divide-x divide-border bg-muted/20 rounded-xl p-1 border border-border/30">
                 <div className="flex-1">
                    <LocationInput 
                      value={fromLoc} 
                      onChange={setFromLoc} 
                      placeholder="Starting point" 
                      icon={<MapPin className="h-3.5 w-3.5 text-emerald-500" />}
                      onUseCurrentLocation={() => handleUseMyCurrentLocation('from')}
                      onPickOnMap={() => setMapClickMode(mapClickMode === 'from' ? null : 'from')}
                      isPickingOnMap={mapClickMode === 'from'}
                    />
                 </div>
                 <div className="flex-1">
                    <LocationInput 
                      value={toLoc} 
                      onChange={setToLoc} 
                      placeholder="Destination target" 
                      icon={<MapPin className="h-3.5 w-3.5 text-orange-500" />}
                      onUseCurrentLocation={() => handleUseMyCurrentLocation('to')}
                      onPickOnMap={() => setMapClickMode(mapClickMode === 'to' ? null : 'to')}
                      isPickingOnMap={mapClickMode === 'to'}
                    />
                 </div>
                 <Button 
                    onClick={() => handleSearch()} 
                    className="md:w-auto w-full h-9 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs px-3 rounded-lg self-center shrink-0"
                    disabled={!fromLoc || !toLoc || loading}
                  >
                    {loading ? <span className="animate-pulse text-[10px]">Route...</span> : 'Search'}
                  </Button>
               </div>

               {/* Quick Commute Presets & GPS Button */}
               <div className="flex items-center gap-1.5 pt-0.5 border-t border-border/30 overflow-x-auto text-[10px] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                 <button
                   onClick={() => handleUseMyCurrentLocation('from')}
                   className="px-2 py-0.5 rounded-full bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 font-bold shrink-0 transition-colors border border-emerald-500/30 flex items-center gap-1"
                 >
                   <Locate className="w-3 h-3 text-emerald-500" />
                   <span>My Location</span>
                 </button>
                 <span className="text-muted-foreground font-bold shrink-0">Presets:</span>
                 {PRESET_COMMUTES.map((preset, idx) => (
                   <button
                     key={idx}
                     onClick={() => {
                       setFromLoc(preset.from);
                       setToLoc(preset.to);
                       handleSearch(preset.from, preset.to);
                     }}
                     className="px-2 py-0.5 rounded-full bg-secondary hover:bg-secondary/80 text-secondary-foreground font-medium shrink-0 transition-colors border border-border/40 truncate max-w-[140px]"
                   >
                     {preset.name}
                   </button>
                 ))}
               </div>
             </div>
          </div>
        )}

        {/* Floating Right Navigation & Environmental Analytics Panel (Hidden during Navigation) */}
        {!isNavigating && routes.fastest && (
          <div className="absolute bottom-6 right-6 left-auto w-full max-w-md px-4 md:px-0 z-[410] pointer-events-none max-h-[70vh] overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            <motion.div 
               initial={{ opacity: 0, x: 20 }}
               animate={{ opacity: 1, x: 0 }}
               className="bg-card/95 backdrop-blur-3xl rounded-3xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.3)] border border-border overflow-hidden pointer-events-auto p-5 space-y-4"
            >
              {/* Route Category Tabs Centered with Collapse Arrow on Right */}
              <div className="relative flex items-center justify-center border-b border-border/40 pb-2">
                <div className="flex items-center justify-center p-1 bg-muted/40 rounded-xl border border-border/50">
                  {[
                    { id: 'fastest', label: 'Fastest', icon: Navigation2 },
                    { id: 'balanced', label: 'Balanced', icon: Info },
                    { id: 'eco', label: 'Cleanest Eco', icon: Leaf }
                  ].map((type) => {
                    const isActive = selectedRouteType === type.id;
                    const Icon = type.icon;
                    return (
                      <button
                        key={type.id}
                        onClick={() => setSelectedRouteType(type.id as typeof selectedRouteType)}
                        className={`py-1.5 px-3 flex items-center justify-center gap-1 rounded-lg transition-all duration-200 text-xs ${
                          isActive ? "bg-card text-foreground font-bold shadow-sm" : "text-muted-foreground font-medium hover:text-foreground"
                        }`}
                      >
                        <Icon className={`w-3.5 h-3.5 ${isActive && type.id === 'eco' ? 'text-emerald-500' : isActive ? 'text-orange-500' : ''}`} />
                        <span>{type.label}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Collapse / Expand Toggle Arrow Button */}
                <button
                  type="button"
                  onClick={() => setIsPanelCollapsed(!isPanelCollapsed)}
                  className="absolute right-0 p-1.5 rounded-lg bg-muted/40 hover:bg-muted text-muted-foreground hover:text-foreground border border-border/40 transition-colors"
                  title={isPanelCollapsed ? "Expand All Options" : "Collapse Options"}
                >
                  {isPanelCollapsed ? <ChevronDown className="w-4 h-4 text-emerald-500" /> : <ChevronUp className="w-4 h-4 text-muted-foreground" />}
                </button>
              </div>

              {/* Primary Route Summary */}
              <div className="flex justify-between items-center bg-muted/20 p-4 rounded-2xl border border-border/40">
                <div>
                  <div className="flex items-baseline gap-2">
                    <h3 className="text-3xl font-extrabold text-foreground tracking-tight">
                      {currentRoute?.duration}
                    </h3>
                    <span className="text-xs font-semibold text-emerald-600 bg-emerald-500/10 px-2 py-0.5 rounded-md">
                      AQI {currentRoute?.avgAqi} Avg
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground font-medium mt-1">
                    {currentRoute?.distance} • {currentRoute?.name}
                  </p>
                </div>
                
                <div className="text-right">
                  <div className={`text-2xl font-black ${selectedRouteType === 'eco' ? 'text-emerald-500' : 'text-amber-500'}`}>
                     {selectedRouteType === 'eco' ? '-34%' : '+12%'}
                  </div>
                  <p className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground mt-0.5">Smog Exposure</p>
                </div>
              </div>

              {/* Collapsible Details Panel */}
              {!isPanelCollapsed && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-4 pt-1"
                >
                  {/* Environmental Impact Metrics Grid */}
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-xs">
                    {(mode === 'cycling' || mode === 'walking') ? (
                      <>
                        <div className="bg-emerald-500/10 border border-emerald-500/20 p-3 rounded-2xl flex items-center gap-2.5">
                          <Flame className="w-5 h-5 text-emerald-600 shrink-0" />
                          <div>
                            <p className="font-bold text-foreground">{currentRoute?.caloriesBurned || 0} kcal</p>
                            <p className="text-[10px] text-muted-foreground font-medium">Calories Burned</p>
                          </div>
                        </div>

                        <div className="bg-blue-500/10 border border-blue-500/20 p-3 rounded-2xl flex items-center gap-2.5">
                          <Shield className="w-5 h-5 text-blue-600 shrink-0" />
                          <div>
                            <p className="font-bold text-foreground">-{currentRoute?.pm25AvoidedUg || 0} µg</p>
                            <p className="text-[10px] text-muted-foreground font-medium">PM2.5 Avoided</p>
                          </div>
                        </div>

                        <div className="bg-amber-500/10 border border-amber-500/20 p-3 rounded-2xl flex items-center gap-2.5 col-span-2 md:col-span-1">
                          <Leaf className="w-5 h-5 text-amber-600 shrink-0" />
                          <div>
                            <p className="font-bold text-foreground">{currentRoute?.co2SavedKg || 0} kg</p>
                            <p className="text-[10px] text-muted-foreground font-medium">CO₂ Zero Emission</p>
                          </div>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="bg-emerald-500/10 border border-emerald-500/20 p-3 rounded-2xl flex items-center gap-2.5">
                          <Leaf className="w-5 h-5 text-emerald-600 shrink-0" />
                          <div>
                            <p className="font-bold text-foreground">-{currentRoute?.co2SavedKg || 0} kg</p>
                            <p className="text-[10px] text-muted-foreground font-medium">CO₂ Saved</p>
                          </div>
                        </div>

                        <div className="bg-blue-500/10 border border-blue-500/20 p-3 rounded-2xl flex items-center gap-2.5">
                          <Shield className="w-5 h-5 text-blue-600 shrink-0" />
                          <div>
                            <p className="font-bold text-foreground">-{currentRoute?.pm25AvoidedUg || 0} µg</p>
                            <p className="text-[10px] text-muted-foreground font-medium">PM2.5 Avoided</p>
                          </div>
                        </div>
                      </>
                    )}
                  </div>

                  {/* Interactive Route AQI Timeline */}
                  <RouteAqiTimeline 
                    segments={currentRoute?.segments}
                    onHoverSegment={setHoveredSegment}
                  />

                  {/* Action Buttons */}
                  <div className="flex flex-col sm:flex-row gap-2">
                    <Button 
                      onClick={() => handleStartNavigation(false)}
                      className="flex-1 h-12 rounded-2xl text-sm font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg transition-all active:scale-95 flex items-center justify-center gap-2"
                    >
                      <Navigation2 className="w-4 h-4 fill-white" />
                      <span>Start Live Navigation</span>
                    </Button>

                    <Button 
                      onClick={() => handleStartNavigation(true)}
                      variant="outline"
                      className="h-12 rounded-2xl text-xs font-bold border-emerald-500/40 text-emerald-600 hover:bg-emerald-500/10 transition-all flex items-center justify-center gap-1.5 shrink-0 px-3"
                      title="Simulate drive along route for testing"
                    >
                      <Play className="w-3.5 h-3.5 fill-emerald-600" />
                      <span>Simulate Demo</span>
                    </Button>
                  </div>
                </motion.div>
              )}
            </motion.div>
          </div>
        )}
      </main>
    </div>
  );
};

export default RouteMap;
