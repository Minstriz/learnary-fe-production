"use client";
import React from "react";
import { Category, Level } from "@/type/course.type";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Filter, X } from "lucide-react";

interface CourseFiltersProps {
  categories: Category[];
  levels: Level[];
  selectedCategory: string;
  selectedLevel: string;
  onCategoryChange: (value: string) => void;
  onLevelChange: (value: string) => void;
  onClearFilters: () => void;
}

const CourseFilters: React.FC<CourseFiltersProps> = ({
  categories,
  levels,
  selectedCategory,
  selectedLevel,
  onCategoryChange,
  onLevelChange,
  onClearFilters,
}) => {
  const hasActiveFilters = selectedCategory !== "all" || selectedLevel !== "all";

  return (
    <div className="w-full bg-white p-6 rounded-lg shadow-md mb-6">
      <div className="flex items-center gap-3 mb-4">
        <Filter className="h-5 w-5 text-gray-600" />
        <h3 className="text-lg font-roboto-condensed-bold">Bộ lọc</h3>
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        {/* Category Filter */}
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Danh mục
          </label>
          <Select value={selectedCategory} onValueChange={onCategoryChange}>
            <SelectTrigger className="w-full h-12">
              <SelectValue placeholder="Chọn danh mục" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả danh mục</SelectItem>
              {categories.map((category) => (
                <SelectItem key={category.category_id} value={category.category_id}>
                  {category.category_name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Level Filter */}
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Cấp độ
          </label>
          <Select value={selectedLevel} onValueChange={onLevelChange}>
            <SelectTrigger className="w-full h-12">
              <SelectValue placeholder="Chọn cấp độ" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả cấp độ</SelectItem>
              {levels.map((level) => (
                <SelectItem key={level.level_id} value={level.level_id}>
                  {level.level_name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Clear Filters Button */}
        <div className="flex items-end">
          <Button
            variant="outline"
            onClick={onClearFilters}
            disabled={!hasActiveFilters}
            className="h-12 px-4"
          >
            <X className="h-4 w-4 mr-2" />
            Xóa bộ lọc
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CourseFilters;
