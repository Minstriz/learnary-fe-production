"use client";
import React from "react";
import { usePathname } from "next/navigation";
import Navbar from "./Navbar";

interface NavbarWrapperProps {
  children: React.ReactNode;
  locale: string;
}

export default function NavbarWrapper({ children, locale }: NavbarWrapperProps) {
  const pathname = usePathname();
  const routesWithoutNavbar = ['/login', '/register'];
  const pathWithoutLocale = pathname.replace(`/${locale}`, '') || '/';
  const shouldShowNavbar = !routesWithoutNavbar.includes(pathWithoutLocale);

  return (
    <div>
      {shouldShowNavbar && <Navbar />}
      {children}
    </div>
  );
}