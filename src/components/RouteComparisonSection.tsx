import { Button } from "@/components/ui/button";
import { CheckCircle, AlertTriangle, XCircle, Clock, Ruler, Wind } from "lucide-react";
import { motion } from "framer-motion";

const routes = [
  {
    name: "Green Boulevard Route",
    distance: "12.3 km",
    time: "22 min",
    aqi: 28,
    level: "Good",
    color: "text-eco-leaf",
    bg: "bg-eco-leaf/10",
    border: "border-eco-leaf/30",
    icon: CheckCircle,
    recommended: true,
  },
  {
    name: "Central Avenue Route",
    distance: "10.8 km",
    time: "18 min",
    aqi: 72,
    level: "Moderate",
    color: "text-eco-warning",
    bg: "bg-eco-warning/10",
    border: "border-eco-warning/30",
    icon: AlertTriangle,
    recommended: false,
  },
  {
    name: "Highway Express Route",
    distance: "9.5 km",
    time: "14 min",
    aqi: 145,
    level: "Unhealthy",
    color: "text-destructive",
    bg: "bg-destructive/10",
    border: "border-destructive/30",
    icon: XCircle,
    recommended: false,
  },
];

const RouteComparisonSection = () => {
  return (
    <section id="routes" className="py-24">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <span className="text-primary font-medium text-sm uppercase tracking-widest">Route Comparison</span>
          <h2 className="text-4xl md:text-5xl font-display font-bold mt-3 mb-4 text-foreground">
            See the <span className="text-primary">Difference</span>
          </h2>
          <p className="text-muted-foreground max-w-lg mx-auto text-lg">
            Not all routes are created equal. Compare pollution exposure before you go.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {routes.map((route, i) => (
            <motion.div
              key={route.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15, duration: 0.5 }}
              className={`relative bg-card rounded-2xl border ${route.recommended ? "border-primary shadow-lg shadow-primary/10" : "border-border"} p-6 flex flex-col`}
            >
              {route.recommended && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-xs font-semibold px-3 py-1 rounded-full">
                  Recommended
                </span>
              )}

              <div className={`w-full rounded-xl ${route.bg} p-4 flex items-center justify-between mb-5`}>
                <div>
                  <p className="text-3xl font-display font-bold text-foreground">{route.aqi}</p>
                  <p className={`text-sm font-medium ${route.color}`}>AQI · {route.level}</p>
                </div>
                <route.icon className={`h-10 w-10 ${route.color}`} />
              </div>

              <h3 className="font-display font-semibold text-foreground mb-4">{route.name}</h3>

              <div className="space-y-3 mb-6 flex-1">
                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                  <Ruler className="h-4 w-4" />
                  <span>{route.distance}</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  <span>{route.time}</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                  <Wind className="h-4 w-4" />
                  <span>AQI {route.aqi}</span>
                </div>
              </div>

              <Button variant={route.recommended ? "hero" : "outline"} className="w-full">
                {route.recommended ? "Choose This Route" : "View Details"}
              </Button>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default RouteComparisonSection;
