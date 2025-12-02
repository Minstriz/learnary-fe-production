"use client"
import {
    InputOTP,
    InputOTPGroup,
    InputOTPSlot,
} from "@/components/ui/input-otp"
import React, { useCallback, useEffect, useState, useRef } from 'react';
import { REGEXP_ONLY_DIGITS } from "input-otp"
import { toast } from "sonner";
import api from "@/app/lib/axios";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/app/context/AuthContext";

export default function VerifyEmailPage() {
    const [otp, setOtp] = useState("")
    const [isLoading, setIsLoading] = useState(false)
    const [countDown, setCountDown] = useState(60)
    const [canResend, setCanResend] = useState(false)
    const hasSentOTP = useRef(false)
    const router = useRouter();
    const { user } = useAuth();
    const userId = user?.id;
    
    useEffect(() => {
        if (hasSentOTP.current || !userId) return;
        const sendInitialOTP = async () => {
            try {
                hasSentOTP.current = true; 
                await api.post(`/account-securities/resend-otp/${userId}`);
                toast.success("Mã xác thực đã được gửi đến email của bạn");
            } catch (error) {
                console.log(error);
                toast.error( "Lỗi khi gửi mã xác thực");
                hasSentOTP.current = false;
            }
        };
        
        sendInitialOTP();
    }, [userId]); 

    const handleVerify = useCallback(async () => {
        if (otp.length !== 6) return;
        if (!userId) {
            toast.error("Vui lòng đăng nhập trước khi xác thực email");
            router.push('/login');
            return;
        }
        setIsLoading(true)
        try {
            const res = await api.post(`/account-securities/verify-email/${userId}`, {
                otp,
            })
            if (res.data.success) { 
                toast.success("Xác thực email thành công!")
                setTimeout(() => {
                    router.push('/profile')
                }, 1500)
            }
        } catch (error) {
            console.log(error);
            toast.error( "Mã OTP không hợp lệ hoặc đã hết hạn");
            setOtp("") 
        } finally {
            setIsLoading(false)
        }
    }, [otp, userId, router])

    useEffect(() => {
        if (countDown > 0) {
            const timer = setTimeout(() => setCountDown(countDown - 1), 1000)
            return () => clearTimeout(timer)
        } else {
            setCanResend(true)
        }
    }, [countDown])

    useEffect(() => {
        if (otp.length === 6) {
            handleVerify();
        }
    }, [otp, handleVerify])

    const handleResend = async () => {
        if (!userId) return;
        setIsLoading(true)
        try {
            await api.post(`/account-securities/resend-otp/${userId}`)
            toast.info("Đã gửi lại mã, vui lòng xem hòm thư của bạn")
            setCountDown(60)
            setCanResend(false)
            setOtp("")
        } catch (error) {
            console.log(error)
            toast.error("Lỗi khi gửi lại OTP!")
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-50">
            <div className="w-full max-w-md space-y-8 rounded-lg bg-white p-8 shadow-lg">
                <div className="text-center">
                    <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-100">
                        <svg className="h-8 w-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900">Xác thực Email</h2>
                    <p className="mt-2 text-sm text-gray-600">
                        Chúng tôi đã gửi mã xác thực 6 chữ số đến email của bạn
                    </p>
                </div>

                <div className="flex justify-center">
                    <InputOTP maxLength={6} pattern={REGEXP_ONLY_DIGITS} value={otp} onChange={setOtp} disabled={isLoading} >
                        <InputOTPGroup>
                            <InputOTPSlot index={0} />
                            <InputOTPSlot index={1} />
                            <InputOTPSlot index={2} />
                            <InputOTPSlot index={3} />
                            <InputOTPSlot index={4} />
                            <InputOTPSlot index={5} />
                        </InputOTPGroup>
                    </InputOTP>
                </div>

                <Button onClick={handleVerify} disabled={otp.length !== 6 || isLoading} className="w-full">
                    {isLoading ? "Đang xác thực..." : "Xác thực"}
                </Button>

                <div className="text-center text-sm">
                    {!canResend ? (
                        <p className="text-gray-600">
                            Gửi lại mã sau <span className="font-semibold text-blue-600">{countDown}s</span>
                        </p>
                    ) : (
                        <button onClick={handleResend} disabled={isLoading} className="text-blue-600 hover:text-blue-800 font-medium disabled:opacity-50">
                            Gửi lại mã xác thực
                        </button>
                    )}
                </div>

                <div className="text-center">
                    <p className="text-xs text-gray-500">
                        Không nhận được email?{" "}
                        <Link href="/support" className="text-blue-600 hover:underline">
                            Liên hệ hỗ trợ
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}