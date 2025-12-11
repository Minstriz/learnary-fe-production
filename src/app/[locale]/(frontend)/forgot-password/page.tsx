"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { isAxiosError } from 'axios';
import api from '@/app/lib/axios';
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { ArrowLeft, Mail, KeyRound, Lock } from "lucide-react";

type Step = 'email' | 'otp' | 'password';

export default function ForgotPasswordPage() {
  const [step, setStep] = useState<Step>('email');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await api.post('/auth/forgot-password', { email });
      toast.success('Mã OTP đã được gửi đến email của bạn!');
      setStep('otp');
    } catch (err) {
      if (isAxiosError(err)) {
        toast.error(err.response?.data?.message || 'Email không tồn tại trong hệ thống.');
      } else {
        toast.error('Không thể gửi OTP. Vui lòng thử lại.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await api.post('/auth/verify-otp', { email, otp });
      toast.success('Xác thực OTP thành công!');
      setStep('password');
    } catch (err) {
      if (isAxiosError(err)) {
        toast.error(err.response?.data?.message || 'Mã OTP không đúng hoặc đã hết hạn.');
      } else {
        toast.error('Xác thực thất bại. Vui lòng thử lại.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (newPassword !== confirmPassword) {
      toast.error('Mật khẩu xác nhận không khớp!');
      return;
    }

    if (newPassword.length < 6) {
      toast.error('Mật khẩu phải có ít nhất 6 ký tự!');
      return;
    }

    setIsSubmitting(true);
    try {
      await api.post('/auth/reset-password', { 
        email, 
        otp, 
        newPassword 
      });
      toast.success('Đặt lại mật khẩu thành công! Đang chuyển đến trang đăng nhập...');
      setTimeout(() => {
        window.location.href = '/login';
      }, 2000);
    } catch (err) {
      if (isAxiosError(err)) {
        toast.error(err.response?.data?.message || 'Không thể đặt lại mật khẩu.');
      } else {
        toast.error('Có lỗi xảy ra. Vui lòng thử lại.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-950 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="pb-4">
          <div className="flex items-center gap-2 mb-2">
            <Link href="/login">
              <Button variant="ghost" size="icon" className="h-8 w-8 cursor-pointer">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <CardTitle className="text-2xl">Lấy lại mật khẩu của bạn</CardTitle>
          </div>
          <CardDescription>
            {step === 'email' && 'Nhập email để nhận mã OTP'}
            {step === 'otp' && 'Nhập mã OTP đã được gửi đến email'}
            {step === 'password' && 'Tạo mật khẩu mới cho tài khoản'}
          </CardDescription>
        </CardHeader>

        {step === 'email' && (
          <form onSubmit={handleSendOTP} className='flex flex-col gap-3'>
            <CardContent className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="email" className="flex items-center gap-2 font-roboto-condensed-bold">
                  <Mail className="h-4 w-4" />
                  Email *
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="email@example.com"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isSubmitting}
                />
              </div>
            </CardContent>
            <CardFooter className="flex flex-col gap-2">
              <Button type="submit" className="w-full cursor-pointer border border-blue-600 bg-white text-blue-600 hover:bg-blue-600 hover:text-white" disabled={isSubmitting}>
                {isSubmitting ? 'Đang gửi...' : 'Gửi mã OTP'}
              </Button>
              <Link href="/login" className="text-sm text-center hover:underline w-full">
                Quay lại đăng nhập
              </Link>
            </CardFooter>
          </form>
        )}

        {step === 'otp' && (
          <form onSubmit={handleVerifyOTP} className='flex flex-col gap-2'>
            <CardContent className="space-y-4">
              <div className="p-3 bg-blue-50 rounded-md border border-blue-200">
                <p className="text-sm text-blue-800">
                  Mã OTP đã được gửi đến <strong>{email}</strong>
                </p>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="otp" className="flex items-center gap-2 font-roboto-condensed-bold">
                  <KeyRound className="h-4 w-4" />
                  Mã OTP
                </Label>
                <Input
                  id="otp"
                  type="text"
                  placeholder="Nhập 6 số"
                  required
                  maxLength={6}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                  disabled={isSubmitting}
                />
              </div>
            </CardContent>
            <CardFooter className="flex flex-col gap-2">
              <Button type="submit" className="w-full cursor-pointer border border-blue-600 bg-white text-blue-600 hover:bg-blue-600 hover:text-white" disabled={isSubmitting || otp.length !== 6}>
                {isSubmitting ? 'Đang xác thực...' : 'Xác thực OTP'}
              </Button>
              <Button 
                type="button" 
                variant="outline" 
                className="w-full cursor-pointer"
                onClick={() => setStep('email')}
                disabled={isSubmitting}
              >
                Thay đổi email
              </Button>
            </CardFooter>
          </form>
        )}

        {step === 'password' && (
          <form onSubmit={handleResetPassword} className='flex flex-col gap-4'>
            <CardContent className="space-y-4">
              <div className="p-3 bg-green-50 rounded-md border border-green-200">
                <p className="text-sm text-green-800">
                  ✓ Xác thực thành công! Tạo mật khẩu mới.
                </p>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="newPassword" className="flex items-center gap-2 font-roboto-condensed-bold">
                  <Lock className="h-4 w-4" />
                  Mật khẩu mới
                </Label>
                <Input
                  id="newPassword"
                  type="password"
                  placeholder="Ít nhất 6 ký tự"
                  required
                  minLength={6}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  disabled={isSubmitting}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="confirmPassword font-roboto-condensed-bold ">Xác nhận mật khẩu</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="Nhập lại mật khẩu"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  disabled={isSubmitting}
                />
              </div>
              {newPassword && confirmPassword && newPassword !== confirmPassword && (
                <p className="text-sm text-red-600">Mật khẩu không khớp!</p>
              )}
            </CardContent>
            <CardFooter>
              <Button 
                type="submit" 
                className="w-full cursor-pointer border border-blue-600 bg-white text-blue-600 hover:bg-blue-600 hover:text-white" 
                disabled={isSubmitting || newPassword !== confirmPassword || newPassword.length < 6}
              >
                {isSubmitting ? 'Đang đặt lại...' : 'Đặt lại mật khẩu'}
              </Button>
            </CardFooter>
          </form>
        )}
      </Card>
    </div>
  );
}
