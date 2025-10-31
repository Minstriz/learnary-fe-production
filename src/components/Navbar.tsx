"use client";

import Link from "next/link";
import React, { useState } from "react";
import LanguageSwitcher from "./LanguageSwitcher";
import {
  Bars3Icon,
  XMarkIcon,
  MagnifyingGlassIcon,
  ShoppingBagIcon,
  UserIcon,
  ArrowRightOnRectangleIcon, 
} from "@heroicons/react/24/outline";
import { useTranslations } from "next-intl";
import { useIsMobile } from "@/hooks/useIsMobile";
import { useAuth } from "@/app/context/AuthContext"; 

export const NavbarLinks = () => {
  const t = useTranslations("Navbar");

  return [
    {
      name: t("home"),
      href: "/",
    },
    {
      name: t("explore"),
      href: "/about",
    },
    {
      name: t("teach"),
      href: "/contact",
    },
  ];
};

function Navbar() {
  const isMobile = useIsMobile();
  const links = NavbarLinks();
  const [isOpen, setIsOpen] = useState(false);

  // Lấy trạng thái đăng nhập từ Context
  const { isLoggedIn, user, logout, isLoading } = useAuth();
  const t = useTranslations("Navbar"); 

  /**
   */
  const renderAuthLinks = () => {
    if (isLoading) {
      return <div className="h-6 w-24 animate-pulse rounded bg-gray-200" />;
    }

    // Đã đăng nhập
    if (isLoggedIn && user) {
      return (
        <>
          {/* Link đến Profile (dùng icon User) */}
          <Link href="/profile" title={user.fullName}>
            <UserIcon className="h-6 w-6 cursor-pointer hover:text-blue-600" />
          </Link>
          {/* Nút Đăng xuất */}
          <button onClick={logout} title={t("logout")}>
            <ArrowRightOnRectangleIcon className="h-6 w-6 cursor-pointer hover:text-red-600" />
          </button>
        </>
      );
    }

    return (
      <>
        {/* Link đến trang Đăng nhập  */}
        <Link href="/login" title={t("login")}>
          <UserIcon className="h-6 w-6 cursor-pointer hover:text-blue-600" />
        </Link>
      </>
    );
  };

  return (
    <nav className="w-full px-4 md:px-10 py-2 bg-white text-black shadow-md">
      <div className="container mx-auto flex items-center justify-between">
        {/* Logo */}
        <h1 className="text-3xl font-rockwell">Learnary</h1>

        {/* --- NỘI DUNG DESKTOP --- */}
        {!isMobile && (
          <>
            {/* Links (Home, Explore...) */}
            <ul className="flex space-x-9 text-md ">
              {links.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="font-ruda transition-all hover:font-ruda-bold hover:text-lg hover:bg-gray-200 rounded-full px-4 py-4"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>

            {/* Icons (Search, Auth, Cart...) */}
            <div className="flex items-center space-x-6">
              <MagnifyingGlassIcon className="h-6 w-6 cursor-pointer" />
              
              {/* GỌI HÀM RENDER AUTH (cho Desktop) */}
              {renderAuthLinks()}
              
              <ShoppingBagIcon className="h-6 w-6 cursor-pointer" />
              <LanguageSwitcher />
            </div>
          </>
        )}

        {/* Mobile Menu Toggle */}
        {isMobile && (
          <button onClick={() => setIsOpen(!isOpen)}>
            {isOpen ? (
              <XMarkIcon className="h-6 w-6" />
            ) : (
              <Bars3Icon className="h-6 w-6" />
            )}
          </button>
        )}
      </div>

      {/* --- NỘI DUNG MOBILE --- */}
      {isMobile && (
        <div
          className={`
            mt-4 px-4 space-y-4
            transition-all duration-300 ease-in-out
            ${isOpen ? 'opacity-100 scale-100 max-h-[500px]' : 'opacity-0 scale-95 max-h-0 overflow-hidden'}
          `}
          style={{ transitionProperty: 'opacity, transform, max-height' }}
        >
          {/* Links (Mobile) */}
          <ul className="space-y-2 text-md font-ruda">
            {links.map((link) => (
              <li key={link.name}>
                <Link
                  href={link.href}
                  className="block hover:text-gray-500 transition-colors"
                  onClick={() => setIsOpen(false)}
                >
                  {link.name}
                </Link>
              </li>
            ))}
          </ul>

          {/* Icons (Mobile) */}
          <div className="flex items-center space-x-6">
            <MagnifyingGlassIcon className="h-6 w-6 cursor-pointer" />
            
            {/* GỌI HÀM RENDER AUTH (cho Mobile) */}
            {renderAuthLinks()}

            <ShoppingBagIcon className="h-6 w-6 cursor-pointer" />
          </div>

          {/* Language Switcher (Mobile) */}
          <div>
            <LanguageSwitcher />
          </div>
        </div>
      )}
    </nav>
  );
}

export default Navbar;