import { useState, useRef, useEffect } from "react";
import { MapContainer, TileLayer, Polyline, Popup } from "react-leaflet";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { MapPin, Navigation, Car, Truck, Bike, ArrowRight, Leaf, Clock, Route } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { sampleRoutes, getAqiLevel } from "@/data/mockAqiData";
import { searchLocations, type LocationSuggestion } from "@/data/locationSuggestions";
import Navbar from "@/components/Navbar";
import "leaflet/dist/leaflet.css";

const modes = [
  { icon: Car, label: "Travel" },
  { icon: Truck, label: "Delivery" },
  { icon: Bike, label: "Cycling" },
];

const typeIcons: Record<string, string> = {
  city: "🏙️",
  area: "📍",
  state: "🗺️",
};

interface LocationInputProps {
  icon: React.ElementType;
  placeholder: string;
  value: string;
  onChange: (val: string) => void;
}

const LocationInput = ({ icon: Icon, placeholder, value, onChange }: LocationInputProps) => {
  const [focused, setFocused] = useState(false);
  const [suggestions, setSuggestions] = useState<LocationSuggestion[]>([]);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setSuggestions(searchLocations(value));
  }, [value]);

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
    <div ref={wrapperRef} className="relative">
      <Icon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-primary z-10" />
      <Input
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setFocused(true)}
        className="pl-10 h-12 bg-card border-border"
      />
      <AnimatePresence>
        {showDropdown && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.15 }}
            className="absolute top-full left-0 right-0 mt-1 bg-card border border-border rounded-xl shadow-lg z-50 overflow-hidden"
          >
            {suggestions.map((s) => (
              <button
                key={s.id}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => {
                  onChange(s.name);
                  setFocused(false);
                }}
                className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-primary/5 transition-colors border-b border-border/50 last:border-b-0"
              >
                <span className="text-base">{typeIcons[s.type]}</span>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{s.name}</p>
                  <p className="text-xs text-muted-foreground truncate">
                    {s.parent} · <span className="capitalize">{s.type}</span>
                  </p>
                </div>
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const RouteMap = () => {
  const [activeMode, setActiveMode] = useState(0);
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [showRoutes, setShowRoutes] = useState(false);
  const [selectedRoute, setSelectedRoute] = useState(sampleRoutes[0].id);

  const handleSearch = () => {
    if (from && to) setShowRoutes(true);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-20 pb-12 container mx-auto px-4">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-4xl md:text-5xl font-display font-bold mb-2 text-foreground"
        >
          Route Finder
        </motion.h1>
        <p className="text-muted-foreground mb-8">
          Find the cleanest route to your destination
        </p>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Controls */}
          <div className="space-y-6">
            {/* Mode */}
            <div className="flex gap-2">
              {modes.map((mode, i) => (
                <button
                  key={mode.label}
                  onClick={() => setActiveMode(i)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    activeMode === i
                      ? "bg-primary text-primary-foreground shadow-md"
                      : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                  }`}
                >
                  <mode.icon className="h-4 w-4" />
                  {mode.label}
                </button>
              ))}
            </div>

            {/* Inputs with autocomplete */}
            <div className="space-y-3">
              <LocationInput
                icon={MapPin}
                placeholder="Starting point — city, area, or state"
                value={from}
                onChange={setFrom}
              />
              <LocationInput
                icon={Navigation}
                placeholder="Destination — city, area, or state"
                value={to}
                onChange={setTo}
              />
              <Button variant="hero" className="w-full h-12 gap-2" onClick={handleSearch}>
                Find Clean Route <ArrowRight className="h-4 w-4" />
              </Button>
            </div>

            {/* Route Options */}
            {showRoutes && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-3"
              >
                <h3 className="font-display font-semibold text-foreground">Available Routes</h3>
                {sampleRoutes.map((route) => {
                  const level = getAqiLevel(route.avgAqi);
                  return (
                    <button
                      key={route.id}
                      onClick={() => setSelectedRoute(route.id)}
                      className={`w-full text-left p-4 rounded-xl border transition-all ${
                        selectedRoute === route.id
                          ? "border-primary bg-primary/5 shadow-md"
                          : "border-border bg-card hover:border-primary/50"
                      }`}
                    >
                      <p className="font-semibold text-foreground mb-1">{route.name}</p>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1"><Route className="h-3 w-3" />{route.distance}</span>
                        <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{route.duration}</span>
                        <span className="flex items-center gap-1"><Leaf className="h-3 w-3" />AQI {route.avgAqi}</span>
                      </div>
                      <p className={`text-xs mt-1 ${level.textColor}`}>{level.label}</p>
                    </button>
                  );
                })}
              </motion.div>
            )}
          </div>

          {/* Map */}
          <div className="lg:col-span-2 bg-card rounded-2xl border border-border overflow-hidden">
            <div className="h-[600px]">
              <MapContainer
                center={[28.625, 77.23]}
                zoom={13}
                className="h-full w-full"
                scrollWheelZoom
              >
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/">OSM</a>'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                {showRoutes &&
                  sampleRoutes.map((route) => (
                    <Polyline
                      key={route.id}
                      positions={route.path}
                      pathOptions={{
                        color: route.color,
                        weight: selectedRoute === route.id ? 6 : 3,
                        opacity: selectedRoute === route.id ? 1 : 0.4,
                      }}
                    >
                      <Popup>
                        <strong>{route.name}</strong><br />
                        {route.distance} · {route.duration}<br />
                        Avg AQI: {route.avgAqi}
                      </Popup>
                    </Polyline>
                  ))}
              </MapContainer>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RouteMap;
