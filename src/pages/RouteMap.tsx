import { useState, useRef, useEffect } from "react";
import { MapContainer, TileLayer, Polyline, Popup, CircleMarker, useMap } from "react-leaflet";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { MapPin, Navigation2, Leaf, Info } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { getAqiLevel, type RouteOption } from "@/data/mockAqiData";
import { searchQueryLocations } from "@/services/api";
import { LocationSuggestion } from "@/data/locationSuggestions";
import { getRoutesAPI } from "@/services/api";
import Navbar from "@/components/Navbar";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

const typeIcons: Record<string, string> = {
  city: "🏙️", area: "📍", state: "🗺️", locality: "📍", administrative: "🗺️"
};

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
      <div className="absolute left-3 top-1/2 -translate-y-1/2 z-10">{icon}</div>
      <Input
        placeholder={placeholder}
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          if (e.target.value === "") onChange(null);
        }}
        onFocus={() => setFocused(true)}
        className="pl-10 h-12 bg-transparent border-0 outline-none focus-visible:ring-0 shadow-none text-foreground font-medium"
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

// Route Type Mapping (Simulating AirTrack tabs)
type RouteCategory = 'fastest' | 'balanced' | 'eco';

const RouteMap = () => {
  const [fromLoc, setFromLoc] = useState<LocationSuggestion | null>(null);
  const [toLoc, setToLoc] = useState<LocationSuggestion | null>(null);
  
  const [loading, setLoading] = useState(false);
  const [routes, setRoutes] = useState<Record<RouteCategory, RouteOption | null>>({
    fastest: null, balanced: null, eco: null
  });
  const [selectedRouteType, setSelectedRouteType] = useState<RouteCategory>('fastest');
  
  const defaultCenter: [number, number] = [51.505, -0.09]; // London default for AirTrack look

  const handleSearch = async () => {
    if (!fromLoc || !toLoc) return;
    
    setLoading(true);
    if (fromLoc.lat && fromLoc.lon && toLoc.lat && toLoc.lon) {
      const results = await getRoutesAPI([fromLoc.lat, fromLoc.lon], [toLoc.lat, toLoc.lon]);
      
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

  return (
    <div className="min-h-screen bg-background flex flex-col pt-16 font-sans">
      <Navbar />

      <main className="flex-1 relative">
        {/* Full Bleed Map Container */}
        <div className="absolute inset-0 z-0">
          <MapContainer
            center={defaultCenter}
            zoom={13}
            className="w-full h-full"
            scrollWheelZoom={true}
            zoomControl={false}
          >
            {/* Minimalist Silver Base Map (AirTrack Aesthetic) */}
            <TileLayer
              attribution=''
              url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
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
                  color: selectedRouteType === 'eco' ? '#34D399' : '#FB923C', // Green for Eco, Orange for others
                  weight: 8, 
                  opacity: 1,
                  lineCap: "round",
                  lineJoin: "round"
                }} 
              />
            )}

            {/* Colored Nodes for Start/End */}
            {fromLoc && fromLoc.lat && fromLoc.lon && (
               <CircleMarker center={[fromLoc.lat, fromLoc.lon]} radius={6} pathOptions={{ fillColor: "#1e293b", color: "#ffffff", weight: 2, fillOpacity: 1 }}>
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

        {/* Floating Top Search Bar */}
        <div className="absolute top-6 left-1/2 -translate-x-1/2 w-full max-w-2xl px-4 z-[410] pointer-events-none">
           <div className="bg-card/95 backdrop-blur-xl rounded-2xl shadow-2xl p-2 border border-border/50 pointer-events-auto flex flex-col md:flex-row gap-2 divide-y md:divide-y-0 md:divide-x divide-border">
             <div className="flex-1 px-2">
                <LocationInput 
                  value={fromLoc} 
                  onChange={setFromLoc} 
                  placeholder="Where are you starting?" 
                  icon={<MapPin className="h-4 w-4 text-green-500" />}
                />
             </div>
             <div className="flex-1 px-2">
                <LocationInput 
                  value={toLoc} 
                  onChange={setToLoc} 
                  placeholder="Where to?" 
                  icon={<MapPin className="h-4 w-4 text-orange-500" />}
                />
             </div>
             <Button 
                onClick={handleSearch} 
                className="md:w-auto w-full h-12 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold px-6 rounded-xl self-center mx-2"
                disabled={!fromLoc || !toLoc || loading}
              >
                {loading ? <span className="animate-pulse">Loading...</span> : 'Search'}
              </Button>
           </div>
        </div>

        {/* Floating Bottom Navigation Card (AirTrack Style) */}
        {routes.fastest && (
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 w-full max-w-lg px-4 z-[410] pointer-events-none">
            <motion.div 
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
               className="bg-card backdrop-blur-3xl rounded-3xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.3)] border border-border overflow-hidden pointer-events-auto"
            >
              {/* Segemented Navigation Tabs */}
              <div className="flex p-2 bg-muted/30 border-b border-border">
                {[
                  { id: 'fastest', label: 'Fastest', icon: Navigation2 },
                  { id: 'balanced', label: 'Balanced', icon: Info },
                  { id: 'eco', label: 'Cleanest', icon: Leaf }
                ].map((type) => {
                  const isActive = selectedRouteType === type.id;
                  const Icon = type.icon;
                  return (
                    <button
                      key={type.id}
                      onClick={() => setSelectedRouteType(type.id as typeof selectedRouteType)}
                      className={`flex-1 py-3 px-2 flex flex-col items-center justify-center gap-1.5 rounded-2xl transition-all duration-300 relative ${
                        isActive ? "text-primary font-bold shadow-sm" : "text-muted-foreground font-medium hover:text-foreground hover:bg-black/5 dark:hover:bg-white/5"
                      }`}
                    >
                      {isActive && (
                        <motion.div layoutId="activeTabRoute2" className="absolute inset-0 bg-background rounded-2xl shadow-sm z-0" />
                      )}
                      <Icon className={`w-5 h-5 z-10 ${isActive && type.id === 'eco' ? 'text-green-500' : isActive ? 'text-orange-500' : ''}`} />
                      <span className="text-xs tracking-wide z-10">{type.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* Data Callouts */}
              <div className="p-6">
                <div className="flex justify-between items-end mb-6">
                  <div>
                    <h3 className="text-3xl font-bold text-foreground leading-none">
                      {currentRoute?.duration}
                    </h3>
                    <p className="text-muted-foreground text-sm font-medium mt-2">{currentRoute?.distance} via Optimal Path</p>
                  </div>
                  
                  {/* AirTrack Metric Simulation */}
                  <div className="text-right">
                    <div className={`text-2xl font-bold font-display ${selectedRouteType === 'eco' ? 'text-green-500' : 'text-orange-500'}`}>
                       {selectedRouteType === 'eco' ? '-34%' : '+12%'}
                    </div>
                    <p className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground mt-1">NO2 Exposure</p>
                  </div>
                </div>

                <Button className="w-full h-14 rounded-2xl text-lg font-bold bg-[#FB923C] hover:bg-[#F97316] text-white shadow-lg transition-transform hover:scale-[1.02] active:scale-[0.98]">
                  Start Navigation
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </main>
    </div>
  );
};

export default RouteMap;
