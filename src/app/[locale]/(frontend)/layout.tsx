"use client";
import NavbarWrapper from "@/components/NavbarWrapper";
import { useParams } from "next/navigation";
import Footer from "@/components/Footer";

// Layout này CHỈ áp dụng cho các trang user (FE)
export default function FrontendLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const params = useParams();
  // Lấy locale từ params để truyền cho NavbarWrapper
  const locale = params.locale as string; 

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <NavbarWrapper locale={locale}>
        <main className="flex-1">
          {children}
        </main>
      </NavbarWrapper>
      <Footer />
    </div>
  );
}