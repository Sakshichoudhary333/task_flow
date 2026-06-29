

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { AUTH_TOKEN_KEY, api } from "../lib/api";

const AuthContext = createContext(null);

const fetchCurrentUser = async () => {
  const response = await api.get("/auth/me");
  return response.data;
};

export function AuthProvider({ children }) {
  const queryClient = useQueryClient();
  const [token, setToken] = useState(() =>
    window.localStorage.getItem(AUTH_TOKEN_KEY) || ""
  );

  const meQuery = useQuery({
    queryKey: ["auth", "me"],
    queryFn: fetchCurrentUser,
    enabled: Boolean(token),
    retry: false,
  });

  useEffect(() => {
    if (
      meQuery.error &&
      meQuery.error.response &&
      meQuery.error.response.status === 401
    ) {
      window.localStorage.removeItem(AUTH_TOKEN_KEY);
      setToken("");
      queryClient.clear();
    }
  }, [meQuery.error, queryClient]);

  const login = useCallback((nextToken) => {
    window.localStorage.setItem(AUTH_TOKEN_KEY, nextToken);
    setToken(nextToken);
  }, []);
  
  const logout = useCallback(() => {
    window.localStorage.removeItem(AUTH_TOKEN_KEY);
    setToken("");
    queryClient.clear();
  }, [queryClient]);

  const value = useMemo(
    () => ({
      token,
      user: meQuery.data || null,
      authLoading: Boolean(token) && meQuery.isLoading,
      isAuthenticated: Boolean(token),
      login,
      logout,
    }),
    [login, logout, meQuery.data, meQuery.isLoading, token]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  return context;
}
