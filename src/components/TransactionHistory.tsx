"use client";

import React, { useEffect, useState } from 'react';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import axios from 'axios';
import api from "@/app/lib/axios";
import {  TransactionStatus, TransactionHistoryData, CourseInfo } from '@/type/transaction.type';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Spinner } from "@/components/ui/spinner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { ShoppingCartIcon, AcademicCapIcon, CreditCardIcon, CalendarIcon } from "@heroicons/react/24/outline";
import { useIsMobile } from "@/hooks/useIsMobile";
import Image from 'next/image';
import { toast } from 'sonner';

interface TransactionHistoryProps {
  userId: string;
}

export const TransactionHistory: React.FC<TransactionHistoryProps> = ({ userId }) => {
  const isMobile = useIsMobile();
  const [data, setData] = useState<TransactionHistoryData | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedCourse, setSelectedCourse] = useState<CourseInfo | null>(null);
  const [showCourseDialog, setShowCourseDialog] = useState(false);

  useEffect(() => {
    if (!userId) return;
    const fetchHistory = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await api.get(`/payment/learner-history/${userId}`);
        setData(response.data.data);
      } catch (err) {
        const errorMsg = axios.isAxiosError(err) ? (err.response?.data?.error || 'Đã có lỗi xảy ra'): 'Đã có lỗi xảy ra';
        setError(errorMsg);
        toast.error(errorMsg);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, [userId]);

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount);
  };

  const getStatusColor = (status: TransactionStatus): string => {
    switch (status) {
      case 'Success':
        return 'bg-green-100 text-green-800 hover:bg-green-200';
      case 'Pending':
        return 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200';
      case 'Cancel':
        return 'bg-red-100 text-red-800 hover:bg-red-200';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: TransactionStatus): string => {
    switch (status) {
      case 'Success':
        return 'Thành công';
      case 'Pending':
        return 'Đang chờ';
      case 'Cancel':
        return 'Đã hủy';
      default:
        return status;
    }
  };

  const handleCourseClick = (course: CourseInfo | null) => {
    if (course) {
      setSelectedCourse(course);
      setShowCourseDialog(true);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Spinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-800 font-roboto">❌ {error}</p>
      </div>
    );
  }
  if (!data) {
    return null;
  }
  return (
    <div className={`${isMobile ? 'p-4' : 'p-6'}`}>
      <div className={`grid ${isMobile ? 'grid-cols-2' : 'grid-cols-4'} gap-4 mb-6`}>
        <Card className="shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <ShoppingCartIcon className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-xs text-gray-600 font-roboto">Tổng giao dịch</p>
                <p className="text-xl font-bold text-gray-900 font-roboto">
                  {data.stats.totalTransactions}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <AcademicCapIcon className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-xs text-gray-600 font-roboto">Thành công</p>
                <p className="text-xl font-bold text-green-600 font-roboto">
                  {data.stats.successfulTransactions}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <CalendarIcon className="w-6 h-6 text-yellow-600" />
              </div>
              <div>
                <p className="text-xs text-gray-600 font-roboto">Đang chờ</p>
                <p className="text-xl font-bold text-yellow-600 font-roboto">
                  {data.stats.pendingTransactions}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <CreditCardIcon className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <p className="text-xs text-gray-600 font-roboto">Tổng chi tiêu</p>
                <p className={`${isMobile ? 'text-sm' : 'text-lg'} font-bold text-purple-600 font-roboto`}>
                  {formatCurrency(data.stats.totalSpent)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
          <h2 className="text-lg font-bold text-gray-900 font-rosario">
            Danh Sách Giao Dịch ({data.transactions.length})
          </h2>
        </div>

        {data.transactions.length === 0 ? (
          <div className="text-center py-12">
            <ShoppingCartIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 font-roboto">Bạn chưa có giao dịch nào</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {data.transactions.map((transaction) => (
              <div
                key={transaction.transaction_id}
                className="p-4 hover:bg-gray-50 transition cursor-pointer"
                onClick={() => transaction.type === 'course' && handleCourseClick(transaction.course)}
              >
                <div className={`flex ${isMobile ? 'flex-col' : 'flex-row'} items-start justify-between gap-4`}>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-3">
                      <Badge className={`${getStatusColor(transaction.status)} font-roboto`}>
                        {getStatusText(transaction.status)}
                      </Badge>

                      {transaction.type === 'combo' && (
                        <Badge className="bg-purple-100 text-purple-800 hover:bg-purple-200 font-roboto">
                          📦 Combo
                        </Badge>
                      )}
                    </div>

                    {transaction.type === 'course' && transaction.course ? (
                      <div className="flex items-start gap-4">
                        <div className="relative w-24 h-16 shrink-0 rounded overflow-hidden">
                          <Image
                            src={transaction.course.thumbnail}
                            alt={transaction.course.title}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-bold text-gray-900 mb-1 font-roboto hover:text-blue-600 transition">
                            {transaction.course.title}
                          </h3>
                          <p className="text-sm text-gray-600 font-roboto">
                            👨‍🏫 {transaction.course.instructor.fullName}
                          </p>
                        </div>
                      </div>
                    ) : (
                      <h3 className="font-bold text-gray-900 mb-1 font-roboto">
                        📦 {transaction.comboName}
                      </h3>
                    )}

                    <div className="mt-3 space-y-1 text-sm text-gray-600 font-roboto">
                      <p>
                        <span className="font-medium">Mã GD:</span>{' '}
                        <span className="font-mono text-xs bg-gray-100 px-2 py-1 rounded">
                          {transaction.payment_code}
                        </span>
                      </p>
                      <p>
                        <span className="font-medium">Thời gian:</span>{' '}
                        {format(new Date(transaction.createdAt), 'dd/MM/yyyy HH:mm', {
                          locale: vi,
                        })}
                      </p>
                    </div>
                  </div>

                  <div className={`${isMobile ? 'w-full text-left' : 'text-right'}`}>
                    <p className={`${isMobile ? 'text-xl' : 'text-2xl'} font-bold text-gray-900 font-roboto`}>
                      {formatCurrency(transaction.amount)}
                    </p>
                    <p className="text-sm text-gray-500 mt-1 font-roboto">
                      {transaction.payment_method.replace('_', ' ')}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <Dialog open={showCourseDialog} onOpenChange={setShowCourseDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="font-rosario-bold text-2xl">Chi tiết khóa học</DialogTitle>
            <DialogDescription className="font-roboto">
              Thông tin về khóa học bạn đã mua
            </DialogDescription>
          </DialogHeader>

          {selectedCourse && (
            <div className="space-y-4">
              <div className="relative w-full h-64 rounded-lg overflow-hidden">
                <Image
                  src={selectedCourse.thumbnail}
                  alt={selectedCourse.title}
                  fill
                  className="object-cover"
                />
              </div>

              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-2 font-rosario">
                  {selectedCourse.title}
                </h3>

                <div className="flex items-center gap-3 mb-4">
                  <div className="flex items-center gap-2">
                    {selectedCourse.instructor.avatar ? (
                      <div className="relative w-8 h-8 rounded-full overflow-hidden">
                        <Image
                          src={selectedCourse.instructor.avatar}
                          alt={selectedCourse.instructor.fullName}
                          fill
                          className="object-cover"
                        />
                      </div>
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center">
                        <span className="text-sm font-bold text-gray-600">
                          {selectedCourse.instructor.fullName.charAt(0)}
                        </span>
                      </div>
                    )}
                    <span className="text-sm text-gray-700 font-roboto">
                      {selectedCourse.instructor.fullName}
                    </span>
                  </div>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600 font-roboto mb-1">Giá khóa học</p>
                  <p className="text-2xl font-bold text-blue-600 font-roboto">
                    {formatCurrency(selectedCourse.price)}
                  </p>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};
