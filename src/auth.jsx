import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { api } from "./api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [admin, setAdmin] = useState(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const boot = async () => {
      try {
        if (localStorage.getItem("user_token")) {
          const data = await api("/auth/me", { auth: "user" });
          setUser(data.user);
        }
      } catch {
        localStorage.removeItem("user_token");
      }
      try {
        if (localStorage.getItem("admin_token")) {
          const data = await api("/admin/auth/me", { auth: "admin" });
          setAdmin(data.admin);
        }
      } catch {
        localStorage.removeItem("admin_token");
      }
      setReady(true);
    };
    boot();
  }, []);

  const value = useMemo(
    () => ({
      user,
      admin,
      ready,
      setUser,
      setAdmin,
      logoutUser: () => {
        localStorage.removeItem("user_token");
        setUser(null);
      },
      logoutAdmin: () => {
        localStorage.removeItem("admin_token");
        setAdmin(null);
      },
    }),
    [user, admin, ready]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
