import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MapPin, Navigation, Truck, Bike, Car, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import heroBg from "@/assets/hero-bg.jpg";
import { useNavigate } from "react-router-dom";

const modes = [
  { icon: Car, label: "Travel", active: true },
  { icon: Truck, label: "Delivery", active: false },
  { icon: Bike, label: "Cycling", active: false },
];

const HeroSection = () => {
  const [activeMode, setActiveMode] = useState(0);
  const [startPoint, setStartPoint] = useState("");
  const [destination, setDestination] = useState("");
  const navigate = useNavigate();

  const handleSearch = () => {
    // Navigate to route map. Unauthenticated users will be intercepted by ProtectedRoute
    navigate("/route-map");
  };

  return (
    <section className="relative min-h-screen flex items-center pt-16 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 z-0">
        <img src={heroBg} alt="" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-br from-background/95 via-background/80 to-background/60" />
      </div>

      {/* Floating decorative elements */}
      <div className="absolute top-32 right-20 w-64 h-64 rounded-full bg-primary/10 blur-3xl animate-pulse-glow hidden lg:block" />
      <div className="absolute bottom-20 left-10 w-48 h-48 rounded-full bg-accent/10 blur-3xl animate-pulse-glow hidden lg:block" />

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-3xl">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
          >
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
              <span className="w-2 h-2 rounded-full bg-eco-leaf animate-pulse" />
              Breathe cleaner air on every route
            </span>

            <h1 className="text-5xl md:text-7xl font-display font-bold leading-tight mb-6 text-foreground">
              Find the
              <span className="text-primary"> Cleanest </span>
              Route to Your Destination
            </h1>

            <p className="text-lg md:text-xl text-muted-foreground mb-10 max-w-xl">
              Real-time pollution data meets smart navigation. Choose routes that protect your health and the environment.
            </p>
          </motion.div>

          {/* Route Search Card */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="bg-card rounded-2xl shadow-xl border border-border p-6 max-w-xl"
          >
            {/* Mode Selector */}
            <div className="flex gap-2 mb-5">
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

            {/* Input Fields */}
            <div className="space-y-3 mb-5">
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-eco-leaf" />
                <Input
                  placeholder="Starting point"
                  className="pl-10 h-12 bg-muted border-none"
                  value={startPoint}
                  onChange={(e) => setStartPoint(e.target.value)}
                />
              </div>
              <div className="relative">
                <Navigation className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-primary" />
                <Input
                  placeholder="Destination"
                  className="pl-10 h-12 bg-muted border-none"
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                />
              </div>
            </div>

            <Button 
              variant="hero" 
              className="w-full h-12 text-base gap-2"
              onClick={handleSearch}
            >
              Find Clean Route
              <ArrowRight className="h-4 w-4" />
            </Button>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
