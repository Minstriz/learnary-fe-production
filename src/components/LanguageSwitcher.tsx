"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useLocale } from "next-intl";
import Image from "next/image";

export default function LanguageSwitcherSlide() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  const [isVi, setIsVi] = useState(locale === "vi");
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    setIsVi(locale === "vi");
  }, [locale]);

  const switchTo = (nextLocale: "vi" | "en") => {
    const segments = pathname.split("/");
    segments[1] = nextLocale;
    const newPathname = segments.join("/");
    router.replace(newPathname);
  };

  const toggleLang = () => {
    if (isAnimating) return;

    setIsAnimating(true);
    setIsVi((prev) => !prev);

    setTimeout(() => {
      switchTo(!isVi ? "vi" : "en");
      setIsAnimating(false);
    }, 500);
  };

  const containerWidth = 144; // px (w-36)
  const flagWidth = 24; // px (w-6)
  const padding = 16; // px (px-4)

  return (
    <div
      onClick={toggleLang}
      className={`relative flex items-center w-40 h-12 border-3 ${
        isVi ? "border-[#A62D12]" : "border-[#0F1697]"
      } rounded-full cursor-pointer overflow-hidden px-4`}
    >
      {/* Cờ */}
      <div
        className={`absolute top-1/2 -translate-y-1/2 text-xl rounded-full ${
          isVi
            ? "bg-[#972727] border-[1.5px] border-[#FFAFAF] shadow-lg shadow-[#E2040440]"
            : "bg-[#13347B] border-[1.5px] border-[#8D98FC] shadow-lg shadow-[#61FD6E40]"
        } transition-transform duration-500 ease-in-out`}
        style={{
          left: padding,
          transform: isVi
            ? "translateX(-8px)"
            : `translateX(${containerWidth - flagWidth - padding * 2 + 10}px)`,
        }}
      >
        {isVi ? (
          <Image
            src={"/images/vietnameseIcon.png"}
            height={30}
            width={30}
            alt="Vietnamese Flag"
          />
        ) : (
          <Image
            src={"/images/englishIcon.png"}
            height={30}
            width={30}
            alt="English Flag"
          />
        )}
      </div>

      {/* Chữ */}
      <div
        className="absolute top-1/2 -translate-y-1/2 text-sm font-medium transition-transform duration-500 ease-in-out whitespace-nowrap"
        style={{
          left: isVi ? padding + flagWidth : padding + flagWidth - 20,
          transform: isVi ? "translateX(20px)" : "translateX(0)",
        }}
      >
        {isVi ? (
          <div className="flex items-center gap-2 font-roboto-condensed-bold">
            <Image
              src={"/images/vietnam-flag.png"}
              height={15}
              width={15}
              alt="Vietnamese Flag"
            />
            Tiếng Việt
          </div>
        ) : (
          <div className="flex items-center gap-2 font-roboto-condensed-bold">
            <Image
              src={"/images/english-flag.png"}
              height={15}
              width={15}
              alt="English Flag"
            />
            English
          </div>
        )}
      </div>
    </div>
  );
}
