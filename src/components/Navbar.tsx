import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Leaf, Menu, X, Route, Activity, LogOut, Sun, Moon } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { Link, useNavigate } from "react-router-dom";
import { useTheme } from "next-themes";

const Navbar = () => {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { user, logout } = useAuth();
  const { theme, setTheme } = useTheme();
  const navigate = useNavigate();

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border/50 transition-colors">
      <div className="container mx-auto flex items-center justify-between h-16 px-4">
        <Link to="/" className="flex items-center gap-2 font-display font-bold text-xl text-primary">
          <Leaf className="h-6 w-6" />
          <span>EcoRoute</span>
        </Link>

        {/* Desktop Navbar Links */}
        <div className="hidden md:flex items-center gap-6">
          <a href="/#features" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Features</a>
          <a href="/#how-it-works" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">How It Works</a>
          <a href="/#routes" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Routes</a>
          
          <Link to="/route-map" className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md transition-all">
            <Route className="h-3.5 w-3.5" /> Route Map
          </Link>
          
          <Link to="/aqi" className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-primary text-primary-foreground text-xs font-bold shadow-md hover:bg-primary/90 transition-all">
            <Activity className="h-3.5 w-3.5" /> AQI Monitor
          </Link>

          {/* Theme Toggle Button */}
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            className="rounded-full w-9 h-9 border border-border/50 text-foreground hover:bg-muted transition-colors shrink-0"
            title={mounted && theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            {mounted && theme === 'dark' ? (
              <Sun className="h-4 w-4 text-amber-400" />
            ) : (
              <Moon className="h-4 w-4 text-slate-700 dark:text-slate-200" />
            )}
          </Button>

          {user ? (
            <div className="flex items-center gap-3 border-l border-border pl-4">
              <span className="text-xs font-semibold flex items-center gap-2">
                <img src={user.avatar} alt="Avatar" className="w-7 h-7 rounded-full bg-muted" />
                {user.name}
              </span>
              <Button variant="ghost" size="icon" onClick={handleLogout} title="Logout">
                <LogOut className="h-4 w-4 text-muted-foreground" />
              </Button>
            </div>
          ) : (
            <Link to="/login" className="pl-4 border-l border-border">
              <Button variant="hero" size="sm" className="rounded-full px-4 text-xs font-bold">Get Started</Button>
            </Link>
          )}
        </div>

        {/* Mobile controls */}
        <div className="flex items-center gap-2 md:hidden">
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            className="rounded-full w-8 h-8 border border-border/50 text-foreground"
            title="Toggle theme"
          >
            {mounted && theme === 'dark' ? (
              <Sun className="h-3.5 w-3.5 text-amber-400" />
            ) : (
              <Moon className="h-3.5 w-3.5 text-slate-700 dark:text-slate-200" />
            )}
          </Button>

          <Button variant="ghost" size="icon" onClick={() => setOpen(!open)}>
            {open ? <X /> : <Menu />}
          </Button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
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
              
              <Link to="/route-map" className="text-sm font-medium text-emerald-600 flex items-center gap-1.5" onClick={() => setOpen(false)}>
                <Route className="h-4 w-4" /> Route Map
              </Link>

              <Link to="/aqi" className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-primary text-primary-foreground text-sm font-semibold w-fit" onClick={() => setOpen(false)}>
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
