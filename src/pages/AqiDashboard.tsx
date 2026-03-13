import { useState } from "react";
import { MapContainer, TileLayer, CircleMarker, Popup } from "react-leaflet";
import { Input } from "@/components/ui/input";
import { Search, Wind, Droplets, ThermometerSun, AlertTriangle } from "lucide-react";
import { motion } from "framer-motion";
import { cities, getAqiLevel, type CityAqi } from "@/data/mockAqiData";
import Navbar from "@/components/Navbar";
import "leaflet/dist/leaflet.css";

const AqiDashboard = () => {
  const [search, setSearch] = useState("");
  const [selectedCity, setSelectedCity] = useState<CityAqi>(cities[0]);

  const level = getAqiLevel(selectedCity.aqi);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <div className="pt-20 pb-4 container mx-auto px-4 flex-1 flex flex-col">
        <div className="flex justify-between items-end mb-6">
          <div>
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-4xl md:text-5xl font-display font-bold mb-2 text-foreground"
            >
              AirTrack Monitor
            </motion.h1>
            <p className="text-muted-foreground">
              Global real-time air quality visualization
            </p>
          </div>
          
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search region..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 h-10 bg-card border-border rounded-full"
            />
          </div>
        </div>

        {/* Minimalist AirTrack Dashboard Layout */}
        <div className="relative flex-1 min-h-[600px] w-full rounded-3xl overflow-hidden border border-border shadow-2xl bg-[#0b0b0b]">
          
          {/* Edge Vignettes for cinematic depth */}
          <div className="absolute inset-0 pointer-events-none z-[400]" style={{
            background: 'radial-gradient(circle at center, transparent 30%, rgba(11,11,11,0.9) 100%), linear-gradient(to bottom, rgba(11,11,11,1) 0%, transparent 15%, transparent 85%, rgba(11,11,11,1) 100%)'
          }} />

          {/* Map Engine */}
          <MapContainer
            center={[20, 0]}
            zoom={2.5}
            className="absolute inset-0 z-0 bg-[#0b0b0b]"
            scrollWheelZoom
            zoomControl={false}
          >
            {/* Premium Dark Mode Tiles - No Labels */}
            <TileLayer
              attribution=''
              url="https://{s}.basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}{r}.png"
            />
            
            {cities.map((city) => {
              // AirTrack Heat Palette logic
              let baseColor = "#34D399"; // Vibrant Green
              if (city.aqi > 50) baseColor = "#FBBF24"; // Bright Yellow
              if (city.aqi > 100) baseColor = "#FB923C"; // Electric Orange
              if (city.aqi > 150) baseColor = "#EF4444"; // Alert Red

              return (
                <CircleMarker
                  key={city.id}
                  center={[city.lat, city.lng]}
                  radius={city.id === selectedCity.id ? 8 : 4}
                  pathOptions={{
                    color: baseColor,
                    fillColor: baseColor,
                    fillOpacity: 0.9,
                    weight: city.id === selectedCity.id ? 2 : 0, 
                  }}
                  eventHandlers={{
                    click: () => setSelectedCity(city),
                  }}
                  className={`transition-all duration-300 ${city.id === selectedCity.id ? 'active-node' : 'heat-node'}`}
                >
                  <Popup className="airtrack-popup" closeButton={false}>
                    <div className="p-2 backdrop-blur-xl bg-black/60 border border-white/10 rounded-xl min-w-[140px]">
                      <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1 font-semibold">{city.country}</p>
                      <h4 className="text-lg font-bold text-white leading-tight mb-2">{city.name}</h4>
                      <div className="flex items-center justify-between mt-2 pt-2 border-t border-white/10">
                        <span className="text-xs text-white/70">AQI Score</span>
                        <span className="font-bold text-base" style={{ color: baseColor }}>{city.aqi}</span>
                      </div>
                    </div>
                  </Popup>
                </CircleMarker>
              );
            })}
          </MapContainer>

          {/* Floating Top Left HUD: Selected City Stats */}
          <div className="absolute top-6 left-6 z-[410] w-80 pointer-events-none">
            <motion.div 
              key={selectedCity.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-black/60 backdrop-blur-2xl border border-white/10 rounded-2xl p-5 pointer-events-auto shadow-2xl"
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h2 className="text-2xl font-display font-bold text-white leading-none">{selectedCity.name}</h2>
                  <p className="text-white/50 text-sm mt-1">{selectedCity.country}</p>
                </div>
                <div className={`px-3 py-1 rounded-full text-xs font-bold text-black ${level.color}`}>
                  {level.label}
                </div>
              </div>

              {/* Simplified Metric Grid */}
              <div className="grid grid-cols-2 gap-3 mt-4">
                <div className="bg-white/5 rounded-xl p-3 border border-white/5">
                  <p className="text-white/50 text-[10px] uppercase font-bold tracking-wider mb-1 flex items-center gap-1.5"><Wind className="w-3 h-3" /> AQI Peak</p>
                  <p className="text-2xl font-bold text-white">{selectedCity.aqi}</p>
                </div>
                <div className="bg-white/5 rounded-xl p-3 border border-white/5">
                  <p className="text-white/50 text-[10px] uppercase font-bold tracking-wider mb-1 flex items-center gap-1.5"><Droplets className="w-3 h-3" /> PM2.5</p>
                  <p className="text-2xl font-bold text-white">{selectedCity.pollutants.pm25}<span className="text-xs text-white/40 ml-1">μg</span></p>
                </div>
                 <div className="bg-white/5 rounded-xl p-3 border border-white/5">
                  <p className="text-white/50 text-[10px] uppercase font-bold tracking-wider mb-1 flex items-center gap-1.5"><AlertTriangle className="w-3 h-3" /> NO2 Level</p>
                  <p className="text-2xl font-bold text-white">{selectedCity.pollutants.no2}<span className="text-xs text-white/40 ml-1">ppb</span></p>
                </div>
                 <div className="bg-white/5 rounded-xl p-3 border border-white/5">
                  <p className="text-white/50 text-[10px] uppercase font-bold tracking-wider mb-1 flex items-center gap-1.5"><ThermometerSun className="w-3 h-3" /> Ozone</p>
                  <p className="text-2xl font-bold text-white">{selectedCity.pollutants.o3}<span className="text-xs text-white/40 ml-1">ppb</span></p>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Floating Bottom Right Controls */}
          <div className="absolute bottom-6 right-6 z-[410] flex flex-col items-end gap-6 pointer-events-none">
            
            {/* Hero Stats */}
            <div className="text-right">
              <p className="text-white/50 text-xs font-semibold uppercase tracking-widest mb-1">Global Locations Tracker</p>
              <motion.h3 
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
                className="text-5xl font-bold text-white leading-none tracking-tight -mr-1"
              >
                292,112
              </motion.h3>
              <p className="text-white/40 text-sm mt-1">active data points</p>
            </div>

            {/* Segmented Toggles */}
            <div className="bg-[#1a1a1e]/80 border border-white/10 rounded-xl p-1 flex pointer-events-auto backdrop-blur-xl shadow-2xl">
              <button className="px-5 py-2 rounded-lg text-xs font-medium text-white bg-white/10 shadow-sm transition-all">
                AQI
              </button>
              <button className="px-5 py-2 rounded-lg text-xs font-medium text-white/50 hover:text-white transition-all">
                PM2.5
              </button>
               <button className="px-5 py-2 rounded-lg text-xs font-medium text-white/50 hover:text-white transition-all">
                NO2
              </button>
            </div>
          </div>

          {/* Custom Markers CSS */}
          <style>{`
            .leaflet-popup-content-wrapper { background: transparent; padding: 0; border-radius: 0; box-shadow: none; }
            .leaflet-popup-content { margin: 0; width: auto !important; }
            .leaflet-popup-tip-container { display: none; }
            .leaflet-container { background: #0b0b0b; }
            
            .heat-node {
              filter: drop-shadow(0 0 6px currentColor);
              transition: transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);
            }
            .heat-node:hover {
              transform: scale(1.5);
              filter: drop-shadow(0 0 12px currentColor) brightness(1.3);
              cursor: pointer;
            }
            .active-node {
              filter: drop-shadow(0 0 15px currentColor) brightness(1.5);
              animation: pulse-ring 2s infinite;
            }
            @keyframes pulse-ring {
              0% { filter: drop-shadow(0 0 10px currentColor) }
              50% { filter: drop-shadow(0 0 25px currentColor) }
              100% { filter: drop-shadow(0 0 10px currentColor) }
            }
          `}</style>
        </div>
      </div>
    </div>
  );
};

export default AqiDashboard;
