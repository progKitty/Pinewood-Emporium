import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { fetchApi } from "./api-client";

type User = {
  id: number;
  username: string;
  email: string;
  role: "ADMIN" | "VENDOR" | "CUSTOMER";
  first_name: string;
  last_name: string;
};

type AuthContextValue = {
  user: User | null;
  loading: boolean;
  signOut: () => void;
  setUser: (user: User | null) => void;
  token: string | null;
  setToken: (token: string | null) => void;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [token, setTokenState] = useState<string | null>(null);

  const setToken = (newToken: string | null) => {
    if (newToken) {
      localStorage.setItem('accessToken', newToken);
    } else {
      localStorage.removeItem('accessToken');
    }
    setTokenState(newToken);
  };

  useEffect(() => {
    const t = localStorage.getItem('accessToken');
    if (t) {
      setTokenState(t);
      fetchApi('/users/me/')
        .then((data: any) => {
          setUser(data);
        })
        .catch(err => {
          console.error("Auth me failed:", err);
          localStorage.removeItem('accessToken');
          setTokenState(null);
          setUser(null);
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, []);

  const signOut = () => {
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{ user, loading, signOut, setUser, token, setToken }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
