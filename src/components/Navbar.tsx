"use client";

import Link from "next/link";
import React, { useState } from "react";
import LanguageSwitcher from "./LanguageSwitcher";
import {
  Bars3Icon,
  XMarkIcon,
  ShoppingBagIcon,
  UserIcon,
  ArrowRightOnRectangleIcon,
} from "@heroicons/react/24/outline";
import { toast } from "sonner"
import { useTranslations } from "next-intl";
import { useIsMobile } from "@/hooks/useIsMobile";
import { useAuth } from "@/app/context/AuthContext";
import Image from 'next/image'
import { useRouter } from "next/navigation";
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
      name: t("instructor"),
      href: "/become-lecturer",
    },
    {
      name: t("detail"),
      href: "/course-learn"
    }
  ];
};

function Navbar() {
  const router = useRouter();
  const isMobile = useIsMobile();
  const links = NavbarLinks();
  const [isOpen, setIsOpen] = useState(false);
  const { isLoggedIn, user, logout, isLoading } = useAuth();
  const t = useTranslations("Navbar");
  async function handleLogout(): Promise<void> {
    try {
       await logout()
      router.push("/")
    } catch (error) {
      console.error("Đã xảy ra lỗi:", error)
      toast.error("Lỗi khi đăng xuất, vui lòng thử lại sau!")
      throw new Error("Không thể đăng xuất do có lỗi!")
    }
  }
  const renderAuthLinks = () => {
    if (isLoading) {
      return <div className="h-6 w-24 animate-pulse rounded bg-gray-200" />;
    }
    if (isLoggedIn && user) {
      return (
        <>
          <Link href="/profile" title={user.fullName}>
            <div className="w-fit h-fit hover:bg-gray-900 p-2 rounded-full group transition duration-200 ease-in-out">
              <UserIcon className="h-6 w-6 cursor-pointer group-hover:text-white transition duration-200 ease-in-out" />
            </div>
          </Link>
          <Link href="/cart" title={"Giỏ hàng"}>
            <ShoppingBagIcon className="h-6 w-6 cursor-pointer " />
          </Link>
          <Link href="/logout" onClick={handleLogout} title={t("logout")}>
            <ArrowRightOnRectangleIcon className="h-6 w-6 cursor-pointer hover:text-red-600" />
          </Link>
          <Link href="/changeLanguage" title={"Đổi ngôn ngữ"}>

          </Link>
          <LanguageSwitcher />
        </>
      );
    }

    return (
      <>
        <Link href="/login" title={t("login")} className="hover:bg-gray-200 rounded">
          <div className="w-fit h-fit hover:bg-gray-200 p-1 rounded">
            <UserIcon className="h-6 w-6 cursor-pointer hover:text-blue-60" />
          </div>
        </Link>
        <LanguageSwitcher />
      </>
    );
  };

  return (
    <nav className="w-full px-4 md:px-10 bg-white text-black sticky top-0 z-1000">
      <div className="container mx-auto flex items-center justify-between">
        <div className="flex justify-center h-full w-fit">
          <Link href={'/'}><Image width={120} height={100} alt='logo' src={"/Logo/Logo-Black-NoBG.svg"} /></Link>
        </div>
        {!isMobile && (
          <>
            <ul className="flex space-x-1 text-md ">
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

            <div className="flex items-center space-x-6">
              {renderAuthLinks()}
            </div>
          </>
        )}


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

      {isMobile && (
        <div
          className={`
            mt-4 px-4 space-y-4
            transition-all duration-300 ease-in-out
            ${isOpen ? 'opacity-100 scale-100 max-h-[500px]' : 'opacity-0 scale-95 max-h-0 overflow-hidden'}
          `}
          style={{ transitionProperty: 'opacity, transform, max-height' }}
        >

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

          <div className="flex items-center space-x-6">
            {renderAuthLinks()}
          </div>

          <div>

          </div>
        </div>
      )}
    </nav>
  );
}

export default Navbar;