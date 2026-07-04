import { createContext, useContext, useEffect, useState } from "react";
import { api } from "../services/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("hrms_token");
    if (!token) {
      setLoading(false);
      return;
    }
    api
      .me()
      .then(({ user }) => setUser(user))
      .catch(() => {
        localStorage.removeItem("hrms_token");
      })
      .finally(() => setLoading(false));
  }, []);

  async function login(email, password, role) {
    const { token, user } = await api.login({ email, password, role });
    localStorage.setItem("hrms_token", token);
    setUser(user);
    return user;
  }

  async function signup(payload) {
    const { token, user } = await api.signup(payload);
    localStorage.setItem("hrms_token", token);
    setUser(user);
    return user;
  }

  function logout() {
    localStorage.removeItem("hrms_token");
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout, isAdmin: user?.role === "admin" }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}