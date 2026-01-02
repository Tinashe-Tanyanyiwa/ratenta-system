import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { mockUsers, User } from '@/data/mockData';

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
const STORAGE_KEY = 'ratenta_auth';
const EMERGENCY_EMAIL = 'tanyanyiwatinashe7@gmail.com';

interface StoredAuth {
  user: User;
  expiresAt: number;
}

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [sessionExpiresAt, setSessionExpiresAt] = useState<number | null>(null);

  const logout = useCallback(() => {
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
        const { user: storedUser, expiresAt } = JSON.parse(storedAuth) as StoredAuth;
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

  const login = useCallback(async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 800));

    // Emergency login for database connectivity issues
    if (email === EMERGENCY_EMAIL) {
      const emergencyUser = mockUsers.find(u => u.email === EMERGENCY_EMAIL);
      if (emergencyUser) {
        const expiresAt = Date.now() + SESSION_DURATION;
        setUser(emergencyUser);
        setSessionExpiresAt(expiresAt);
        localStorage.setItem(STORAGE_KEY, JSON.stringify({ user: emergencyUser, expiresAt }));
        setIsLoading(false);
        return true;
      }
    }

    // Check against mock users (in production, this would be Directus API)
    const foundUser = mockUsers.find(u => u.email === email);
    
    // For mock purposes, accept any password with valid email
    if (foundUser && password.length >= 6) {
      const expiresAt = Date.now() + SESSION_DURATION;
      setUser(foundUser);
      setSessionExpiresAt(expiresAt);
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ user: foundUser, expiresAt }));
      setIsLoading(false);
      return true;
    }

    setIsLoading(false);
    return false;
  }, []);

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
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
