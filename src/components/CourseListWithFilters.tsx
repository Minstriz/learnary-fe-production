"use client";
import React, { useEffect, useState, useMemo } from "react";
import { Course, Category, Level, Group } from "@/type/course.type";
import { toast } from "sonner";
import api from "@/app/lib/axios";
import SingleCourseCard from "./SingleCourseCard";
import ComboCourse from "./ComboCourse";
import CourseSearchBar from "./CourseSearchBar";
import CourseFilters from "./CourseFilters";
import { useIsMobile } from "@/hooks/useIsMobile";
import { Button } from "@/components/ui/button";

interface CoursesByCategory {
  category: Category;
  courses: Course[];
}

type DisplayType = "all" | "courses" | "combos";

const fetchListCourses = async (): Promise<Course[]> => {
  try {
    const res = await api.get("/courses");
    const apiData = res.data;
    
    // Xử lý response giống như trong admin pages
    let data: Course[] = [];
    if (apiData.success && Array.isArray(apiData.data)) {
      data = apiData.data;
    } else if (Array.isArray(apiData)) {
      data = apiData;
    } else {
      return [];
    }
    
    if (!data || data.length === 0) {
      return [];
    }
    const PublishedCourse = data.filter((course: Course) => course.status === "Published");
    return PublishedCourse;
  } catch (error) {
    console.error("Lỗi khi lấy danh sách khóa học:", error);
    toast.error("Lỗi khi lấy danh sách khóa học!");
    return [];
  }
};

const fetchCombos = async (): Promise<Group[]> => {
  try {
    const res = await api.get("/groups");
    const apiData = res.data;
    
    let data: Group[] = [];
    if (apiData.success && Array.isArray(apiData.data)) {
      data = apiData.data;
    } else if (Array.isArray(apiData)) {
      data = apiData;
    }
    
    // Filter combo có khóa học và Published
    const activeCombos = data.filter((combo: Group) => {
      if (!combo.hasCourseGroup || combo.hasCourseGroup.length === 0) return false;
      return combo.hasCourseGroup.every(cg => 
        cg.belongToCourse && cg.belongToCourse.status === "Published"
      );
    });
    return activeCombos;
  } catch (error) {
    console.error("Lỗi khi lấy combos:", error);
    return [];
  }
};

const fetchCategories = async (): Promise<Category[]> => {
  try {
    const res = await api.get('/categories');
    const catData = res.data?.data || res.data || [];
    return Array.isArray(catData) ? catData : [];
  } catch (error) {
    console.error("Lỗi khi lấy danh mục:", error);
    return [];
  }
};

const fetchLevels = async (): Promise<Level[]> => {
  try {
    const res = await api.get('/levels');
    const lvlData = res.data?.data || res.data || [];
    const levels = Array.isArray(lvlData) ? lvlData : [];
    // Sort by order_index
    levels.sort((a, b) => (a.order_index || 0) - (b.order_index || 0));
    return levels;
  } catch (error) {
    console.error("Lỗi khi lấy cấp độ:", error);
    return [];
  }
};

const CourseListWithFilters: React.FC = () => {
  const [coursesData, setCoursesData] = useState<Course[]>([]);
  const [combosData, setCombosData] = useState<Group[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [levels, setLevels] = useState<Level[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedLevel, setSelectedLevel] = useState("all");
  const [displayType, setDisplayType] = useState<DisplayType>("all");
  const [isLoading, setIsLoading] = useState(true);
  const isMobile = useIsMobile();

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      const [coursesResult, combosResult, categoriesResult, levelsResult] = await Promise.all([
        fetchListCourses(),
        fetchCombos(),
        fetchCategories(),
        fetchLevels(),
      ]);
      
      // Fallback: If levels API failed (401 for public), extract from courses
      let finalLevels = levelsResult;
      if (levelsResult.length === 0 && coursesResult.length > 0) {
        const uniqueLevels: Level[] = [];
        const levelIds = new Set<string>();
        coursesResult.forEach((course: Course) => {
          if (course.level && course.level.level_id && !levelIds.has(course.level.level_id)) {
            levelIds.add(course.level.level_id);
            uniqueLevels.push(course.level);
          }
        });
        uniqueLevels.sort((a, b) => (a.order_index || 0) - (b.order_index || 0));
        finalLevels = uniqueLevels;
      }
      
      setCoursesData(coursesResult);
      setCombosData(combosResult);
      setCategories(categoriesResult);
      setLevels(finalLevels);
      setIsLoading(false);
    };
    fetchData();
  }, []);

  // Filter courses based on search and filters
  const filteredCourses = useMemo(() => {
    const filtered = coursesData.filter((course) => {
      // Search by name
      const matchesSearch = course.title
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase());

      // Filter by price range
      const coursePrice = course.price ?? 0;
      const min = minPrice ? parseFloat(minPrice) : 0;
      const max = maxPrice ? parseFloat(maxPrice) : Infinity;
      const matchesPrice = coursePrice >= min && coursePrice <= max;

      // Filter by category
      const matchesCategory =
        selectedCategory === "all" || course.category_id === selectedCategory;

      // Filter by level
      const matchesLevel =
        selectedLevel === "all" || course.level_id === selectedLevel;

      return matchesSearch && matchesPrice && matchesCategory && matchesLevel;
    });
    
    return filtered;
  }, [coursesData, searchTerm, minPrice, maxPrice, selectedCategory, selectedLevel]);

  // Filter combos based on search and filters
  const filteredCombos = useMemo(() => {
    return combosData.filter((combo) => {
      // Search by name
      const matchesSearch = combo.name
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase());

      // Calculate combo price (with discount)
      const totalPrice = combo.hasCourseGroup?.reduce((sum, cg) => {
        return sum + (cg.belongToCourse?.price || 0);
      }, 0) || 0;
      const discountedPrice = totalPrice * (1 - (combo.discount || 0) / 100);
      
      const min = minPrice ? parseFloat(minPrice) : 0;
      const max = maxPrice ? parseFloat(maxPrice) : Infinity;
      const matchesPrice = discountedPrice >= min && discountedPrice <= max;

      return matchesSearch && matchesPrice;
    });
  }, [combosData, searchTerm, minPrice, maxPrice]);

  // Group courses by category
  const coursesByCategory = useMemo(() => {
    const grouped: CoursesByCategory[] = [];
    
    // If no categories available, show all courses in one group
    if (categories.length === 0 && filteredCourses.length > 0) {
      grouped.push({
        category: { category_id: "all", category_name: "Tất cả khóa học" },
        courses: filteredCourses,
      });
      return grouped;
    }
    
    // If category filter is applied, only show that category
    if (selectedCategory !== "all") {
      const category = categories.find((cat) => cat.category_id === selectedCategory);
      if (category) {
        grouped.push({
          category,
          courses: filteredCourses.filter((course) => course.category_id === selectedCategory),
        });
      }
    } else {
      // Show all categories with their courses
      categories.forEach((category) => {
        const categoryCourses = filteredCourses.filter(
          (course) => course.category_id === category.category_id
        );
        if (categoryCourses.length > 0) {
          grouped.push({
            category,
            courses: categoryCourses,
          });
        }
      });

      // Add courses without category
      const coursesWithoutCategory = filteredCourses.filter(
        (course) => !course.category_id || !categories.find(cat => cat.category_id === course.category_id)
      );
      if (coursesWithoutCategory.length > 0) {
        grouped.push({
          category: { category_id: "none", category_name: "Khác" },
          courses: coursesWithoutCategory,
        });
      }
    }

    return grouped;
  }, [filteredCourses, categories, selectedCategory]);

  const handleClearFilters = () => {
    setSearchTerm("");
    setMinPrice("");
    setMaxPrice("");
    setSelectedCategory("all");
    setSelectedLevel("all");
    setDisplayType("all");
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="w-full px-4 md:px-8 lg:px-16 py-8">
      {/* Search Bar and Filters */}
      <div className="flex flex-col md:flex-row gap-4 mb-6 items-start md:items-end">
        <div className="flex-1 w-full">
          <CourseSearchBar
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            minPrice={minPrice}
            maxPrice={maxPrice}
            onMinPriceChange={setMinPrice}
            onMaxPriceChange={setMaxPrice}
          />
        </div>
        <div className="w-full md:w-auto">
          <CourseFilters
            categories={categories}
            levels={levels}
            selectedCategory={selectedCategory}
            selectedLevel={selectedLevel}
            onCategoryChange={setSelectedCategory}
            onLevelChange={setSelectedLevel}
            onClearFilters={handleClearFilters}
          />
        </div>
      </div>

      {/* Display Type Toggle */}
      <div className="flex gap-3 mb-6 justify-center">
        <Button
          variant={displayType === "all" ? "default" : "outline"}
          onClick={() => setDisplayType("all")}
          className={displayType === "all" ? "bg-pink-600 hover:bg-pink-700" : ""}
        >
          Tất cả
        </Button>
        <Button
          variant={displayType === "courses" ? "default" : "outline"}
          onClick={() => setDisplayType("courses")}
          className={displayType === "courses" ? "bg-pink-600 hover:bg-pink-700" : ""}
        >
          Khóa học đơn
        </Button>
        <Button
          variant={displayType === "combos" ? "default" : "outline"}
          onClick={() => setDisplayType("combos")}
          className={displayType === "combos" ? "bg-pink-600 hover:bg-pink-700" : ""}
        >
          Combo
        </Button>
      </div>



      {/* Display content based on selected type */}
      {displayType !== "combos" && (
        <>
          {/* Courses grouped by category */}
          {coursesByCategory.length === 0 ? (
            displayType === "courses" ? (
              <div className="flex items-center justify-center w-full py-20">
                <p className="text-gray-500 text-lg">Không tìm thấy khóa học nào phù hợp</p>
              </div>
            ) : null
          ) : (
            <div className="space-y-12">
              {coursesByCategory.map((group) => (
                <div key={group.category.category_id}>
                  <h2 className="text-2xl font-roboto-condensed-bold mb-6 border-b-2 border-pink-600 pb-2 inline-block">
                    {group.category.category_name}
                  </h2>
                  {isMobile ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 justify-items-center">
                      {group.courses.map((course) => (
                        <SingleCourseCard key={course.course_id} course={course} />
                      ))}
                    </div>
                  ) : (
                    <div className="flex flex-wrap gap-4">
                      {group.courses.map((course) => (
                        <div key={course.course_id} className="w-full sm:w-1/2 lg:w-1/4">
                          <SingleCourseCard course={course} />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* Combos section */}
      {displayType !== "courses" && (
        <div className={displayType === "all" && coursesByCategory.length > 0 ? "mt-12" : ""}>
          {filteredCombos.length === 0 ? (
            displayType === "combos" ? (
              <div className="flex items-center justify-center w-full py-20">
                <p className="text-gray-500 text-lg">Không tìm thấy combo nào phù hợp</p>
              </div>
            ) : null
          ) : (
            <>
              {displayType === "all" && filteredCombos.length > 0 && (
                <h2 className="text-2xl font-roboto-condensed-bold mb-6 border-b-2 border-pink-600 pb-2 inline-block">
                  Combo khóa học
                </h2>
              )}
              {isMobile ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 justify-items-center">
                  {filteredCombos.map((combo) => (
                    <ComboCourse key={combo.group_id} combo={combo} />
                  ))}
                </div>
              ) : (
                <div className="flex flex-wrap gap-4">
                  {filteredCombos.map((combo) => (
                    <div key={combo.group_id} className="w-full sm:w-1/2 lg:w-1/4">
                      <ComboCourse combo={combo} />
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      )}
      
      {/* Show message when both are empty */}
      {coursesByCategory.length === 0 && filteredCombos.length === 0 && displayType === "all" && (
        <div className="flex items-center justify-center w-full py-20">
          <p className="text-gray-500 text-lg">Không tìm thấy khóa học hoặc combo nào phù hợp</p>
        </div>
      )}
    </div>
  );
};

export default CourseListWithFilters;
