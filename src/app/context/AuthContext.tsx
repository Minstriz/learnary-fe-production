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
  avatar?: string;
}

interface AuthContextType {
  user: AuthUser | null;
  token: string | null;
  isLoggedIn: boolean;
  isLoading: boolean; 
  login: (accessToken: string) => AuthUser | null;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true); 

  useEffect(() => {
    const checkAuthOnLoad = async () => {
      const existingToken = sessionStorage.getItem('accessToken');
      try {
        let accessToken = existingToken;
        // Nếu KHÔNG có token, thử gọi refresh để lấy lại từ cookie
        if (!accessToken) {
          const response = await api.post('/auth/refresh');
          accessToken = response.data.accessToken;
          if (accessToken) {
            sessionStorage.setItem('accessToken', accessToken);
          }
        }
        if (accessToken) {
          const decodedUser = jwtDecode<AuthUser>(accessToken);
          const cleanUser: AuthUser = {
            id: decodedUser.id.trim(),
            email: decodedUser.email.trim(),
            role: decodedUser.role.trim(),
            fullName: decodedUser.fullName.trim(),
            avatar: decodedUser.avatar?.trim(),
          };
          setUser(cleanUser);
          setToken(accessToken);
        } else {
          setUser(null);
          setToken(null);
          sessionStorage.removeItem('accessToken');
        }
      } catch {
        setUser(null);
        setToken(null);
        sessionStorage.removeItem('accessToken');
      } finally {
        setIsLoading(false);
      }
    };
    checkAuthOnLoad();
  }, []); // Chỉ chạy 1 lần khi mount

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
      const cleanUser: AuthUser = {
        id: decodedUser.id.trim(),
        email: decodedUser.email.trim(),
        role: decodedUser.role.trim(),
        fullName: decodedUser.fullName.trim(),
        avatar: decodedUser.avatar?.trim(),
      };
      
      setUser(cleanUser);
      setToken(newAccessToken);
      sessionStorage.setItem('accessToken', newAccessToken);
      return cleanUser;
    } catch (error) {
      console.error("Lỗi giải mã token:", error);
      logout();
      return null;
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