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
  // Heart,
  Package,
} from "lucide-react"
import { formatPriceVND } from "@/utils/convert_price";
import { Group } from "@/type/course.type";
import { PLACEHOLDER_THUMBNAIL } from "@/const/urls";

interface ComboCourseProps {
  combo: Group;
}

const ComboCourse: React.FC<ComboCourseProps> = ({ combo }) => {
  const isMobile = useIsMobile();

  const wrapperClass = `w-[320px] h-[300px] border-2 p-3 transition-transform duration-300 hover:shadow-lg hover:border-pink-200 hover:scale-102 flex flex-col justify-between gap-0 ${isMobile ? "rounded-2xl h-[300px]" : "rounded-3xl cursor-pointer"
    }`;

  const imageClass = `w-full h-full object-cover ${isMobile ? "rounded-t-3xl" : "rounded-t-3xl"
    } rounded-b-2xl`;

//   const headerWrapperClass = isMobile
//     ? "pl-2"
//     : "flex justify-end pl-2 pt-2 pr-2 ";

  const buttonWrapperClass = `w-full flex pl-2 ${isMobile ? " justify-end gap-2" : " justify-end justify-items-center items-center pr-2 gap-2"}`;

/*   const imageWidth = 350; */
  const imageHeight = isMobile ? 150 : 150;

  // Tính toán giá
  const calculateOriginalPrice = (): number => {
    if (!combo.hasCourseGroup || combo.hasCourseGroup.length === 0) return 0;
    return combo.hasCourseGroup.reduce((sum, cg) => {
      const price = Number(cg.belongToCourse.price) || 0;
      return sum + price;
    }, 0);
  };

  const calculateDiscountedPrice = (): number => {
    const originalPrice = calculateOriginalPrice();
    return Math.round(originalPrice * (1 - combo.discount / 100));
  };

  const originalPrice = calculateOriginalPrice();
  const discountedPrice = calculateDiscountedPrice();
  const courseCount = combo.hasCourseGroup?.length || 0;
  const firstCourseThumbnail = combo.hasCourseGroup?.[0]?.belongToCourse?.thumbnail;

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className={wrapperClass}>
            <div className="relative" style={{ height: imageHeight, width: "100%" }}>
              <Image
              /*   width={`${imageWidth}`}
                height={`${imageHeight}`} */
                fill
                src={firstCourseThumbnail || PLACEHOLDER_THUMBNAIL}
                alt={combo.name ?? "Combo thumbnail"}
                className={imageClass}
              />
              <div className="absolute top-2 left-2 z-10">
                <Badge className="bg--600">
                  <Package className="w-3 h-3 mr-1" />
                  <p className="text-sm text-white font-roboto-condensed">
                    {combo.type === "Combo" ? "COMBO" : "NHÓM"}
                  </p>
                </Badge>
              </div>
              <div className="absolute top-2 right-2 z-10">
                <Badge className="bg-red-500">
                  <p className="text-sm text-white font-roboto-condensed-bold">
                    -{combo.discount}%
                  </p>
                </Badge>
              </div>
            </div>

            <div className="flex flex-col gap-4 h-full">
              <div className="flex items-start justify-between pl-2 pt-1 gap-2">
                <div className="flex-1">
                  <h3 className="text-xl font-roboto-condensed-bold">
                    {combo.name}
                  </h3>
                  <h5 className="text-sm font-roboto text-gray-600">
                    {combo.description || "Gói combo tiết kiệm cho bạn"}
                  </h5>
                </div>
                <div className="shrink-0">
                  <Badge variant="outline" className="text-xs text-purple-700 border-purple-300">
                    {courseCount} khóa học
                  </Badge>
                </div>
              </div>
              <div className="flex flex-col gap-3 mt-5">
                <div className="course-card-price-container flex justify-end gap-1">
                  <span className="text-sm text-gray-400 line-through font-roboto">
                    {formatPriceVND(originalPrice)}
                  </span>
                  <span className="font-roboto-condensed-bold text-red-500 text-2xl">
                    {formatPriceVND(discountedPrice)}
                  </span>
                </div>
                <div className={buttonWrapperClass}>
                  {/* <Button size={"icon"} className="group border-pink-600 border-2 bg-white cursor-pointer hover:border-pink-600 hover:bg-pink-600">
                    <Heart className="text-pink-600 group-hover:text-white"></Heart>
                  </Button> */}
                  <Button asChild className="bg-pink-600 hover:bg-pink-500 transition-colors">
                    <Link href={`/combo/${combo.group_id}`} className="text-[13px]">
                      Xem chi tiết
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </TooltipTrigger>
        <TooltipContent side="top" className="bg-white text-pink-600 p-2 font-roboto rounded-md border-2 max-w-sm">
          <p>Chi tiết: {combo.description || "Gói combo tiết kiệm"}</p>
          <p className="text-sm mt-2">Bao gồm {courseCount} khóa học:</p>
          <ul className="text-xs space-y-1 ml-4 mt-1">
            {combo.hasCourseGroup?.slice(0, 3).map((cg) => (
              <li key={cg.course_id} className="list-disc">
                {cg.belongToCourse.title}
              </li>
            ))}
            {courseCount > 3 && (
              <li className="text-purple-600 font-semibold">
                ... và {courseCount - 3} khóa học khác
              </li>
            )}
          </ul>
          <p className="text-sm mt-2">
            Tiết kiệm: <span className="font-bold text-green-600">{formatPriceVND(originalPrice - discountedPrice)}</span>
          </p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default ComboCourse;
