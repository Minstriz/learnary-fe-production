"use client";

import React, { useEffect } from 'react';
import { useRouter, useParams, useSearchParams } from 'next/navigation';
import { useAuth } from '@/app/context/AuthContext';
import LoginForm from '@/components/LoginForm';

export default function LoginPage() {
    const { isLoggedIn, isLoading } = useAuth(); 
    const router = useRouter();
    const params = useParams();
    const searchParams = useSearchParams();
    const locale = params.locale || 'vi';
    const callbackUrl = searchParams.get('callbackUrl') || `/${locale}`;

    useEffect(() => {
        if (!isLoading && isLoggedIn) {
            router.push(callbackUrl);
        }
    }, [isLoggedIn, isLoading, router, callbackUrl]);


    if (isLoading || isLoggedIn) {
    return (
        <div className="min-h-screen flex items-center justify-center">
        <p className='text-lg font-medium'>Đang tải...</p>
        </div>
    );
    }

    return (
        <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10 bg-gray-100 dark:bg-gray-950">
            <div className="w-full max-w-sm">
            <LoginForm />
            </div>
        </div>
    );
}