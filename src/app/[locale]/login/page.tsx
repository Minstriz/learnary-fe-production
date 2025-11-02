"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import axios, { isAxiosError } from 'axios';
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
import { } from "lucide-react"
import Image from "next/image"

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { login } = useAuth();
  const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

  // Xử lý đăng nhập bằng Email/Pass
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      // Gọi API của BE
      const response = await axios.post(`${BACKEND_URL}/api/auth/login`, {
        email,
        password
      });
      login(response.data.token);
      router.push('/');
    } catch (err) {
      if (isAxiosError(err)) {
        setError(err.response?.data?.message || 'Email hoặc mật khẩu không đúng.');
      } else {
        setError('Không thể kết nối. Vui lòng thử lại.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Xử lý đăng nhập Google
  const handleGoogleSignIn = () => {
    setIsLoading(true);
    window.location.href = `${BACKEND_URL}/api/auth/google`;

  };

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
                disabled={isLoading}
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
                disabled={isLoading}
                placeholder="••••••••"
              />
            </div>
            {error && (
              <p className="text-sm text-center text-red-600">{error}</p>
            )}
          </CardContent>

          <CardFooter className="flex-col gap-2 pt-6">
            <Button type="submit" className="w-full cursor-pointer" disabled={isLoading}>
              {isLoading ? 'Đang đăng nhập...' : 'Đăng nhập'}
            </Button>

            <Button
              variant="outline"
              className="w-full cursor-pointer"
              type="button"
              disabled={isLoading}
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