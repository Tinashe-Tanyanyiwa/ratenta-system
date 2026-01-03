import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from "react";
import directus from "@/lib/directus";
import { readMe } from "@directus/sdk";

export interface User {
  id: string;
  email: string;
  first_name?: string;
  last_name?: string;
  role?: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  sessionExpiresAt: number | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const SESSION_DURATION = 3 * 60 * 60 * 1000; // 3 hours in milliseconds
const STORAGE_KEY = "ratenta_auth";
const EMERGENCY_EMAIL = "tanyanyiwatinashe7@gmail.com";

interface StoredAuth {
  user: User;
  expiresAt: number;
}

export const AuthProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [sessionExpiresAt, setSessionExpiresAt] = useState<number | null>(null);

  const logout = useCallback(() => {
    directus.logout();
    setUser(null);
    setSessionExpiresAt(null);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  // Check session expiration
  useEffect(() => {
    if (!sessionExpiresAt) return;

    const checkExpiration = () => {
      if (Date.now() >= sessionExpiresAt) {
        logout();
      }
    };

    const interval = setInterval(checkExpiration, 60000); // Check every minute
    return () => clearInterval(interval);
  }, [sessionExpiresAt, logout]);

  // Restore session from localStorage
  useEffect(() => {
    const storedAuth = localStorage.getItem(STORAGE_KEY);
    if (storedAuth) {
      try {
        const { user: storedUser, expiresAt } = JSON.parse(
          storedAuth
        ) as StoredAuth;
        if (Date.now() < expiresAt) {
          setUser(storedUser);
          setSessionExpiresAt(expiresAt);
        } else {
          localStorage.removeItem(STORAGE_KEY);
        }
      } catch {
        localStorage.removeItem(STORAGE_KEY);
      }
    }
    setIsLoading(false);
  }, []);

  const login = useCallback(
    async (email: string, password: string): Promise<boolean> => {
      setIsLoading(true);

      try {
        await directus.login({
          email,
          password,
        });

        const me = await directus.request(readMe());

        const expiresAt = Date.now() + SESSION_DURATION;

        setUser(me as User);
        setSessionExpiresAt(expiresAt);

        localStorage.setItem(
          STORAGE_KEY,
          JSON.stringify({ user: me, expiresAt })
        );

        return true;
      } catch (error) {
        console.error("Directus login failed:", error);
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        logout,
        sessionExpiresAt,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
