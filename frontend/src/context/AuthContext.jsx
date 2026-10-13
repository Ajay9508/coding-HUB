import { useCallback, useEffect, useMemo, useState } from "react";
import { AuthContext } from "./authContext";
const USER_KEY = "coding-hub-user";
const TOKEN_KEY = "coding-hub-token";
import api from "../api";

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(() => Boolean(window.localStorage.getItem(TOKEN_KEY)));

  useEffect(() => {
    if (!window.localStorage.getItem(TOKEN_KEY)) return;
    api.get("/auth/me")
      .then(({ data }) => setUser(data.user))
      .catch(() => {
        window.localStorage.removeItem(TOKEN_KEY);
        window.localStorage.removeItem(USER_KEY);
      })
      .finally(() => setLoading(false));
  }, []);

  const acceptSession = useCallback(({ user: nextUser, token }) => {
    window.localStorage.setItem(TOKEN_KEY, token);
    window.localStorage.setItem(USER_KEY, JSON.stringify(nextUser));
    setUser(nextUser);
  }, []);

  const register = useCallback(async (name, email, password) => {
    const { data } = await api.post("/auth/register", { name, email, password });
    acceptSession(data);
  }, [acceptSession]);

  const login = useCallback(async (email, password) => {
    const { data } = await api.post("/auth/login", { email, password });
    acceptSession(data);
  }, [acceptSession]);

  const logout = useCallback(() => {
    window.localStorage.removeItem(USER_KEY);
    window.localStorage.removeItem(TOKEN_KEY);
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({ user, loading, login, logout, register }),
    [user, loading, login, logout, register],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
