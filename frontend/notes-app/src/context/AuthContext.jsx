// src/context/AuthContext.jsx
import React, { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);

  // Load user from localStorage on refresh
  useEffect(() => {
    const stored = localStorage.getItem("user");
    if (stored) setUser(JSON.parse(stored));
  }, []);

  const login = (data) => {
    const mapped = {
      id: data.id || data.userId || data.user_id,   // <--- FIX HERE
      username: data.username,
      email: data.email,
      avatarUrl: data.avatarUrl,
      token: data.token,
    };

    setUser(mapped);
    localStorage.setItem("user", JSON.stringify(mapped));
  };

  useEffect(() => {
  const stored = localStorage.getItem("user");
  if (stored) {
    const parsed = JSON.parse(stored);

    parsed.avatarUrl = parsed.avatarUrl || parsed.avatar_url || null;
    parsed.avatar_url = parsed.avatarUrl;

    setUser(parsed);
  }
}, []);

  const logout = () => {
    setUser(null);
    localStorage.removeItem("user");
  };

  return (
    <AuthContext.Provider value={{ user, setUser, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
