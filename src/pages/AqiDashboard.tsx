import { useState } from "react";
import { MapContainer, TileLayer, CircleMarker, Popup } from "react-leaflet";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Wind, Droplets, ThermometerSun, Heart, AlertTriangle, Shield } from "lucide-react";
import { motion } from "framer-motion";
import { cities, getAqiLevel, type CityAqi } from "@/data/mockAqiData";
import Navbar from "@/components/Navbar";
import "leaflet/dist/leaflet.css";

const AqiDashboard = () => {
  const [search, setSearch] = useState("");
  const [selectedCity, setSelectedCity] = useState<CityAqi>(cities[0]);

  const filtered = cities.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.country.toLowerCase().includes(search.toLowerCase())
  );

  const level = getAqiLevel(selectedCity.aqi);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-20 pb-12 container mx-auto px-4">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-4xl md:text-5xl font-display font-bold mb-2 text-foreground"
        >
          AQI Monitor
        </motion.h1>
        <p className="text-muted-foreground mb-8">
          Real-time air quality monitoring across global cities
        </p>

        {/* Search */}
        <div className="relative max-w-md mb-8">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search city..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 h-12 bg-card border-border"
          />
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* City list */}
          <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2">
            {filtered.map((city) => {
              const cl = getAqiLevel(city.aqi);
              return (
                <button
                  key={city.id}
                  onClick={() => setSelectedCity(city)}
                  className={`w-full text-left p-4 rounded-xl border transition-all ${
                    selectedCity.id === city.id
                      ? "border-primary bg-primary/5 shadow-md"
                      : "border-border bg-card hover:border-primary/50"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-foreground">{city.name}</p>
                      <p className="text-sm text-muted-foreground">{city.country} · {city.updatedAt}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{cl.emoji}</span>
                      <div className={`px-3 py-1 rounded-full text-sm font-bold text-white ${cl.color}`}>
                        {city.aqi}
                      </div>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Detail + Heatmap */}
          <div className="lg:col-span-2 space-y-6">
            {/* AQI Detail Card */}
            <div className="bg-card rounded-2xl border border-border p-6">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-display font-bold text-foreground">{selectedCity.name}</h2>
                  <p className="text-muted-foreground">{selectedCity.country}</p>
                </div>
                <div className="text-center">
                  <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-white font-bold text-2xl ${level.color}`}>
                    {level.emoji} {selectedCity.aqi}
                  </div>
                  <p className={`text-sm font-medium mt-1 ${level.textColor}`}>{level.label}</p>
                </div>
              </div>

              {/* Pollutants */}
              <div className="grid grid-cols-3 md:grid-cols-6 gap-3 mb-6">
                {[
                  { label: "PM2.5", value: selectedCity.pollutants.pm25, unit: "μg/m³", icon: Droplets },
                  { label: "PM10", value: selectedCity.pollutants.pm10, unit: "μg/m³", icon: Wind },
                  { label: "O₃", value: selectedCity.pollutants.o3, unit: "ppb", icon: ThermometerSun },
                  { label: "NO₂", value: selectedCity.pollutants.no2, unit: "ppb", icon: AlertTriangle },
                  { label: "SO₂", value: selectedCity.pollutants.so2, unit: "ppb", icon: Shield },
                  { label: "CO", value: selectedCity.pollutants.co, unit: "mg/m³", icon: Wind },
                ].map((p) => (
                  <div key={p.label} className="bg-muted rounded-xl p-3 text-center">
                    <p.icon className="h-4 w-4 mx-auto mb-1 text-muted-foreground" />
                    <p className="text-xs text-muted-foreground">{p.label}</p>
                    <p className="font-bold text-foreground">{p.value}</p>
                    <p className="text-xs text-muted-foreground">{p.unit}</p>
                  </div>
                ))}
              </div>

              {/* Health Recommendations */}
              <div className="bg-muted rounded-xl p-4 flex gap-3 items-start">
                <Heart className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                <div>
                  <p className="font-semibold text-foreground text-sm">Health Recommendation</p>
                  <p className="text-sm text-muted-foreground">{level.advice}</p>
                </div>
              </div>
            </div>

            {/* Heatmap */}
            <div className="bg-card rounded-2xl border border-border overflow-hidden">
              <div className="p-4 border-b border-border">
                <h3 className="font-display font-semibold text-foreground">Pollution Heatmap</h3>
                <p className="text-sm text-muted-foreground">Circle size and color indicate AQI levels</p>
              </div>
              <div className="h-[400px]">
                <MapContainer
                  center={[selectedCity.lat, selectedCity.lng]}
                  zoom={3}
                  className="h-full w-full"
                  scrollWheelZoom
                  key={selectedCity.id}
                >
                  <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/">OSM</a>'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />
                  {cities.map((city) => {
                    const cl = getAqiLevel(city.aqi);
                    return (
                      <CircleMarker
                        key={city.id}
                        center={[city.lat, city.lng]}
                        radius={Math.max(10, city.aqi / 5)}
                        pathOptions={{
                          color: city.aqi <= 50 ? "#22c55e" : city.aqi <= 100 ? "#eab308" : city.aqi <= 150 ? "#f97316" : "#ef4444",
                          fillOpacity: 0.5,
                        }}
                      >
                        <Popup>
                          <strong>{city.name}</strong><br />
                          AQI: {city.aqi} ({cl.label})
                        </Popup>
                      </CircleMarker>
                    );
                  })}
                </MapContainer>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AqiDashboard;
