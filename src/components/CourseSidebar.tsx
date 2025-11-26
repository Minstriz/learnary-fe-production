"use client";
import React from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { PlayCircle, FileText, Award, Infinity, Smartphone, Download } from 'lucide-react';
import { useTranslations } from 'next-intl';

interface CourseSidebarProps {
  thumbnail?: string | null;
  price: number;
  original_price?: number;
  sale_off?: number;
  includes: Array<{
    icon: string;
    text: string;
  }>;
}

export default function CourseSidebar({ thumbnail, price, original_price, sale_off, includes }: CourseSidebarProps) {
  const t = useTranslations("Course-Detail-Sidebar");
  
  const getIcon = (iconName: string) => {
    const icons: { [key: string]: React.ReactNode } = {
      PlayCircle: <PlayCircle className="w-5 h-5" />,
      FileText: <FileText className="w-5 h-5" />,
      Award: <Award className="w-5 h-5" />,
      Infinity: <Infinity className="w-5 h-5" />,
      Smartphone: <Smartphone className="w-5 h-5" />,
      Download: <Download className="w-5 h-5" />,
    };
    return icons[iconName] || <PlayCircle className="w-5 h-5" />;
  };

  const formatPrice = (priceValue: number) => {
    return new Intl.NumberFormat('vi-VN').format(priceValue) + ' ₫';
  };

  const hasThumbnail = thumbnail && thumbnail.trim() !== "";
  return (
    <div className="sticky top-4 border border-gray-200 bg-white shadow-lg">
      <div className="relative aspect-video w-full overflow-hidden bg-gray-100">
        {hasThumbnail ? (
          <Image
            src={thumbnail as string}
            alt="Course thumbnail"
            fill
            className="object-cover"
          />
        ) : (
          <div className="flex items-center justify-center h-full w-full text-gray-500">
            <div className="text-center">
              <div className="text-3xl font-bold">No Image</div>
            </div>
          </div>
        )}
      </div>

      <div className="p-6">
        <div className="mb-4">
          <div className="flex items-baseline gap-3">
            <span className="font-roboto-condensed-bold text-3xl">{formatPrice(price)}</span>
            {original_price && (
              <div className='flex gap-2'>
                <span className="font-roboto-condensed-italic text-gray-500 line-through">{formatPrice(original_price)}</span>
                {sale_off && <span className="font-roboto-bold text-red-600">{sale_off}% OFF</span>}
              </div>
            )}
          </div>
        </div>

        <Button className="w-full text-white cursor-pointer mb-3 bg-black transition-all duration-300 ease-in-out hover:bg-linear-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 font-roboto-bold py-6 text-lg">
          {t("btnEnroll")}
        </Button>

        <Button variant="outline" className="w-full mb-6 font-roboto-bold py-6 cursor-pointer">
          {t("btnCard")}
        </Button>

        <div className="space-y-3">
          <h3 className="font-roboto-bold text-sm mb-4">{t("courseIncludes")}</h3>
          {includes.map((item, index) => (
            <div key={index} className="flex items-center gap-3 font-roboto text-sm">
              <span className="text-gray-700">{getIcon(item.icon)}</span>
              <span className="text-gray-700">{item.text}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
