import React, { createContext, useContext, useState, useEffect } from "react";
import { api } from "../services/api";

interface User {
  id: string;
  name: string;
  email: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Initialize and restore auth token
  useEffect(() => {
    const restoreAuth = () => {
      const savedToken = localStorage.getItem("future_finance_token");
      const savedUser = localStorage.getItem("future_finance_user");

      if (savedToken && savedUser) {
        try {
          const parsedUser = JSON.parse(savedUser);
          setToken(savedToken);
          setUser(parsedUser);
          // Set Axios Authorization Header
          api.defaults.headers.common["Authorization"] = `Bearer ${savedToken}`;
        } catch (e) {
          localStorage.removeItem("future_finance_token");
          localStorage.removeItem("future_finance_user");
        }
      }
      setLoading(false);
    };
    restoreAuth();
  }, []);

  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      const response = await api.post("/auth/login", { email, password });
      const { token: jwtToken, user: userData } = response.data;

      localStorage.setItem("future_finance_token", jwtToken);
      localStorage.setItem("future_finance_user", JSON.stringify(userData));

      setToken(jwtToken);
      setUser(userData);
      api.defaults.headers.common["Authorization"] = `Bearer ${jwtToken}`;
    } catch (error: any) {
      throw new Error(error.response?.data?.error || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  const register = async (name: string, email: string, password: string) => {
    setLoading(true);
    try {
      const response = await api.post("/auth/register", { name, email, password });
      const { token: jwtToken, user: userData } = response.data;

      localStorage.setItem("future_finance_token", jwtToken);
      localStorage.setItem("future_finance_user", JSON.stringify(userData));

      setToken(jwtToken);
      setUser(userData);
      api.defaults.headers.common["Authorization"] = `Bearer ${jwtToken}`;
    } catch (error: any) {
      throw new Error(error.response?.data?.error || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem("future_finance_token");
    localStorage.removeItem("future_finance_user");
    setToken(null);
    setUser(null);
    delete api.defaults.headers.common["Authorization"];
  };

  const value = {
    user,
    token,
    isAuthenticated: !!token,
    loading,
    login,
    register,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
