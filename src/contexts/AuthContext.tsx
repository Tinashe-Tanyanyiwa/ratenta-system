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
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  /**
   * Restore session from Directus on app load
   * Directus automatically restores tokens from localStorage
   */
  useEffect(() => {
    const restoreSession = async () => {
      try {
        const me = await directus.request(readMe());
        setUser(me as User);
      } catch {
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    restoreSession();
  }, []);

  /**
   * Login
   */
  const login = useCallback(
    async (email: string, password: string): Promise<boolean> => {
      setIsLoading(true);
      try {
        await directus.login({ email, password });
        const me = await directus.request(readMe());
        setUser(me as User);
        return true;
      } catch (error) {
        console.error("Directus login failed:", error);
        setUser(null);
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  /**
   * Logout
   */
  const logout = useCallback(async () => {
    try {
      await directus.logout();
    } catch {
      // ignore logout errors (expired refresh token etc.)
    } finally {
      setUser(null);
    }
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
