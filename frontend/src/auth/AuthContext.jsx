import { createContext, useContext, useMemo, useState } from "react";

const AuthContext = createContext(null);
const TOKEN_KEY = "aiFitnessCoach.authToken";
const USER_KEY = "aiFitnessCoach.authUser";

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() =>
    window.localStorage.getItem(TOKEN_KEY),
  );
  const [user, setUser] = useState(() => {
    try {
      const raw = window.localStorage.getItem(USER_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  });

  const value = useMemo(
    () => ({
      token,
      user,
      isAuthenticated: Boolean(token),
      login: (nextToken, nextUser) => {
        setToken(nextToken);
        setUser(nextUser);
        window.localStorage.setItem(TOKEN_KEY, nextToken);
        window.localStorage.setItem(USER_KEY, JSON.stringify(nextUser));
      },
      updateUser: (nextUser) => {
        setUser(nextUser);
        window.localStorage.setItem(USER_KEY, JSON.stringify(nextUser));
      },
      logout: () => {
        setToken(null);
        setUser(null);
        window.localStorage.removeItem(TOKEN_KEY);
        window.localStorage.removeItem(USER_KEY);
      },
    }),
    [token, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used inside AuthProvider");
  }
  return ctx;
}
