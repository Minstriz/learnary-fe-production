"use client";

import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

export function EmailVerificationBanner() {
  const router = useRouter();

  const handleVerifyClick = () => {
    router.push("/verify-email");
  };

  return (
    <Alert variant="destructive" className="rounded-none border-x-0 border-t-0">
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>Email chưa được xác thực</AlertTitle>
      <AlertDescription className="flex items-center justify-between">
        <span>
          Vui lòng xác thực email của bạn để có thể truy cập đầy đủ các tính năng.
        </span>
        <Button
          onClick={handleVerifyClick}
          variant="outline"
          size="sm"
          className="ml-4 bg-white text-destructive hover:bg-gray-50"
        >
          Xác thực ngay
        </Button>
      </AlertDescription>
    </Alert>
  );
}
