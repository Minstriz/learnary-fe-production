"use client";

import { Lock, Snowflake } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface AccountStatusBannerProps {
  status: 'Locked' | 'Freezed';
  reason?: string;
}

export default function AccountStatusBanner({ status, reason }: AccountStatusBannerProps) {
  if (status === 'Locked') {
    return (
      <Alert variant="destructive" className="rounded-none border-x-0 border-t-0">
        <Lock className="h-4 w-4" />
        <AlertTitle>Tài khoản của bạn đã bị khóa</AlertTitle>
        <AlertDescription>
          {reason && <span className="font-medium">Lý do: {reason}. </span>}
          Nếu có thắc mắc, vui lòng liên hệ với quản trị viên hệ thống qua email{" "}
          <a href="mailto:learnary.contact@gmail.com" className="underline font-medium">
            learnary.contact@gmail.com
          </a>
        </AlertDescription>
      </Alert>
    );
  }

  if (status === 'Freezed') {
    return (
      <Alert className="rounded-none border-x-0 border-t-0 bg-orange-50 border-orange-200">
        <Snowflake className="h-4 w-4 text-orange-600" />
        <AlertTitle className="text-orange-800">Tài khoản của bạn đang bị đóng băng</AlertTitle>
        <AlertDescription className="text-orange-700">
          {reason && <span className="font-medium">Lý do: {reason}. </span>}
          Bạn chỉ có thể truy cập các khóa học đã mua trước đó. Nếu có thắc mắc, vui lòng liên hệ với quản trị viên qua email{" "}
          <a href="mailto:learnary.contact@gmail.com" className="underline font-medium">
            learnary.contact@gmail.com
          </a>
        </AlertDescription>
      </Alert>
    );
  }

  return null;
}
