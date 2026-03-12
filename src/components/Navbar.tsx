import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Leaf, Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const Navbar = () => {
  const [open, setOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border/50">
      <div className="container mx-auto flex items-center justify-between h-16 px-4">
        <a href="/" className="flex items-center gap-2 font-display font-bold text-xl text-primary">
          <Leaf className="h-6 w-6" />
          <span>EcoRoute</span>
        </a>

        <div className="hidden md:flex items-center gap-8">
          <a href="/#features" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Features</a>
          <a href="/#how-it-works" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">How It Works</a>
          <a href="/route-map" className="text-sm font-medium text-primary hover:text-primary/80 transition-colors font-semibold border border-primary/30 px-3 py-1 rounded-full">Route Map</a>
          <a href="/aqi" className="text-sm font-medium text-primary hover:text-primary/80 transition-colors font-semibold border border-primary/30 px-3 py-1 rounded-full">AQI Monitor</a>
          <Button variant="hero" size="sm">Get Started</Button>
        </div>

        <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setOpen(!open)}>
          {open ? <X /> : <Menu />}
        </Button>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="md:hidden bg-background border-b border-border overflow-hidden"
          >
            <div className="flex flex-col gap-3 p-4">
              <a href="/#features" className="text-sm font-medium text-muted-foreground" onClick={() => setOpen(false)}>Features</a>
              <a href="/#how-it-works" className="text-sm font-medium text-muted-foreground" onClick={() => setOpen(false)}>How It Works</a>
              <a href="/route-map" className="text-sm font-medium text-primary font-semibold" onClick={() => setOpen(false)}>Route Map</a>
              <a href="/aqi" className="text-sm font-medium text-primary font-semibold" onClick={() => setOpen(false)}>AQI Monitor</a>
              <Button variant="hero" size="sm">Get Started</Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
