"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
//import { useRouter } from 'next/navigation';
import { isAxiosError } from 'axios';
import api from '@/app/lib/axios';
import { useAuth } from '@/app/context/AuthContext';
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Image from "next/image"


export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  //const router = useRouter();
  const { login, isLoggedIn, isLoading: isAuthLoading } = useAuth();
  const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!isAuthLoading) {
      if (isLoggedIn) {
        window.location.href = '/';
      }
    }
  }, [isLoggedIn, isAuthLoading]);
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    try {
      const response = await api.post(`/auth/login`, {
        email,
        password
      });
      login(response.data.accessToken); 
      window.location.href = '/';
    } catch (err) {
      if (isAxiosError(err)) {
        setError(err.response?.data?.message || 'Email hoặc mật khẩu không đúng.');
      } else {
        setError('Không thể kết nối. Vui lòng thử lại.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Xử lý đăng nhập Google
  const handleGoogleSignIn = () => {
    setIsSubmitting(true);
    window.location.href = `${BACKEND_URL}/api/auth/google`;

  };

  if (isAuthLoading || isLoggedIn) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className='text-lg font-medium'>Đang tải...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-950">
      <Card className="w-full max-w-sm">
        <form onSubmit={handleSubmit}>
          <CardHeader className="pb-4">
            <CardTitle className="text-2xl text-center">Đăng nhập</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-6">
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="email@email.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isSubmitting}
              />
            </div>
            <div className="grid gap-2">
              <div className="flex items-center">
                <Label htmlFor="password">Mật khẩu</Label>
                <Link
                  href="/forgot-password"
                  className="ml-auto inline-block text-sm underline-offset-4 hover:underline"
                >
                  Quên mật khẩu?
                </Link>
              </div>
              <Input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isSubmitting}
                placeholder="••••••••"
              />
            </div>
            {error && (
              <p className="text-sm text-center text-red-600">{error}</p>
            )}
          </CardContent>

          <CardFooter className="flex-col gap-2 pt-6">
            <Button type="submit" className="w-full cursor-pointer" disabled={isSubmitting}>
              {isSubmitting ? 'Đang đăng nhập...' : 'Đăng nhập'}
            </Button>

            <Button
              variant="outline"
              className="w-full cursor-pointer"
              type="button"
              disabled={isSubmitting}
              onClick={handleGoogleSignIn}
            >
              <Image src={'/Logo/icons8-google-48.png'} alt='Google Logo' width={25} height={25}></Image>
              Đăng nhập với Google
            </Button>
            <div className="pt-2 text-sm">
              <Link href="/register" className="hover:underline">
                Chưa có tài khoản? Đăng ký tại đây!
              </Link>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
} 