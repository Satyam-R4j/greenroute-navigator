import { useState } from "react";
import { MapContainer, TileLayer, Polyline, Popup } from "react-leaflet";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { MapPin, Navigation, Car, Truck, Bike, ArrowRight, Leaf, Clock, Route } from "lucide-react";
import { motion } from "framer-motion";
import { sampleRoutes, getAqiLevel } from "@/data/mockAqiData";
import Navbar from "@/components/Navbar";
import "leaflet/dist/leaflet.css";

const modes = [
  { icon: Car, label: "Travel" },
  { icon: Truck, label: "Delivery" },
  { icon: Bike, label: "Cycling" },
];

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

            {/* Inputs */}
            <div className="space-y-3">
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-primary" />
                <Input
                  placeholder="Starting point"
                  value={from}
                  onChange={(e) => setFrom(e.target.value)}
                  className="pl-10 h-12 bg-card border-border"
                />
              </div>
              <div className="relative">
                <Navigation className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-primary" />
                <Input
                  placeholder="Destination"
                  value={to}
                  onChange={(e) => setTo(e.target.value)}
                  className="pl-10 h-12 bg-card border-border"
                />
              </div>
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
