import React, { createContext, useContext, useState, useEffect } from "react";
import { apiFetch } from "../api";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem("token"));

  // Sayfa yenilenince token varsa backend'den kullanıcıyı yükle
  useEffect(() => {
    const loadUser = async () => {
      if (!token) return;

      try {
        const data = await apiFetch("/auth/me");
        setUser(data);
      } catch {
        setUser(null);
      }
    };

    loadUser();
  }, [token]);

  const login = (userInfo, token) => {
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(userInfo));

    setToken(token);
    setUser(userInfo);
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
