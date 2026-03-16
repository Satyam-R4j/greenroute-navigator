import { useState, useEffect, useCallback, useRef } from "react";
import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from "react-leaflet";
import { Input } from "@/components/ui/input";
import { Search, MapPin, Clock, ArrowRight, Loader2, Info, Map as MapIcon } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Navbar from "@/components/Navbar";
import { toast } from "sonner";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { getStationsInBounds, searchLocation, getAqiColor, type WaqiStation } from "@/services/waqiService";

// Helper component to auto-fit map to a specific location
const MapController = ({ targetLocation }: { targetLocation: [number, number] | null }) => {
  const map = useMap();

  useEffect(() => {
    if (targetLocation) {
      map.flyTo(targetLocation, 11, {
        duration: 1.5,
        easeLinearity: 0.25,
      });
    }
  }, [targetLocation, map]);

  return null;
};

// Component to handle fetching data automatically when user pans/zooms
const MapDataFetcher = ({ setStations, setIsLoading }: { setStations: (s: WaqiStation[]) => void, setIsLoading: (loading: boolean) => void }) => {
  const map = useMap();
  
  const fetchStations = useCallback(async () => {
    setIsLoading(true);
    const bounds = map.getBounds();
    const stations = await getStationsInBounds(bounds.getSouthWest(), bounds.getNorthEast());
    setStations(stations);
    setIsLoading(false);
  }, [map, setStations, setIsLoading]);

  useMapEvents({
    moveend: fetchStations,
    zoomend: fetchStations
  });

  // Initial fetch on mount
  useEffect(() => {
    fetchStations();
  }, [fetchStations]);

  return null;
};

const AqiDashboard = () => {
  const [search, setSearch] = useState("");
  const [stations, setStations] = useState<WaqiStation[]>([]);
  const [selectedStation, setSelectedStation] = useState<WaqiStation | null>(null);
  // Default to a central global view
  const [targetLocation, setTargetLocation] = useState<[number, number] | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  
  // Suggestion State
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const searchTimeoutRef = useRef<NodeJS.Timeout>();
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Handle clicking outside to close suggestions
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearch(value);

    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);

    if (value.trim().length > 2) {
      searchTimeoutRef.current = setTimeout(async () => {
        const results = await searchLocation(value);
        setSuggestions(results);
        setIsDropdownOpen(true);
      }, 300); // 300ms debounce
    } else {
      setSuggestions([]);
      setIsDropdownOpen(false);
    }
  };

  const handleSelectSuggestion = (suggestion: any) => {
    setSearch(suggestion.name);
    setIsDropdownOpen(false);
    
    if (suggestion.latitude && suggestion.longitude) {
      setTargetLocation([suggestion.latitude, suggestion.longitude]);
      setSelectedStation(null);
    }
  };

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    
    const query = search.trim();
    if (!query) return;

    setIsSearching(true);
    const results = await searchLocation(query);
    setIsSearching(false);

    if (results && results.length > 0) {
      // Find the first result that has valid geo coordinates
      const bestMatch = results[0];
      if (bestMatch && bestMatch.latitude && bestMatch.longitude) {
         setTargetLocation([bestMatch.latitude, bestMatch.longitude]);
         // Deselect current station so the user focuses on the new area
         setSelectedStation(null);
      } else {
         toast.error("Location found but no map coordinates available.");
      }
    } else {
      toast.error(`No AQI data found for "${query}"`);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col pt-16 font-sans">
      <Navbar />

      <main className="flex-1 relative">
        {/* Full Bleed Map Container */}
        <div className="absolute inset-0 z-0">
          <MapContainer
            center={targetLocation || [20, 0]} // Default to global view or target
            zoom={targetLocation ? 11 : 3}
            className="w-full h-full"
            scrollWheelZoom
            zoomControl={false}
          >
            {/* Minimalist Silver Base Map (AirTrack Aesthetic) */}
            <TileLayer
              attribution=''
              url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
            />
            
            <MapController targetLocation={targetLocation} />
            <MapDataFetcher setStations={setStations} setIsLoading={setIsLoading} />

            {stations.map((station) => {
              const aqiColor = getAqiColor(station.aqi);
              
              // Custom div icon mimicking modern glowing UI
              const isSelected = selectedStation?.uid === station.uid;
              const iconHtml = `
                <div class="aqi-marker-modern ${isSelected ? 'selected' : ''}" 
                     style="--aqi-color: ${aqiColor.bg}; border-color: ${aqiColor.bg}; color: ${aqiColor.bg};">
                  ${station.aqi}
                </div>
              `;

              const icon = L.divIcon({
                className: "custom-div-icon",
                html: iconHtml,
                iconSize: [28, 28],
                iconAnchor: [14, 14],
              });

              return (
                <Marker
                  key={station.uid}
                  position={[station.lat, station.lon]}
                  icon={icon}
                  eventHandlers={{
                    click: () => {
                      setSelectedStation(station);
                      // Clear target so it doesn't snap back on interactions
                      setTargetLocation(null); 
                    },
                  }}
                />
              );
            })}
          </MapContainer>
        </div>

        {/* Floating Top Search & Header */}
        <div className="absolute top-6 left-0 right-0 px-4 z-[410] pointer-events-none">
          <div className="container mx-auto">
            <div className="flex flex-col md:flex-row justify-between items-start gap-4">
              
              {/* Title Card */}
              <div className="bg-card/95 backdrop-blur-xl p-5 rounded-3xl shadow-2xl border border-border/50 pointer-events-auto">
                <motion.h1
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-3xl md:text-4xl font-display font-bold mb-2 text-foreground"
                >
                  Air Quality Index
                </motion.h1>
                <p className="text-muted-foreground text-sm">
                  Real-time global air quality tracking powered by WAQI
                </p>
                <div className="mt-4 flex items-center gap-2">
                   <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-secondary text-secondary-foreground text-xs font-semibold shadow-sm border border-border">
                      <span className={`w-2 h-2 rounded-full ${isLoading ? 'bg-yellow-500 animate-pulse' : 'bg-green-500'}`} />
                      {isLoading ? "Fetching stations in view..." : `Displaying ${stations.length} local stations`}
                   </span>
                </div>
              </div>
              
              {/* Search Bar */}
              <div className="relative w-full md:w-[28rem] pointer-events-auto" ref={dropdownRef}>
                <form 
                  className="bg-card/95 backdrop-blur-xl rounded-2xl shadow-2xl p-2 border border-border/50 flex gap-2"
                  onSubmit={handleSearch}
                >
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search any city or region globally..."
                      value={search}
                      onChange={handleInputChange}
                      onFocus={() => search.length > 2 && suggestions.length > 0 && setIsDropdownOpen(true)}
                      className="pl-10 h-11 bg-transparent border-0 outline-none focus-visible:ring-0 shadow-none text-foreground font-medium"
                      autoComplete="off"
                    />
                  </div>
                  <button 
                    type="submit"
                    disabled={isSearching}
                    className="h-11 w-11 bg-primary text-primary-foreground rounded-xl flex items-center justify-center hover:bg-primary/90 transition-colors shadow-md disabled:opacity-70"
                  >
                    {isSearching ? <Loader2 className="w-5 h-5 animate-spin"/> : <ArrowRight className="h-5 w-5" />}
                  </button>
                </form>

                {/* Suggestions Dropdown */}
                <AnimatePresence>
                  {isDropdownOpen && suggestions.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="absolute top-full left-0 right-0 mt-2 bg-card border border-border shadow-xl rounded-xl overflow-hidden z-[1000]"
                    >
                      <div className="max-h-60 overflow-y-auto w-full p-2 space-y-1">
                        {suggestions.map((suggestion) => (
                          <button
                            key={suggestion.id}
                            type="button"
                            onClick={() => handleSelectSuggestion(suggestion)}
                            className="w-full text-left px-3 py-2 flex flex-col items-start gap-1 rounded-lg hover:bg-muted transition-colors"
                          >
                            <span className="font-semibold text-foreground text-sm flex items-center gap-2">
                              <MapIcon className="w-4 h-4 text-muted-foreground" />
                              {suggestion.name}
                            </span>
                            <span className="text-xs text-muted-foreground ml-6">
                              {suggestion.admin1 ? `${suggestion.admin1}, ` : ""}{suggestion.country}
                            </span>
                          </button>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </div>

        {/* Floating Sidebar for Selected Station */}
        <AnimatePresence>
          {selectedStation && (
            <motion.div 
              initial={{ opacity: 0, x: -20, scale: 0.95 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: -20, scale: 0.95 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              className="absolute bottom-8 left-1/2 -translate-x-1/2 md:translate-x-0 md:left-8 md:bottom-8 z-[410] w-[90%] md:w-80 bg-background/95 backdrop-blur-3xl border border-border rounded-3xl p-5 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.3)] pointer-events-auto"
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1 pr-4">
                  <h2 className="text-xl font-bold text-foreground leading-tight">
                    {selectedStation.station.name}
                  </h2>
                </div>
                <button 
                  onClick={() => setSelectedStation(null)}
                  className="text-muted-foreground hover:bg-muted p-1 rounded-md transition-colors"
                >
                  <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12.8536 2.85355C13.0488 2.65829 13.0488 2.34171 12.8536 2.14645C12.6583 1.95118 12.3417 1.95118 12.1464 2.14645L7.5 6.79289L2.85355 2.14645C2.65829 1.95118 2.34171 1.95118 2.14645 2.14645C1.95118 2.34171 1.95118 2.65829 2.14645 2.85355L6.79289 7.5L2.14645 12.1464C1.95118 12.3417 1.95118 12.6583 2.14645 12.8536C2.34171 13.0488 2.65829 13.0488 2.85355 12.8536L7.5 8.20711L12.1464 12.8536C12.3417 13.0488 12.6583 13.0488 12.8536 12.8536C13.0488 12.6583 13.0488 12.3417 12.8536 12.1464L8.20711 7.5L12.8536 2.85355Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"></path></svg>
                </button>
              </div>
              
              <div className="flex items-center gap-2 text-muted-foreground text-xs mb-6">
                <MapPin className="w-3 h-3" />
                <span>{selectedStation.lat.toFixed(4)}, {selectedStation.lon.toFixed(4)}</span>
              </div>

              <div className="flex items-center gap-4 p-4 rounded-2xl mb-4 shadow-inner" style={{ backgroundColor: getAqiColor(selectedStation.aqi).bg, color: getAqiColor(selectedStation.aqi).text }}>
                <div className="text-5xl font-black tracking-tighter">{selectedStation.aqi}</div>
                <div className="flex-1">
                  <p className="text-[10px] font-bold uppercase tracking-widest opacity-80 mb-0.5">Air Quality</p>
                  <p className="text-xl font-bold leading-none">{getAqiColor(selectedStation.aqi).label}</p>
                </div>
              </div>

              <div className="space-y-3 bg-muted/30 p-4 rounded-2xl border border-border/50 text-sm">
                <div className="flex items-center gap-3">
                   <Clock className="w-4 h-4 text-muted-foreground" />
                   <span className="text-muted-foreground">Updated:</span>
                   <span className="font-medium text-foreground ml-auto text-xs">{selectedStation.station.time ? new Date(selectedStation.station.time).toLocaleString() : 'N/A'}</span>
                </div>
                <div className="flex items-center gap-3">
                   <Info className="w-4 h-4 text-muted-foreground" />
                   <span className="text-muted-foreground">Station UID:</span>
                   <span className="font-medium text-foreground ml-auto bg-background px-2 py-0.5 rounded shadow-sm border border-border">#{selectedStation.uid}</span>
                </div>
              </div>
              
              <p className="text-[10px] text-muted-foreground/60 text-center mt-4 pt-4 border-t border-border/50">
                Real-time data provided by WAQI
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Custom Markers CSS */}
        <style>{`
          .leaflet-container { background: #f8f9fa; } 
          .custom-div-icon {
            background: transparent;
            border: none;
          }
          .aqi-marker-modern {
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: 800;
            font-size: 11px;
            border-radius: 50%;
            border: 2px solid var(--aqi-color);
            background: rgba(255,255,255,0.95);
            backdrop-filter: blur(4px);
            width: 100%;
            height: 100%;
            transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
            box-shadow: 0 0 10px rgba(0,0,0,0.1);
          }
          .aqi-marker-modern:hover, .aqi-marker-modern.selected {
            transform: scale(1.3);
            z-index: 1000 !important;
            cursor: pointer;
            background: var(--aqi-color);
            color: #fff !important;
            box-shadow: 0 5px 15px rgba(0,0,0,0.2), 0 0 20px var(--aqi-color);
          }
        `}</style>
      </main>
    </div>
  );
};

export default AqiDashboard;
