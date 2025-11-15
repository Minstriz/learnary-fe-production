"use client";

import { useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/app/context/AuthContext';

export default function AdminRootPage() {
  const { user, isLoggedIn, isLoading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const locale = params.locale as string || 'vi';

  useEffect(() => {
    if (isLoading) {
      return;
    }
    if (isLoggedIn && user?.role === "ADMIN") {
      router.push(`/${locale}/admin/dashboard`);
    } else {
      router.push(`/${locale}/admin/login`);
    }
  }, [isLoading, isLoggedIn, user, router, locale])

  return (
    <div className="flex h-screen w-full items-center justify-center">
      <p>Đang điều hướng...</p>
    </div>
  );
}