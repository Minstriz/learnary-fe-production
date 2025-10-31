"use client";

import { useAuth } from '@/app/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isLoggedIn, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading) {
      if (!isLoggedIn) {
        router.push('/login');
      }
    }
  }, [isLoading, isLoggedIn, router]); 

  // Nếu đang loading, hiển thị màn hình chờ
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Đang tải...</p>
      </div>
    );
  }

  // Nếu đã đăng nhập, hiển thị trang
  if (isLoggedIn) {
    return <>{children}</>;
  }

  return null;
}