"use client";
import React from "react";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

interface CourseSearchBarProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  minPrice: string;
  maxPrice: string;
  onMinPriceChange: (value: string) => void;
  onMaxPriceChange: (value: string) => void;
}

const CourseSearchBar: React.FC<CourseSearchBarProps> = ({
  searchTerm,
  onSearchChange,
  minPrice,
  maxPrice,
  onMinPriceChange,
  onMaxPriceChange,
}) => {
  return (
    <div className="w-full bg-white p-6 rounded-lg mb-6">
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
          <Input
            type="text"
            placeholder="Tìm kiếm khóa học theo tên..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10 h-12"
          />
        </div>

        <div className="flex gap-2 items-center">
          <span className="text-sm text-gray-600 whitespace-nowrap">Giá từ:</span>
          <Input
            type="number"
            placeholder="0đ"
            value={minPrice}
            onChange={(e) => onMinPriceChange(e.target.value)}
            className="w-32 h-12"
            min="0"
          />
          <span className="text-sm text-gray-600">-</span>
          <Input
            type="number"
            placeholder="∞"
            value={maxPrice}
            onChange={(e) => onMaxPriceChange(e.target.value)}
            className="w-32 h-12"
            min="0"
          />
        </div>
      </div>
    </div>
  );
};

export default CourseSearchBar;
