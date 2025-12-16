"use client";
import React from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { useAuth } from '@/app/context/AuthContext';
import { PlayCircle, FileText, Award, Infinity, Smartphone, Download } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { PLACEHOLDER_THUMBNAIL } from '@/const/urls';
import Link from 'next/link';
import FavoriteButton from '@/components/FavoriteButton';

interface CourseSidebarProps {
  thumbnail?: string | null;
  price: number;
  original_price?: number;
  sale_off?: number;
  course_slug: string;
  course_id: string;
  includes: Array<{
    icon: string;
    text: string;
  }>;
  onBuyNow?: () => void;
  isLoading?: boolean;
  isEnrolled?: boolean;
  isPreviewMode?: boolean;
}

export default function CourseSidebar({ thumbnail, price, original_price, sale_off, includes, onBuyNow, isLoading, isEnrolled, course_slug, course_id, isPreviewMode = false }: CourseSidebarProps) {
  const { isLoggedIn } = useAuth();
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
        
        {!isEnrolled && (
          <FavoriteButton 
            courseId={course_id} 
            variant="button" 
            size="lg"
            className={`w-full mb-3 py-6 border-2 font-roboto-bold text-base transition-all duration-300 ease-in-out shadow-md hover:shadow-lg ${isPreviewMode ? 'opacity-60 cursor-not-allowed pointer-events-none' : ''}`}
          />
        )}
        
        {isEnrolled ? (
          <Link href={`/course-learn/${course_slug}`} className="block mb-6">
            <Button className="w-full text-white cursor-pointer bg-green-600 hover:bg-green-700 font-bold py-6 text-lg">
              Tham gia ngay
            </Button>
          </Link>
        ) : (
          <>
            {!isLoading ? (
              <Button 
                className={`w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-6 text-lg mb-6 shadow-md hover:shadow-lg transition-all duration-300 ${isPreviewMode ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}`}
                onClick={isPreviewMode ? undefined : () => {
                  if (!isLoggedIn) {
                    toast.error('Bạn cần đăng nhập để mua khóa học!');
                    setTimeout(() => {
                      window.location.href = '/login';
                    }, 1200);
                    return;
                  }
                  if (window.confirm('Bạn có chắc chắn muốn mua khóa học này?')) {
                    if (onBuyNow) onBuyNow();
                  }
                }} 
                disabled={isLoading || isPreviewMode}
              >
                Mua ngay
              </Button>
            ) : (
              <Button 
                className="w-full cursor-not-allowed bg-purple-600 hover:bg-purple-700 text-white font-bold py-6 text-lg mb-6" 
                onClick={onBuyNow} 
                disabled={isLoading}
              >
                Đang tạo link...
              </Button>
            )}
          </>
        )}

        <div className="space-y-3">
          <h3 className="font-roboto-bold text-sm mb-4 pt-5">{t("courseIncludes")}</h3>
          {includes.map((item, index) => (
            <div key={index} className="flex items-start gap-3 font-roboto text-sm">
              <span className="text-gray-700">{getIcon(item.icon)}</span>
              <span className="text-gray-700 break-all">{item.text}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
