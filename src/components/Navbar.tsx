"use client";

import Link from "next/link";
import React, { useState } from "react";
import LanguageSwitcher from "./LanguageSwitcher";
import {
  Bars3Icon,
  XMarkIcon,
  UserIcon,
  ArrowRightOnRectangleIcon,
} from "@heroicons/react/24/outline";
import { toast } from "sonner"
import { useTranslations } from "next-intl";
import { useIsMobile } from "@/hooks/useIsMobile";
import { useAuth } from "@/app/context/AuthContext";
import Image from 'next/image'
import { useRouter } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import {
  Heart,
  MessageCircle,
} from "lucide-react";


export const NavbarLinks = (userRole?: string) => {
  const t = useTranslations("Navbar");

  const baseLinks = [
    {
      name: t("home"),
      href: "/",
    },
  ];
  const learnerLink = userRole ? [
    {
      name: t("learn-are"),
      href: "/learn-area"
    }
  ] : [];

  const instructorLink = userRole === "INSTRUCTOR" ? [
    {
      name: t("instructor"),
      href: "/instructor"
    }
  ] : [];
  const adminLink = userRole === "ADMIN" ? [
    {
      name: t("admin"),
      href: "/admin-side"
    }
  ] : [];
  const becomeLecturerLink = (!userRole || (userRole !== "INSTRUCTOR" && userRole !== "ADMIN")) ? [
    {
      name: t("become-lecturer"),
      href: "/become-lecturer",
    }
  ] : [];

  return [...baseLinks, ...learnerLink, ...instructorLink, ...adminLink, ...becomeLecturerLink];
};

function Navbar() {
  const router = useRouter();
  const isMobile = useIsMobile();
  const [isOpen, setIsOpen] = useState(false);
  const { isLoggedIn, user, logout, isLoading } = useAuth();
  const links = NavbarLinks(user?.role);
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
            {user.avatar ? (
              <div className="relative inline-flex h-fit w-fit rounded-full overflow-hidden group">
                <div
                  className="
                    pointer-events-none
                    absolute inset-0
                    before:content-['']
                    before:absolute
                    before:inset-0
                    before:bg-[linear-gradient(120deg,transparent_0%,rgba(255,255,255,0.6)_50%,transparent_100%)]
                    before:bg-size-[200%_200%]
                    before:bg-position-[-100%_0]
                    before:transition-[background-position]
                    before:duration-800
                    group-hover:before:bg-position-[120%_0]
                  "
                />
                <div className="w-fit h-fit hover:bg-yellow-700 p-2 rounded-full transition duration-200 ease-in-out">
                  <Avatar>
                    <AvatarImage src={`${user.avatar}`} alt="Avatar User" />
                    <AvatarFallback>User Avatar</AvatarFallback>
                  </Avatar>
                </div>
              </div>
            ) : (
              <div className="w-fit h-fit hover:bg-pink-700 p-2 rounded-full group transition duration-200 ease-in-out">
                <UserIcon className="h-6 w-6 cursor-pointer group-hover:text-white transition duration-200 ease-in-out" />
              </div>
            )}
          </Link >
          <Link href="/chat" title={"Tin nhắn của bạn"}>
            <MessageCircle className="h-6 w-6 cursor-pointer hover:text-pink-600"></MessageCircle>
          </Link>
          <Link href="/my-favorite" title={"Giỏ hàng"}>
            <Heart className="h-6 w-6 cursor-pointer hover:text-pink-600"></Heart>
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