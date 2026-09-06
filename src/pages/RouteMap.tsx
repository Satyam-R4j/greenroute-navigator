import { useState, useRef, useEffect } from "react";
import { MapContainer, TileLayer, Polyline, Popup, CircleMarker, Marker, useMap } from "react-leaflet";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { MapPin, Navigation2, Leaf, Info, Car, Zap, Bike, Footprints, Download, Flame, Shield, ChevronUp, ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { type RouteOption, type RouteSegment } from "@/data/mockAqiData";
import { searchQueryLocations, getRoutesAPI, exportToGPX } from "@/services/api";
import { LocationSuggestion } from "@/data/locationSuggestions";
import { RouteAqiTimeline } from "@/components/RouteAqiTimeline";
import Navbar from "@/components/Navbar";
import { toast } from "sonner";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

const typeIcons: Record<string, string> = {
  city: "🏙️", area: "📍", state: "🗺️", locality: "📍", administrative: "🗺️"
};

type TransportMode = 'driving' | 'ev' | 'cycling' | 'walking';

interface LocationInputProps {
  icon: React.ReactNode;
  placeholder: string;
  value: LocationSuggestion | null;
  onChange: (val: LocationSuggestion | null) => void;
}

const LocationInput = ({ icon, placeholder, value, onChange }: LocationInputProps) => {
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

  const showDropdown = focused && suggestions.length > 0;

  return (
    <div ref={wrapperRef} className="relative w-full">
      <div className="absolute left-2.5 top-1/2 -translate-y-1/2 z-10">{icon}</div>
      <Input
        placeholder={placeholder}
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          if (e.target.value === "") onChange(null);
        }}
        onFocus={() => setFocused(true)}
        className="pl-8 h-9 bg-transparent border-0 outline-none focus-visible:ring-0 shadow-none text-foreground font-medium text-xs"
      />
      <AnimatePresence>
        {showDropdown && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            className="absolute top-full left-0 right-0 mt-2 bg-card border border-border rounded-xl shadow-xl z-50 overflow-hidden"
          >
            {suggestions.map((s) => (
              <button
                key={s.id}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => {
                  onChange(s);
                  setQuery(s.name);
                  setFocused(false);
                }}
                className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-primary/5 transition-colors border-b border-border/50 last:border-b-0"
              >
                <span className="text-base">{typeIcons[s.type || "locality"] || "📍"}</span>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{s.name}</p>
                  <p className="text-xs text-muted-foreground truncate">{s.parent}</p>
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

const RouteMap = () => {
  const [fromLoc, setFromLoc] = useState<LocationSuggestion | null>(PRESET_COMMUTES[0].from);
  const [toLoc, setToLoc] = useState<LocationSuggestion | null>(PRESET_COMMUTES[0].to);
  const [mode, setMode] = useState<TransportMode>('driving');
  const [isPanelCollapsed, setIsPanelCollapsed] = useState(false);
  const [hoveredSegment, setHoveredSegment] = useState<RouteSegment | null>(null);

  const [loading, setLoading] = useState(false);
  const [routes, setRoutes] = useState<Record<RouteCategory, RouteOption | null>>({
    fastest: null, balanced: null, eco: null
  });
  const [selectedRouteType, setSelectedRouteType] = useState<RouteCategory>('fastest');
  
  const defaultCenter: [number, number] = [51.505, -0.09];

  const handleSearch = async (overrideMode?: TransportMode) => {
    const activeMode = overrideMode || mode;
    if (!fromLoc || !toLoc) return;
    
    setLoading(true);
    if (fromLoc.lat && fromLoc.lon && toLoc.lat && toLoc.lon) {
      const results = await getRoutesAPI([fromLoc.lat, fromLoc.lon], [toLoc.lat, toLoc.lon], activeMode);
      
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
      handleSearch(newMode);
    }
  };

  // Auto-fit bounds logic
  const MapBounds = () => {
    const map = useMap();
    useEffect(() => {
      const allCoords: [number, number][] = [];
      if (routes.fastest) allCoords.push(...routes.fastest.path);
      if (routes.balanced) allCoords.push(...routes.balanced.path);
      if (routes.eco) allCoords.push(...routes.eco.path);

      if (allCoords.length > 0) {
        const bounds = L.latLngBounds(allCoords);
        map.fitBounds(bounds, { padding: [50, 50], maxZoom: 16 });
      } else if (fromLoc && toLoc && fromLoc.lat && toLoc.lat) {
         const bounds = L.latLngBounds([[fromLoc.lat, fromLoc.lon!], [toLoc.lat, toLoc.lon!]]);
         map.fitBounds(bounds, { padding: [50, 50] });
      }
    }, [routes, fromLoc, toLoc, map]);
    return null;
  };

  const currentRoute = routes[selectedRouteType];

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

  return (
    <div className="min-h-screen bg-background flex flex-col pt-16 font-sans">
      <Navbar />

      <main className="flex-1 relative overflow-hidden">
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
            
            <MapBounds />

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

            {/* Active Route (Thick Brand Color) */}
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

            {/* Hovered Waypoint Pin on Timeline Scrub */}
            {hoveredSegment && (
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

        {/* Floating Top Search & Selection Panel (Shifted Left) */}
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
                  />
               </div>
               <div className="flex-1">
                  <LocationInput 
                    value={toLoc} 
                    onChange={setToLoc} 
                    placeholder="Destination" 
                    icon={<MapPin className="h-3.5 w-3.5 text-orange-500" />}
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

             {/* Quick Commute Presets */}
             <div className="flex items-center gap-1.5 pt-0.5 border-t border-border/30 overflow-x-auto text-[10px] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
               <span className="text-muted-foreground font-bold shrink-0">Presets:</span>
               {PRESET_COMMUTES.map((preset, idx) => (
                 <button
                   key={idx}
                   onClick={() => {
                     setFromLoc(preset.from);
                     setToLoc(preset.to);
                   }}
                   className="px-2 py-0.5 rounded-full bg-secondary hover:bg-secondary/80 text-secondary-foreground font-medium shrink-0 transition-colors border border-border/40 truncate max-w-[140px]"
                 >
                   {preset.name}
                 </button>
               ))}
             </div>
           </div>
        </div>

        {/* Floating Right Navigation & Environmental Analytics Panel */}
        {routes.fastest && (
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
                  <div className="flex gap-2">
                    <Button className="flex-1 h-12 rounded-2xl text-base font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg">
                      Start Navigation
                    </Button>

                    <Button 
                      onClick={handleExportGPX}
                      variant="outline" 
                      className="h-12 w-12 rounded-2xl p-0 flex items-center justify-center shrink-0 border-border hover:bg-muted"
                      title="Export GPX file"
                    >
                      <Download className="w-5 h-5 text-foreground" />
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
