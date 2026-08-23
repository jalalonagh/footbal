"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";
import { api } from "./api";
import type { AuthResponse } from "./types";

interface User {
  token: string;
  refreshToken: string;
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
  refreshAuth: () => Promise<void>;
  isAuthenticated: boolean;
  isPlayer: boolean;
  isCoach: boolean;
  isAdmin: boolean;
  isSuperAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function persistUser(response: AuthResponse) {
  localStorage.setItem("token", response.token);
  localStorage.setItem("refreshToken", response.refreshToken);
  localStorage.setItem("user", JSON.stringify(response));
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const userData = typeof window !== "undefined" ? localStorage.getItem("user") : null;
    if (userData) {
      try { setUser(JSON.parse(userData)); } catch {}
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    const response = await api.auth.login(email, password);
    persistUser(response);
    setUser(response);
  };

  const register = async (data: { email: string; password: string; firstName: string; lastName: string }) => {
    const response = await api.auth.register(data);
    persistUser(response);
    setUser(response);
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("user");
    setUser(null);
  };

  const refreshAuth = useCallback(async () => {
    if (!user?.refreshToken) return;
    try {
      const response = await api.auth.refreshToken(user.refreshToken);
      persistUser(response);
      setUser(response);
    } catch {
      logout();
    }
  }, [user?.refreshToken]);

  const role = user?.role || "";
  const isAuthenticated = !!user;

  return (
    <AuthContext.Provider value={{
      user, loading, login, register, logout, refreshAuth,
      isAuthenticated,
      isPlayer: role === "Player",
      isCoach: role === "Coach" || role === "Admin" || role === "SuperAdmin",
      isAdmin: role === "Admin" || role === "SuperAdmin",
      isSuperAdmin: role === "SuperAdmin",
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};
