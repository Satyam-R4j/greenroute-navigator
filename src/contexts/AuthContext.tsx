import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";

interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check local storage for user on mount
    const storedUser = localStorage.getItem("eco_route_user");
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        console.error("Failed to parse stored user", e);
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string) => {
    // Mock login simulating network delay
    return new Promise<void>((resolve) => {
      setTimeout(() => {
        const mockUser = {
          id: Math.random().toString(36).substring(2, 9),
          email,
          name: email.split('@')[0],
          avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${email.split('@')[0]}`,
        };
        setUser(mockUser);
        localStorage.setItem("eco_route_user", JSON.stringify(mockUser));
        resolve();
      }, 1000);
    });
  };

  const loginWithGoogle = async () => {
    // Mock google login
    return new Promise<void>((resolve) => {
      setTimeout(() => {
        const mockUser = {
          id: Math.random().toString(36).substring(2, 9),
          email: "user@google.com",
          name: "Google User",
          avatar: "https://api.dicebear.com/7.x/initials/svg?seed=Google",
        };
        setUser(mockUser);
        localStorage.setItem("eco_route_user", JSON.stringify(mockUser));
        resolve();
      }, 1000);
    });
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("eco_route_user");
  };

  return (
    <AuthContext.Provider value={{ user, login, loginWithGoogle, logout, isLoading }}>
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
