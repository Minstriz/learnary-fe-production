"use client";

import { useAuth } from "@/app/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, Mail, ShieldAlert } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function EmailVerificationRequiredPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Nếu user chưa đăng nhập, redirect về login
    if (!isLoading && !user) {
      router.push("/login");
    }
    
    // Nếu user đã xác thực email, cho phép truy cập
    if (!isLoading && user && user.isActive === true) {
      router.push("/");
    }
  }, [user, isLoading, router]);

  const handleVerifyEmail = () => {
    router.push("/verify-email");
  };

  const handleLogout = () => {
    router.push("/login");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-purple-50 via-white to-blue-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-purple-50 via-white to-blue-50 p-4">
      <Card className="max-w-2xl w-full shadow-2xl border-2">
        <CardHeader className="text-center space-y-4 pb-6 bg-linear-to-br from-red-50 to-orange-50">
          <div className="flex justify-center">
            <div className="bg-red-100 p-4 rounded-full">
              <ShieldAlert className="w-12 h-12 text-red-600" />
            </div>
          </div>
          <CardTitle className="text-3xl font-bold text-gray-900">
            Yêu cầu xác thực email
          </CardTitle>
          <CardDescription className="text-base text-gray-600">
            Vui lòng xác thực email để tiếp tục sử dụng Learnary
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6 pt-6">
          <div className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded-r-lg">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5 shrink-0" />
              <div className="flex-1">
                <h3 className="font-semibold text-amber-900 mb-1">
                  Tài khoản chưa được xác thực
                </h3>
                <p className="text-sm text-amber-800">
                  Để bảo vệ tài khoản của bạn và trải nghiệm đầy đủ các tính năng của Learnary, 
                  bạn cần xác thực địa chỉ email của mình.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
            <div className="flex items-start gap-3">
              <Mail className="w-5 h-5 text-blue-600 mt-0.5 shrink-0" />
              <div className="flex-1">
                <h4 className="font-semibold text-blue-900 mb-2">
                  Cách xác thực email:
                </h4>
                <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
                  <li>Nhấn nút Xác thực email ngay bên dưới</li>
                  <li>Kiểm tra hộp thư email của bạn ({user?.email})</li>
                  <li>Nhập mã OTP được gửi đến email</li>
                  <li>Hoàn tất và bắt đầu học tập!</li>
                </ol>
              </div>
            </div>
          </div>

          <div className="space-y-3 pt-4">
            <Button
              onClick={handleVerifyEmail}
              className="w-full bg-linear-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white py-6 text-lg font-semibold"
            >
              <Mail className="w-5 h-5 mr-2" />
              Xác thực email ngay
            </Button>

            <Button
              onClick={handleLogout}
              variant="outline"
              className="w-full"
            >
              Đăng xuất
            </Button>
          </div>

          <div className="text-center text-sm text-gray-500 pt-4 border-t">
            <p>
              Không nhận được email? Kiểm tra trong thư mục spam hoặc{" "}
              <button 
                onClick={handleVerifyEmail}
                className="text-purple-600 hover:text-purple-700 font-semibold underline"
              >
                gửi lại mã
              </button>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
