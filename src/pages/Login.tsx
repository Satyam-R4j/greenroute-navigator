import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Leaf, Mail, Lock, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "sonner";
import heroBg from "@/assets/hero-bg.jpg";

const Login = () => {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login, loginWithGoogle } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Where to redirect after login
  const from = location.state?.from?.pathname || "/route-map";

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast.error("Please enter a valid email");
      return;
    }
    setIsSubmitting(true);
    try {
      await login(email);
      toast.success("Successfully logged in!");
      navigate(from, { replace: true });
    } catch (error) {
      toast.error("Failed to log in");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleLogin = async () => {
    setIsSubmitting(true);
    try {
      await loginWithGoogle();
      toast.success("Successfully logged in with Google!");
      navigate(from, { replace: true });
    } catch (error) {
      toast.error("Failed to log in with Google");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex relative overflow-hidden bg-background">
      {/* Background with overlay */}
      <div className="absolute inset-0 z-0">
        <img src={heroBg} alt="Background" className="w-full h-full object-cover opacity-20" />
        <div className="absolute inset-0 bg-gradient-to-br from-background via-background/95 to-background/70" />
      </div>

      <div className="container mx-auto flex items-center justify-center relative z-10 px-4">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="w-full max-w-md"
        >
          <div className="bg-card/80 border border-border/50 rounded-3xl shadow-2xl p-8 sm:p-10 backdrop-blur-2xl">
            <div className="flex flex-col items-center mb-10">
              <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center mb-6 shadow-inner ring-1 ring-primary/20">
                <Leaf className="h-7 w-7 text-primary" />
              </div>
              <h1 className="text-3xl font-display font-bold text-foreground tracking-tight">Welcome to EcoRoute</h1>
              <p className="text-muted-foreground text-sm mt-3 text-center leading-relaxed max-w-[280px]">
                Sign in to save your favorite clean routes and access detailed monitor stats.
              </p>
            </div>

            <form onSubmit={handleEmailLogin} className="space-y-4">
              <div className="space-y-2">
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground/70" />
                  <Input 
                    type="email" 
                    placeholder="Enter your email" 
                    className="pl-12 h-14 bg-muted/40 border-border/50 focus:border-primary focus:ring-1 focus:ring-primary focus:bg-background/80 transition-all rounded-xl"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground/70" />
                  <Input 
                    type="password" 
                    placeholder="Password (optional)" 
                    className="pl-12 h-14 bg-muted/40 border-border/50 focus:border-primary focus:ring-1 focus:ring-primary focus:bg-background/80 transition-all rounded-xl"
                  />
                </div>
              </div>

              <Button 
                type="submit" 
                className="w-full h-14 text-base font-semibold gap-2 rounded-xl mt-4 shadow-lg shadow-primary/25 transition-all hover:scale-[1.02]" 
                disabled={isSubmitting}
              >
                {isSubmitting ? "Signing in..." : "Continue with Email"}
                {!isSubmitting && <ArrowRight className="h-5 w-5" />}
              </Button>
            </form>

            <div className="relative my-8">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border/60"></div>
              </div>
              <div className="relative flex justify-center text-xs uppercase font-medium tracking-wider">
                <span className="bg-card/80 px-3 text-muted-foreground">Or</span>
              </div>
            </div>

            <Button 
              variant="outline" 
              className="w-full h-14 text-base font-medium bg-background/40 hover:bg-muted/80 border-border/60 rounded-xl transition-all hover:scale-[1.02]"
              onClick={handleGoogleLogin}
              disabled={isSubmitting}
            >
              <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
              </svg>
              Continue with Google
            </Button>
            
            <p className="text-center text-xs text-muted-foreground mt-8 px-4">
              By continuing, you agree to our <a href="#" className="underline hover:text-primary transition-colors">Terms of Service</a> and <a href="#" className="underline hover:text-primary transition-colors">Privacy Policy</a>.
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Login;
