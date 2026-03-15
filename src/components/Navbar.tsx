import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Leaf, Menu, X, Route, Activity, LogOut, User } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { Link, useNavigate } from "react-router-dom";

const Navbar = () => {
  const [open, setOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border/50">
      <div className="container mx-auto flex items-center justify-between h-16 px-4">
        <Link to="/" className="flex items-center gap-2 font-display font-bold text-xl text-primary">
          <Leaf className="h-6 w-6" />
          <span>EcoRoute</span>
        </Link>

        <div className="hidden md:flex items-center gap-8">
          <a href="/#features" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Features</a>
          <a href="/#how-it-works" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">How It Works</a>
          <a href="/#routes" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Routes</a>
          <Link to="/route-map" className="inline-flex items-center gap-1.5 px-2 py-2 rounded-md bg-primary text-primary-foreground text-sm font-semibold shadow-md hover:bg-primary/90 transition-all">
            <Route className="h-4 w-4" /> Route Map
          </Link>
          <Link to="/aqi" className="inline-flex items-center gap-1.5 px-2 py-2 rounded-md bg-primary text-primary-foreground text-sm font-semibold shadow-md hover:bg-primary/90 transition-all">
            <Activity className="h-4 w-4" /> AQI Monitor
          </Link>
          
          {user ? (
            <div className="flex items-center gap-4 border-l border-border pl-6 ml-2">
              <span className="text-sm font-medium flex items-center gap-2">
                <img src={user.avatar} alt="Avatar" className="w-7 h-7 rounded-full bg-muted" />
                {user.name}
              </span>
              <Button variant="ghost" size="icon" onClick={handleLogout} title="Logout">
                <LogOut className="h-4 w-4 text-muted-foreground" />
              </Button>
            </div>
          ) : (
            <Link to="/login" className="ml-2 pl-6 border-l border-border">
              <Button variant="hero" size="sm" className="rounded-full px-5">Get Started</Button>
            </Link>
          )}
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
              <a href="/#routes" className="text-sm font-medium text-muted-foreground" onClick={() => setOpen(false)}>Routes</a>
              <Link to="/route-map" className="text-sm font-medium text-muted-foreground flex items-center gap-1.5" onClick={() => setOpen(false)}>
                <Route className="h-4 w-4" /> Route Map
              </Link>
              <Link to="/aqi" className="inline-flex items-center gap-1.5 px-5 py-2 rounded-full bg-primary text-primary-foreground text-sm font-semibold w-fit" onClick={() => setOpen(false)}>
                <Activity className="h-4 w-4" /> AQI Monitor
              </Link>
              
              <div className="h-px bg-border my-2"></div>
              
              {user ? (
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium flex items-center gap-2">
                    <img src={user.avatar} alt="Avatar" className="w-8 h-8 rounded-full bg-muted" />
                    {user.name}
                  </span>
                  <Button variant="ghost" size="sm" onClick={() => { handleLogout(); setOpen(false); }}>
                    <LogOut className="h-4 w-4 mr-2" /> Logout
                  </Button>
                </div>
              ) : (
                <Link to="/login" onClick={() => setOpen(false)}>
                  <Button variant="hero" size="sm" className="rounded-full w-full">Get Started</Button>
                </Link>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
