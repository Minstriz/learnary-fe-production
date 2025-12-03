"use client";

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { XCircle, Home, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import api from '@/app/lib/axios';
import { isAxiosError } from 'axios';
import { toast } from 'sonner';

export default function PaymentCancelPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [isProcessing, setIsProcessing] = useState(true);

    useEffect(() => {
        const handleCancelPayment = async () => {
            const orderCode = searchParams.get('orderCode');
            
            if (orderCode) {
                try {
                    // Gọi API backend để cập nhật trạng thái đơn hàng
                    await api.post('/payment/cancel', { orderCode });
                    console.log('Payment cancelled:', orderCode);
                } catch (err) {
                    console.error('Error cancelling payment:', err);
                    if (isAxiosError(err)) {
                        const errorMsg = err.response?.data?.message || 'Không thể hủy giao dịch';
                        toast.error(errorMsg);
                    }
                }
            }
            
            // Xóa thông tin payment đã lưu
            sessionStorage.removeItem('payment_course_slug');
            setIsProcessing(false);

            // Tự động chuyển về trang chủ sau 5 giây
            const timer = setTimeout(() => {
                router.push('/');
            }, 5000);

            return () => clearTimeout(timer);
        };

        handleCancelPayment();
    }, [searchParams, router]);

    const handleGoHome = () => {
        router.push('/');
    };

    const handleGoBack = () => {
        const courseSlug = sessionStorage.getItem('payment_course_slug');
        sessionStorage.removeItem('payment_course_slug');
        
        if (courseSlug) {
            router.push(`/course-detail/${courseSlug}`);
        } else {
            router.back();
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
            <Card className="w-full max-w-md">
                <CardHeader className="text-center space-y-4">
                    <div className="flex justify-center">
                        <XCircle className="h-16 w-16 text-red-500" />
                    </div>
                    <CardTitle className="text-2xl font-bold text-red-600">
                        {isProcessing ? 'Đang xử lý...' : 'Thanh toán đã bị hủy'}
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="text-center space-y-2">
                        <p className="text-gray-600">
                            Giao dịch của bạn đã bị hủy. Không có khoản tiền nào bị trừ.
                        </p>
                        {searchParams.get('orderCode') && (
                            <p className="text-sm text-gray-500">
                                Mã đơn hàng: <span className="font-mono font-semibold">{searchParams.get('orderCode')}</span>
                            </p>
                        )}
                    </div>

                    <div className="space-y-3">
                        <Button 
                            onClick={handleGoBack} 
                            className="w-full"
                            variant="default"
                        >
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Quay lại khóa học
                        </Button>
                        
                        <Button 
                            variant="outline" 
                            onClick={handleGoHome}
                            className="w-full"
                        >
                            <Home className="mr-2 h-4 w-4" />
                            Về trang chủ
                        </Button>
                    </div>

                    <p className="text-center text-sm text-gray-500">
                        Tự động chuyển về trang chủ sau 5 giây...
                    </p>
                </CardContent>
            </Card>
        </div>
    );
}
