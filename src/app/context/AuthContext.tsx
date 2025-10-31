"use client";

import React, { 
  createContext, 
  useContext, 
  useState, 
  useEffect, 
  ReactNode,
  useCallback,
} from 'react';
import { jwtDecode } from 'jwt-decode'; // npm install jwt-decode

interface AuthUser {
  id: string;
  email: string;
  role: string;
  fullName: string;
}

interface AuthContextType {
  user: AuthUser | null;
  token: string | null;
  isLoggedIn: boolean;
  isLoading: boolean; 
  login: (token: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true); 
  useEffect(() => {
    const storedToken = localStorage.getItem('authToken');
    if (storedToken) {
      try {
        const decodedUser = jwtDecode<AuthUser>(storedToken);
        setUser(decodedUser);
        setToken(storedToken);
      } catch (error: unknown) {
        console.error("Lỗi giải mã token:", error);
        localStorage.removeItem('authToken');
      }
    }
    setIsLoading(false); 
  }, []);

  const login = useCallback((newToken: string) => {
    try {
      localStorage.setItem('authToken', newToken);
      const decodedUser = jwtDecode<AuthUser>(newToken);
      setUser(decodedUser);
      setToken(newToken);
    } catch (error) {
      console.error("Lỗi giải mã token:", error);
      logout();
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('authToken');
    setUser(null);
    setToken(null);
  }, []);

  return (
    <AuthContext.Provider value={{ 
      user, 
      token, 
      isLoggedIn: !!user,
      isLoading,
      login, 
      logout 
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth phải được dùng bên trong AuthProvider');
  }
  return context;
}