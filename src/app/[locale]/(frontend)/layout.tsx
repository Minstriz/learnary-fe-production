"use client";
import NavbarWrapper from "@/components/NavbarWrapper";
import { useParams, usePathname, useRouter } from "next/navigation";
import Footer from "@/components/Footer";
import { useAuth } from "@/app/context/AuthContext";
import { useEffect, useMemo } from "react";
import { useAccountStatus } from "@/hooks/useAccountStatus";
import AccountStatusBanner from "@/components/AccountStatusBanner";
import AccountLockedDialog from "@/components/AccountLockedDialog";

export default function FrontendLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const params = useParams();
  const pathname = usePathname();
  const router = useRouter();
  const { user, isLoading } = useAuth();
  const { accountStatus, isLoading: isLoadingAccountStatus, handleLogout } = useAccountStatus();
  const locale = params.locale as string; 

  // Danh sách các trang được phép truy cập khi chưa xác thực email
  const allowedPaths = useMemo(() => [
    '/login',
    '/register', 
    '/verify-email',
    '/email-verification-required'
  ], []);

  useEffect(() => {
    if (isLoading || isLoadingAccountStatus) return;
    if (accountStatus?.status === 'Locked') {
      return;
    }
    // Tài khoản bị Freezed (email chưa xác thực)
    if (accountStatus?.status === 'Freezed' || (user && user.isActive === false)) {
      const isAllowedPath = allowedPaths.some(path => pathname?.includes(path));
      if (isAllowedPath) {
        return;
      }
      router.push(`/${locale}/email-verification-required`);
    }
  }, [user, isLoading, isLoadingAccountStatus, accountStatus, pathname, router, locale, allowedPaths]);

  if (isLoading || isLoadingAccountStatus) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      {accountStatus?.status === 'Locked' && (
        <AccountLockedDialog
          open={true}
          reason={accountStatus.account_noted}
          onLogout={handleLogout}
        />
      )}
      
      <div className="flex-1 flex flex-col">
        <NavbarWrapper locale={locale}>
          {accountStatus && (accountStatus.status === 'Locked' || accountStatus.status === 'Freezed') && (
            <AccountStatusBanner 
              status={accountStatus.status} 
              reason={accountStatus.account_noted} 
            />
          )}
          <main className="flex-1">
            {children}
          </main>
        </NavbarWrapper>
      </div>
      <Footer />
    </div>
  );
}