"use client"; 

import React, { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/app/context/AuthContext'; 

export default function AuthCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams(); 
  const { login } = useAuth(); 
  /* 2 CÁI HOOK useEffect, useState, useCallBack*/
  useEffect(() => {
    const accessToken = searchParams.get('accessToken');

    if (accessToken) {
      login(accessToken); 
      router.replace('/'); // Dùng replace để xóa lịch sử
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