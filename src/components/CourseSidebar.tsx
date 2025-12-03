"use client";
import React from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { PlayCircle, FileText, Award, Infinity, Smartphone, Download } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { PLACEHOLDER_THUMBNAIL } from '@/const/urls';
import Link from 'next/link';
interface CourseSidebarProps {
  thumbnail?: string | null;
  price: number;
  original_price?: number;
  sale_off?: number;
  course_slug: string;
  includes: Array<{
    icon: string;
    text: string;
  }>;
  onBuyNow?: () => void;
  isLoading?: boolean;
}

export default function CourseSidebar({ thumbnail, price, original_price, sale_off, includes, course_slug,onBuyNow, isLoading }: CourseSidebarProps) {
  const t = useTranslations("Course-Detail-Sidebar");
  original_price = 1200000
  sale_off = 50
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

  // const hasThumbnail = thumbnail && thumbnail.trim() !== "";
  return (
    <div className="sticky border-gray-200 bg-white shadow-lg">
      <div className="relative aspect-video w-full overflow-hidden">
        <Image
          src={thumbnail || PLACEHOLDER_THUMBNAIL}
          alt="Course thumbnail"
          fill
          className="object-cover rounded-t-xl"
        />
      </div>

      <div className="p-6">
        <div className="mb-4">
          <div className="flex justify-center w-full gap-3">
            <span className="font-roboto-condensed-bold text-3xl text-red-500">{formatPrice(price)}</span>
            {original_price && (
              <div className='flex gap-2'>
                <span className="font-roboto-condensed-italic text-gray-500 line-through">{formatPrice(original_price)}</span>
                {sale_off && <span className="font-roboto-bold text-red-600">{sale_off}% OFF</span>}
              </div>
            )}
          </div>
        </div>

        <Link href={`/course-learn/${course_slug}`}>
          <Button className="w-full text-white cursor-pointer mb-3 bg-pink-600 transition-all duration-300 ease-in-out hover:bg-linear-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 font-roboto-bold py-6 text-lg">
            {t("btnEnroll")}
          </Button>
        </Link>
        <Button variant="outline" className="w-full mb-6 font-roboto-bold py-6 cursor-pointer" >
          <Link href={``}>{t("btnCard")}</Link>
        </Button>
        <Button 
                    className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-6 text-lg"
                    onClick={onBuyNow}     // Gọi hàm
                    disabled={isLoading}   // Disable khi đang tải
                >
                    {isLoading ? 'Đang tạo link...' : 'Mua ngay'}
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
