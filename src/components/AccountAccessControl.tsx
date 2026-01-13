"use client";

import { useAccountStatus } from "@/hooks/useAccountStatus";
import { toast } from "sonner";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

interface AccountAccessControlProps {
  children: React.ReactNode;
  requiredStatus?: 'Active' | 'Active_Or_Freezed';
  redirectOnRestricted?: string;
  showToast?: boolean;
}

export default function AccountAccessControl({
  children,
  requiredStatus = 'Active',
  redirectOnRestricted,
  showToast = true,
}: AccountAccessControlProps) {
  const { accountStatus, isLoading } = useAccountStatus();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;
    if (!accountStatus) return;
    const isRestricted = requiredStatus === 'Active' ? accountStatus.status !== 'Active' : accountStatus.status === 'Locked';
    if (isRestricted) {
      if (showToast) {
        if (accountStatus.status === 'Locked') {
          toast.error('Tài khoản của bạn đã bị khóa. Vui lòng liên hệ quản trị viên.');
        } else if (accountStatus.status === 'Freezed') {
          toast.error('Tài khoản của bạn đang bị đóng băng. Chức năng này không khả dụng.');
        }
      }
      if (redirectOnRestricted) {
        router.push(redirectOnRestricted);
      }
    }
  }, [accountStatus, isLoading, requiredStatus, redirectOnRestricted, showToast, router]);
  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
      </div>
    );
  }
  if (!accountStatus) return <>{children}</>;
  const isRestricted = requiredStatus === 'Active' ? accountStatus.status !== 'Active' : accountStatus.status === 'Locked';
  if (isRestricted && redirectOnRestricted) {
    return null;
  }
  return <>{children}</>;
}
