import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Leaf, Mail, Lock, User as UserIcon, ArrowRight, ShieldCheck } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "sonner";
import heroBg from "@/assets/hero-bg.jpg";

const Login = () => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { login, register } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || "/route-map";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password) {
      toast.error("Please enter email and password");
      return;
    }

    if (isSignUp) {
      if (!name) {
        toast.error("Please enter your name");
        return;
      }
      if (password.length < 6) {
        toast.error("Password must be at least 6 characters");
        return;
      }
      if (password !== confirmPassword) {
        toast.error("Passwords do not match");
        return;
      }
    }

    setIsSubmitting(true);
    try {
      if (isSignUp) {
        await register(name, email, password);
        toast.success("Account created successfully!");
      } else {
        await login(email, password);
        toast.success("Successfully logged in!");
      }
      navigate(from, { replace: true });
    } catch (error: any) {
      console.error("Auth error:", error);
      toast.error(error.message || "Authentication failed. Please check your credentials.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex relative overflow-hidden bg-background font-sans">
      {/* Background image & gradient overlay */}
      <div className="absolute inset-0 z-0">
        <img src={heroBg} alt="Background" className="w-full h-full object-cover opacity-20" />
        <div className="absolute inset-0 bg-gradient-to-br from-background via-background/95 to-background/70" />
      </div>

      <div className="container mx-auto flex items-center justify-center relative z-10 px-4 py-12">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="w-full max-w-md"
        >
          <div className="bg-card/85 border border-border/60 rounded-3xl shadow-2xl p-8 sm:p-10 backdrop-blur-2xl">
            
            {/* Logo & Header */}
            <div className="flex flex-col items-center mb-8">
              <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center mb-5 shadow-inner ring-1 ring-primary/20">
                <Leaf className="h-7 w-7 text-primary" />
              </div>
              <h1 className="text-3xl font-display font-bold text-foreground tracking-tight">
                {isSignUp ? "Create Account" : "Welcome Back"}
              </h1>
              <p className="text-muted-foreground text-xs mt-2 text-center max-w-[280px]">
                {isSignUp 
                  ? "Join EcoRoute to save custom green paths & environmental stats." 
                  : "Sign in to access clean navigation routes and real-time AQI statistics."}
              </p>
            </div>

            {/* Auth Mode Toggle Tabs */}
            <div className="flex bg-muted/40 p-1 rounded-2xl border border-border/50 mb-6">
              <button
                type="button"
                onClick={() => setIsSignUp(false)}
                className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${
                  !isSignUp
                    ? "bg-card text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => setIsSignUp(true)}
                className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${
                  isSignUp
                    ? "bg-card text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Sign Up
              </button>
            </div>

            {/* Form Fields */}
            <form onSubmit={handleSubmit} className="space-y-3">
              <AnimatePresence mode="wait">
                {isSignUp && (
                  <motion.div
                    key="signup-name"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="space-y-1 overflow-hidden"
                  >
                    <div className="relative">
                      <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/70" />
                      <Input 
                        type="text" 
                        placeholder="Full Name" 
                        className="pl-11 h-12 bg-muted/30 border-border/50 focus:border-primary focus:ring-1 focus:ring-primary text-xs rounded-xl"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required={isSignUp}
                      />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/70" />
                <Input 
                  type="email" 
                  placeholder="Email Address" 
                  className="pl-11 h-12 bg-muted/30 border-border/50 focus:border-primary focus:ring-1 focus:ring-primary text-xs rounded-xl"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/70" />
                <Input 
                  type="password" 
                  placeholder="Password" 
                  className="pl-11 h-12 bg-muted/30 border-border/50 focus:border-primary focus:ring-1 focus:ring-primary text-xs rounded-xl"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              <AnimatePresence mode="wait">
                {isSignUp && (
                  <motion.div
                    key="signup-confirm"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="space-y-1 overflow-hidden"
                  >
                    <div className="relative">
                      <ShieldCheck className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/70" />
                      <Input 
                        type="password" 
                        placeholder="Confirm Password" 
                        className="pl-11 h-12 bg-muted/30 border-border/50 focus:border-primary focus:ring-1 focus:ring-primary text-xs rounded-xl"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required={isSignUp}
                      />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <Button 
                type="submit" 
                className="w-full h-12 text-sm font-bold gap-2 rounded-xl mt-4 shadow-lg shadow-primary/20 transition-all hover:scale-[1.01] bg-primary text-primary-foreground" 
                disabled={isSubmitting}
              >
                {isSubmitting 
                  ? (isSignUp ? "Creating account..." : "Signing in...") 
                  : (isSignUp ? "Create Account" : "Sign In")}
                {!isSubmitting && <ArrowRight className="h-4 w-4" />}
              </Button>
            </form>

            {/* Bottom Toggle Prompt */}
            <div className="text-center mt-6">
              <button
                type="button"
                onClick={() => setIsSignUp(!isSignUp)}
                className="text-xs text-muted-foreground hover:text-primary transition-colors font-medium"
              >
                {isSignUp 
                  ? "Already have an account? Sign In" 
                  : "Don't have an account? Sign Up"}
              </button>
            </div>
            
            <p className="text-center text-[11px] text-muted-foreground/70 mt-6 px-2">
              Protected by GreenRoute MongoDB Authentication System.
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Login;
