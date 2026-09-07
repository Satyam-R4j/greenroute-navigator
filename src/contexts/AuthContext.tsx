import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { registerUser, loginUser, getCurrentUser, AuthUser } from "@/services/authService";

interface AuthContextType {
  user: AuthUser | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Restore session from JWT token on mount
    const storedToken = localStorage.getItem("greenroute_token");
    if (storedToken) {
      setToken(storedToken);
      getCurrentUser(storedToken)
        .then(({ user }) => {
          setUser(user);
        })
        .catch(() => {
          // Token expired or invalid
          localStorage.removeItem("greenroute_token");
          setToken(null);
          setUser(null);
        })
        .finally(() => {
          setIsLoading(false);
        });
    } else {
      setIsLoading(false);
    }
  }, []);

  const login = async (email: string, password: string) => {
    const res = await loginUser(email, password);
    setUser(res.user);
    setToken(res.token);
    localStorage.setItem("greenroute_token", res.token);
  };

  const register = async (name: string, email: string, password: string) => {
    const res = await registerUser(name, email, password);
    setUser(res.user);
    setToken(res.token);
    localStorage.setItem("greenroute_token", res.token);
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("greenroute_token");
  };

  return (
    <AuthContext.Provider value={{ user, token, login, register, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
