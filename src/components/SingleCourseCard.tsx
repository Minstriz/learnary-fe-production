"use client";
import React from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useIsMobile } from "@/hooks/useIsMobile";
import { Badge } from "@/components/ui/badge";
import { useTranslations } from 'next-intl';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { formatPriceVND } from "@/utils/convert_price";
import { Course } from "@/type/course.type";
import { PLACEHOLDER_THUMBNAIL, DEFAULT_LANGUAGE } from "@/const/urls";
import FavoriteButton from "@/components/FavoriteButton";

interface SingleCourseCardProps {
  course: Course;
}

const SingleCourseCard: React.FC<SingleCourseCardProps> = ({ course }) => {
  const dataCourse = course;
  const isMobile = useIsMobile();
  const t = useTranslations("Course-Card");
  const wrapperClass = `w-[320px] h-[300px] border-2 p-3 transition-transform duration-300 hover:shadow-lg hover:border-pink-200 hover:scale-102 flex flex-col justify-between gap-0 ${isMobile ? "rounded-2xl h-[300px]" : "rounded-3xl cursor-pointer"
    }`;

  const imageClass = `w-full h-full object-cover ${isMobile ? "rounded-t-3xl" : "rounded-t-3xl"
    } rounded-b-2xl`;

  const headerWrapperClass = isMobile
    ? "pl-2"
    : "flex justify-end pl-2 pt-2 pr-2";

  const buttonWrapperClass = `w-full flex pl-2 ${isMobile ? " justify-end gap-2" : " justify-end justify-items-center items-center pr-2 gap-2"}`;
  /*   const imageWidth = 350; */
  const imageHeight = isMobile ? 150 : 150;

  const saleOff = Number(dataCourse.sale_off);
  const hasDiscount = !isNaN(saleOff) && saleOff > 0 && saleOff <= 100;
  const discountedPrice = (dataCourse.price ?? 0) - (dataCourse.price ?? 0) * saleOff / 100;

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className={wrapperClass}>
            <div className="relative" style={{ height: imageHeight, width: "100%" }}>
              <Link href={`/course-detail/${dataCourse.slug}`}>
                <Image
                  /*     width={`${imageWidth}`} */
                  /*                 height={`${imageHeight}`} */
                  fill
                  src={dataCourse.thumbnail || PLACEHOLDER_THUMBNAIL}
                  alt={dataCourse.title ?? "Course thumbnail"}
                  className={imageClass}
                />
              </Link>
              <div className="absolute top-2 left-2 z-10">
                <Badge className="bg-white ">
                  <p className="text-sm text-orange-500 font-roboto-condensed-bold">
                    {dataCourse.category?.category_name ?? "không có thông tin loại khoá học"}
                  </p>
                </Badge>
              </div>
            </div>

            <div className={`${isMobile ? 'gap-2' : 'flex flex-col gap-2 justify-between h-full'}`}>
              <div className="flex flex-col">
                <div className={headerWrapperClass}>
                </div>
                <div className="pl-2 pt-1 flex flex-col gap-1 justify-start">
                  <h3 className="text-xl font-roboto-condensed-bold">
                    {dataCourse.title}
                  </h3>
                  <h5 className="text-sm font-roboto text-gray-600">
                    {t("instructor-name")}: {dataCourse.instructor?.user?.fullName || "Không có thông tin tác giả"}
                  </h5>
                  <div className="flex align-center gap-2 justify-start ">
                    <Badge variant={"outline"} className="border-red-400 text-red-600 text-[12px]">{dataCourse.level?.level_name}</Badge>
                    <div className="text-sm font-roboto-condensed">{dataCourse.feedbacks?.length} đánh giá</div>
                  </div>
                </div>
              </div>
              <div className="flex flex-col gap-1">
                {hasDiscount ? (
                  <>
                    <div className="course-card-price-container flex justify-end font-roboto-condensed-italic text-gray-500 text-1xl line-through">
                      {formatPriceVND(dataCourse.price ?? 0)}
                    </div>
                    <div className="course-card-price-container flex justify-end font-roboto-condensed-bold text-red-500 text-2xl">
                      {formatPriceVND(discountedPrice)}
                    </div>
                  </>
                ) : (
                  <div className="course-card-price-container flex justify-end font-roboto-condensed-bold text-red-500 text-2xl">
                    {formatPriceVND(dataCourse.price ?? 0)}
                  </div>
                )}
                <div className={buttonWrapperClass}>
                  <FavoriteButton courseId={dataCourse.course_id} />
                  <Button asChild className="bg-pink-600 hover:bg-pink-500 transition-colors text-sm">
                    <Link href={`/course-detail/${dataCourse.slug}`} className="text-[13px]">
                      Xem chi tiết
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </TooltipTrigger>
        <TooltipContent side="top" className="bg-white text-pink-600 p-2 font-roboto rounded-md border-2">
          <p>Chi tiết: {dataCourse.description || "Không có mô tả chi tiết"}</p>
          <p>Ngôn ngữ khả dụng: {(dataCourse.available_language ?? DEFAULT_LANGUAGE)}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default SingleCourseCard;
