"use client";
import NavbarWrapper from "@/components/NavbarWrapper";
import { useParams, usePathname, useRouter } from "next/navigation";
import Footer from "@/components/Footer";
import { useAuth } from "@/app/context/AuthContext";
import { useEffect } from "react";

// Layout này CHỈ áp dụng cho các trang user (FE)
export default function FrontendLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const params = useParams();
  const pathname = usePathname();
  const router = useRouter();
  const { user, isLoading } = useAuth();
  const locale = params.locale as string; 

  // Danh sách các trang được phép truy cập khi chưa xác thực email
  const allowedPaths = [
    '/login',
    '/register', 
    '/verify-email',
    '/email-verification-required'
  ];

  useEffect(() => {
    if (isLoading) return;
    if (user && user.isActive === false) {
      const isAllowedPath = allowedPaths.some(path => pathname?.includes(path));
      if (!isAllowedPath) {
        router.push(`/${locale}/email-verification-required`);
      }
    }
  }, [user, isLoading, pathname, router, locale]);

  // Hiển thị loading khi đang kiểm tra auth
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex-1 flex flex-col">
        <NavbarWrapper locale={locale}>
          <main className="flex-1">
            {children}
          </main>
        </NavbarWrapper>
      </div>
      <Footer />
    </div>
  );
}