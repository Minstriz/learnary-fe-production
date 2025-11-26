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
import { formatPriceVND } from "@/utils/convert_price";
enum StatusCourse {
  Draft = "Draft",
  Published = "Published",
  Archived = "Archived",
}

interface Course {
  course_id: string;
  category_id: string;
  level_id: string;
  instructor_id: string;
  status: StatusCourse;
  title: string;
  slug: string;
  thumbnail: string;
  price: number;
  saleoff: boolean;
  hot: boolean;
  tag: boolean;
}

interface SingleCourseCardProps {
  course?: Course;
}

const MockCourse: Course = {
  course_id: "mock_course_id",
  category_id: "mock_category_id",
  level_id: "mock_level_id",
  instructor_id: "mock_instructor_id",
  status: StatusCourse.Draft,
  title: "Khoá học làm giàu (MOCK)",
  slug: "khoa-hoc-lam-giau",
  thumbnail: "/images/courses/course.png",
  price: 123000,
  saleoff: true,
  hot: true,
  tag: true,
};

const SingleCourseCard: React.FC<SingleCourseCardProps> = ({ course }) => {
  const dataCourse = course ?? MockCourse;
  const isMobile = useIsMobile();

  const wrapperClass = `w-[350px] h-[390px] border-2 p-2 transition-transform duration-300 hover:shadow-lg hover:scale-102 ${isMobile ? "rounded-2xl h-[405px]" : "rounded-3xl cursor-pointer"
    }`;

  const imageClass = `w-full h-full object-cover ${isMobile ? "rounded-t-3xl" : "rounded-t-3xl"
    } rounded-b-2xl`;

  const headerWrapperClass = isMobile
    ? "pl-2"
    : "flex justify-between pl-2 pt-2 pr-2";

  const buttonWrapperClass = `w-full pl-2 ${isMobile ? "flex justify-end" : "flex justify-end pr-2"}`;

  const imageWidth = 350;
  const imageHeight = isMobile ? 220 : 200;

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className={wrapperClass}>
            <div className="relative" style={{ height: imageHeight, width: "100%" }}>
              <Image
                width={imageWidth}
                height={imageHeight}
                src={dataCourse.thumbnail || '/Logo/Logo-Black-NoBG.svg'}
                alt={dataCourse.title}
                className={imageClass}
              />
              <Badge
                variant="outline"
                className="absolute top-2 left-2 bg-white/70 font-medium"
              >
                {dataCourse.category_id}
              </Badge>
            </div>
            <div className="flex flex-col gap-4 mt-2">
              <div className="flex flex-col">
                <div className={headerWrapperClass}>
                  {isMobile ? (
                    <div className="flex justify-between">
                      <p className="text-sm text-[#696969] font-roboto-condensed">
                        {dataCourse.category_id}
                      </p>
                      <p className="text-sm text-[#696969] font-roboto-condensed">
                        {dataCourse.instructor_id}
                      </p>
                    </div>
                  ) : (
                    <>
                      <p className="text-sm text-[#696969] font-roboto-condensed">
                        {dataCourse.title}
                      </p>
                      <p className="text-sm text-[#696969] font-roboto-condensed">
                        {dataCourse.instructor_id}
                      </p>
                    </>
                  )}
                </div>
                <div className="pl-2 pt-1">
                  <h3 className="text-xl font-roboto-condensed-bold">
                    {dataCourse.title}
                  </h3>
                </div>
              </div>
              <div className="course-card-price-container flex justify-end font-roboto-condensed text-black-700 text-3xl">
                {formatPriceVND(dataCourse.price)}
              </div>
              <div className={buttonWrapperClass}>
                <Button asChild>
                  <Link /* href={`/courses/${dataCourse.slug}`} */ href={`/course-detail`}>
                    Chi tiết khoá học
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </TooltipTrigger>
        <TooltipContent side="top" className="bg-white text-black p-2 rounded-md border-2">
          <p>Trạng thái: {dataCourse.status}</p>
          <p>Giá: {dataCourse.price.toLocaleString("vi-VN")} ₫</p>
          {dataCourse.saleoff && <p className="text-red-400">Đang giảm giá</p>}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default SingleCourseCard;
