"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { isAxiosError } from 'axios';
import api from '@/app/lib/axios';
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from 'sonner';


export default function SignUpPage() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    if (password !== confirmPassword) {
      setError('Mật khẩu xác nhận không khớp.');
      return;
    }
    setIsSubmitting(true);
    try {
      const res = await api.post(`/auth/register`, { 
        fullName, 
        email, 
        password 
      });
      if(res) {
        router.push('/verify-email')
        toast.success('Đăng ký thành công! Bạn sẽ được chuyển đến trang xác thực email.');
      }
    } catch (err) {
      if (isAxiosError(err)) {
        setError(err.response?.data?.message || err.response?.data?.error || 'Email này đã được sử dụng.');
      } else {
        setError('Không thể đăng ký. Vui lòng thử lại.');
      }
    } finally {
      setIsSubmitting(false); 
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-950">
      <Card className="w-full max-w-sm">
        <form onSubmit={handleSubmit}>
          
          <CardHeader className="pb-4">
            <CardTitle className="text-2xl">Tạo tài khoản</CardTitle>
            <CardDescription>
              Nhập thông tin của bạn để tạo tài khoản mới
            </CardDescription>
          </CardHeader>

          <CardContent className="flex flex-col gap-4">

            <div className="grid gap-2">
              <Label htmlFor="fullName">Họ và tên</Label>
              <Input
                id="fullName"
                type="text"
                placeholder="Nguyễn Văn A"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                disabled={isSubmitting}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="ban@email.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isSubmitting}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password">Mật khẩu</Label>
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
            <div className="grid gap-2">
              <Label htmlFor="confirmPassword">Xác nhận mật khẩu</Label>
              <Input 
                id="confirmPassword" 
                type="password" 
                required 
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={isSubmitting}
                placeholder="••••••••"
              />
            </div>

            {error && (
              <p className="text-sm text-center text-red-600">{error}</p>
            )}
          </CardContent>

          <CardFooter className="flex-col gap-4 pt-4">
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? 'Đang tạo...' : 'Đăng ký'}
            </Button>
            
            <div className="text-center text-sm">
              Đã có tài khoản?{' '}
              <Link href="/login" className="underline hover:text-blue-600">
                Đăng nhập
              </Link>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}