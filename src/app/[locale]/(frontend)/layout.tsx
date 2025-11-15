"use client";

import NavbarWrapper from "@/components/NavbarWrapper";
import { useParams } from "next/navigation";

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
    // NavbarWrapper chỉ bọc các trang con của (frontend)
    <NavbarWrapper locale={locale}>
      {children}
    </NavbarWrapper>
  );
}