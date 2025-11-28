"use client";
import React from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useIsMobile } from "@/hooks/useIsMobile";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Heart,
} from "lucide-react"
import { formatPriceVND } from "@/utils/convert_price";
import { Course } from "@/type/course.type";
import { PLACEHOLDER_THUMBNAIL,DEFAULT_LANGUAGE } from "@/const/urls";

interface SingleCourseCardProps {
  course: Course;
}

const SingleCourseCard: React.FC<SingleCourseCardProps> = ({ course }) => {
  const dataCourse = course;
  const isMobile = useIsMobile();

  const wrapperClass = `w-[350px] h-[350px] border-2 p-3 transition-transform duration-300 hover:shadow-lg hover:scale-102 flex flex-col gap-0 ${isMobile ? "rounded-2xl h-[405px]" : "rounded-3xl cursor-pointer"
    }`;

  const imageClass = `w-full h-full object-cover ${isMobile ? "rounded-t-3xl" : "rounded-t-3xl"
    } rounded-b-2xl`;

  const headerWrapperClass = isMobile
    ? "pl-2"
    : "flex justify-end pl-2 pt-2 pr-2";

  const buttonWrapperClass = `w-full flex pl-2 ${isMobile ? " justify-end gap-2" : " justify-end justify-items-center items-center pr-2 gap-2"}`;

  const imageWidth = 350;
  const imageHeight = isMobile ? 150 : 150;

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className={wrapperClass}>
            <div className="relative" style={{ height: imageHeight, width: "100%" }}>
              <Image
                width={`${imageWidth}`}
                height={`${imageHeight}`}
                src={dataCourse.thumbnail || PLACEHOLDER_THUMBNAIL}
                alt={dataCourse.title ?? "Course thumbnail"}
                className={imageClass}
              />
              <div className="absolute top-2 left-2 z-10">
                <Badge className="bg-amber-600">
                  <p className="text-sm text-white font-roboto-condensed">
                    {dataCourse.category?.category_name ?? "không có thông tin loại khoá học"}
                  </p>
                </Badge>
              </div>
            </div>

            <div className="flex flex-col gap-4 justify-between h-full">
              <div className="flex flex-col">
                <div className={headerWrapperClass}>
                </div>
                <div className="pl-2 pt-1">
                  <h3 className="text-xl font-roboto-condensed-bold">
                    {dataCourse.title}
                  </h3>
                  <h5 className="text-sm font-roboto text-gray-600">
                    {dataCourse.instructor?.user?.fullName || "Không có thông tin tác giả"}
                  </h5>
                </div>
              </div>
              <div className="flex flex-col gap-3">
                <div className="course-card-price-container flex justify-end font-roboto-condensed-bold text-red-500 text-3xl">
                  {formatPriceVND(dataCourse.price ?? 0)}
                </div>
                <div className={buttonWrapperClass}>
                  <Button size={"icon"} className="group border-pink-600 border-2 bg-white cursor-pointer hover:border-pink-600 hover:bg-pink-600">
                    <Heart className="text-pink-600 group-hover:text-white"></Heart>
                  </Button>
                  <Button asChild className="bg-pink-600 hover:bg-pink-500 transition-colors">
                    <Link href={`/course-detail/${dataCourse.slug}`}>
                      Học ngay
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
