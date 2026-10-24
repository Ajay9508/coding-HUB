import { useCallback, useEffect, useMemo, useState } from "react";
import { AuthContext } from "./authContext";
import api from "../api";

const USER_KEY = "coding-hub-user";
const TOKEN_KEY = "coding-hub-token";

export const AuthProvider = ({ children }) => {
  const hasStoredToken = () => Boolean(window.localStorage.getItem(TOKEN_KEY));
  const [user, setUser] = useState(() => {
    try {
      const saved = window.localStorage.getItem(USER_KEY);
      return hasStoredToken() && saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [loading, setLoading] = useState(hasStoredToken);

  // Validate existing session against backend
  useEffect(() => {
    const token = window.localStorage.getItem(TOKEN_KEY);
    if (!token) return;

    api
      .get("/auth/me")
      .then(({ data }) => {
        if (data?.user) {
          setUser(data.user);
          window.localStorage.setItem(USER_KEY, JSON.stringify(data.user));
        }
      })
      .catch(() => {
        window.localStorage.removeItem(TOKEN_KEY);
        window.localStorage.removeItem(USER_KEY);
        setUser(null);
      })
      .finally(() => setLoading(false));
  }, []);

  const acceptSession = useCallback(({ user: nextUser, token }) => {
    if (token) window.localStorage.setItem(TOKEN_KEY, token);
    if (nextUser) window.localStorage.setItem(USER_KEY, JSON.stringify(nextUser));
    setUser(nextUser);
  }, []);

  const register = useCallback(
    async (name, email, password) => {
      const { data } = await api.post("/auth/register", { name, email, password });
      acceptSession(data);
      return data;
    },
    [acceptSession],
  );

  const login = useCallback(
    async (email, password) => {
      const { data } = await api.post("/auth/login", { email, password });
      acceptSession(data);
      return data;
    },
    [acceptSession],
  );

  const logout = useCallback(() => {
    window.localStorage.removeItem(USER_KEY);
    window.localStorage.removeItem(TOKEN_KEY);
    setUser(null);
  }, []);

  const updateUser = useCallback((nextUser) => {
    window.localStorage.setItem(USER_KEY, JSON.stringify(nextUser));
    setUser(nextUser);
  }, []);

  const value = useMemo(
    () => ({ user, loading, login, logout, register, updateUser }),
    [user, loading, login, logout, register, updateUser],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
