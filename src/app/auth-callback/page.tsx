"use client"; 

import React, { useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/app/context/AuthContext'; 

function AuthCallback() {
  const router = useRouter();
  const searchParams = useSearchParams(); 
  const { login } = useAuth(); 
  useEffect(() => {
    const accessToken = searchParams.get('accessToken');
    if (accessToken) {
      login(accessToken); 
      router.replace('/');
    } else {
      router.replace('/login?error=callback_failed');
    }
  }, [router, searchParams, login]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-lg font-medium">Đang xử lý đăng nhập...</p>
    </div>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-lg font-medium">Đang tải...</p>
      </div>
    }>
      <AuthCallback />
    </Suspense>
  );
}