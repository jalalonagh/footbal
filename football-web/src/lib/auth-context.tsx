"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { api } from "./api";

interface User {
  token: string;
  email: string;
  role: string;
  userId: string;
  fullName: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: { email: string; password: string; firstName: string; lastName: string }) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    const userData = typeof window !== "undefined" ? localStorage.getItem("user") : null;
    if (token && userData) {
      try { setUser(JSON.parse(userData)); } catch {}
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    const response = await api.auth.login(email, password);
    localStorage.setItem("token", response.token);
    localStorage.setItem("user", JSON.stringify(response));
    setUser(response);
  };

  const register = async (data: { email: string; password: string; firstName: string; lastName: string }) => {
    const response = await api.auth.register(data);
    localStorage.setItem("token", response.token);
    localStorage.setItem("user", JSON.stringify(response));
    setUser(response);
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};
