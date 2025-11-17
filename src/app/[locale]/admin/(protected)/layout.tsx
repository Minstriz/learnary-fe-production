// // File: src/app/[locale]/admin/(protected)/layout.tsx

"use client";

import React from "react";
import { useRouter, useParams } from "next/navigation"; 
import { useAuth } from "@/app/context/AuthContext";
import { AppSidebar } from "@/components/features/app-sidebar";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger, 
} from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { AppBreadcrumb } from "@/components/features/app-breadcumb";

export default function ProtectedAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isLoggedIn, isLoading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const locale = params.locale || 'vi';

  React.useEffect(() => {
    if (isLoading) {
      return;
    }

    if (!isLoggedIn || user?.role !== "ADMIN") {
      router.push(`/${locale}/admin/login`); 
    }
  }, [isLoading, isLoggedIn, user, router, locale]);

  if (isLoading || !isLoggedIn || user?.role !== "ADMIN") {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <p>Đang xác thực quyền admin...</p>
      </div>
    );
  }

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 ...">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4" />
            <AppBreadcrumb />
          </div>
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  );
}