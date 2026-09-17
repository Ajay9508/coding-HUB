import { useMemo, useState } from "react";
import { AuthContext } from "./authContext";
const ACCOUNTS_KEY = "coding-hub-accounts";
const USER_KEY = "coding-hub-user";

const readStoredValue = (key, fallback) => {
  try {
    const value = window.localStorage.getItem(key);
    return value ? JSON.parse(value) : fallback;
  } catch {
    return fallback;
  }
};

const persist = (key, value) => {
  window.localStorage.setItem(key, JSON.stringify(value));
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => readStoredValue(USER_KEY, null));

  const register = async (name, email, password) => {
    const normalizedName = name.trim();
    const normalizedEmail = email.trim().toLowerCase();

    if (normalizedName.length < 2) {
      throw new Error("Please enter your full name.");
    }

    if (!/^\S+@\S+\.\S+$/.test(normalizedEmail)) {
      throw new Error("Please enter a valid email address.");
    }

    if (password.length < 6) {
      throw new Error("Password must be at least 6 characters.");
    }

    const accounts = readStoredValue(ACCOUNTS_KEY, []);
    if (accounts.some((account) => account.email === normalizedEmail)) {
      throw new Error("An account with this email already exists.");
    }

    const account = {
      id: crypto.randomUUID(),
      name: normalizedName,
      email: normalizedEmail,
      password,
    };
    const publicUser = { id: account.id, name: account.name, email: account.email };

    persist(ACCOUNTS_KEY, [...accounts, account]);
    persist(USER_KEY, publicUser);
    setUser(publicUser);
  };

  const login = async (email, password) => {
    const normalizedEmail = email.trim().toLowerCase();
    const accounts = readStoredValue(ACCOUNTS_KEY, []);
    const account = accounts.find(
      (savedAccount) =>
        savedAccount.email === normalizedEmail && savedAccount.password === password,
    );

    if (!account) {
      throw new Error("Incorrect email or password. Create an account first if needed.");
    }

    const publicUser = { id: account.id, name: account.name, email: account.email };
    persist(USER_KEY, publicUser);
    setUser(publicUser);
  };

  const logout = () => {
    window.localStorage.removeItem(USER_KEY);
    setUser(null);
  };

  const value = useMemo(
    () => ({ user, loading: false, login, logout, register }),
    [user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
