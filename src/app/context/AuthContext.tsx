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
import api from '@/app/lib/axios';
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
  login: (accessToken: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true); 

  useEffect(() => {
    const checkAuthOnLoad = async () => {
      try {
        const response = await api.post('/auth/refresh');
        const { accessToken } = response.data;
      
        const decodedUser = jwtDecode<AuthUser>(accessToken);
        setUser(decodedUser);
        setToken(accessToken);
        sessionStorage.setItem('accessToken', accessToken); 
      } catch (error) {
        setUser(null);
        setToken(null);
        sessionStorage.removeItem('accessToken'); 
        console.error("Không thể refresh token khi tải trang:", error);
      } finally {
        setIsLoading(false);
      }
    };
    checkAuthOnLoad();  
  }, []);

  const logout = useCallback(async() => {
    try {
      // Gọi BE để xóa data (HttpOnly cookie)
      await api.post('/auth/logout'); 
    } catch (error) {
      console.error("Lỗi logout:", error);
    } finally {
      // Xóa data sessionStorage và state
      sessionStorage.removeItem('accessToken');
      setUser(null);
      setToken(null);
      window.location.href = '/';
    }
  }, []);

  const login = useCallback((newAccessToken: string) => {
    try {
      const decodedUser = jwtDecode<AuthUser>(newAccessToken);
      setUser(decodedUser);
      setToken(newAccessToken);
      sessionStorage.setItem('accessToken', newAccessToken);
    } catch (error) {
      console.error("Lỗi giải mã token:", error);
      logout();
    }
  }, [logout]);
  

  return (
    <AuthContext.Provider value={{ 
      user, 
      token, 
      isLoggedIn: !!user,
      isLoading,
      login: login,
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