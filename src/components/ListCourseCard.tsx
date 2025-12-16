"use client";
import React, { useEffect, useState, useMemo } from "react";
import SingleCourseCard from "./SingleCourseCard";
import { useIsMobile } from "@/hooks/useIsMobile";
import { Course, Category } from "@/type/course.type";
import { toast } from "sonner";
import api from "@/app/lib/axios";

type ListCourseCardProps = {
  title: string;
  courses?: Course[];
};

interface CoursesByCategory {
  category: Category;
  courses: Course[];
}

const fetchListCourses = async (): Promise<Course[]> => {
  try {
    const res = await api.get("/courses");
    const apiData = res.data;
    
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
  } catch {
    toast.error("Lỗi khi lấy danh sách khoá học!");
    return [];
  }
};

const fetchCategories = async (): Promise<Category[]> => {
  try {
    const res = await api.get("/categories");
    const apiData = res.data;
    
    if (apiData.success && Array.isArray(apiData.data)) {
      return apiData.data;
    } else if (Array.isArray(apiData)) {
      return apiData;
    } else {
      return [];
    }
  } catch {
    return [];
  }
};

const ListCourseCard: React.FC<ListCourseCardProps> = ({ title, courses }) => {
  const [coursesData, setCoursesData] = useState<Course[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const isMobile = useIsMobile();

  useEffect(() => {
    const fetchData = async () => {
      if (courses && courses.length > 0) {
        setCoursesData(courses);
      } else {
        const data = await fetchListCourses();
        setCoursesData(data);
      }
      const cats = await fetchCategories();
      setCategories(cats);
    };
    fetchData();
  }, [courses]);

  // Group courses by category
  const coursesByCategory = useMemo(() => {
    const grouped: CoursesByCategory[] = [];
    
    // Show all categories with their courses
    categories.forEach((category) => {
      const categoryCourses = coursesData.filter(
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
    const coursesWithoutCategory = coursesData.filter(
      (course) => !course.category_id
    );
    if (coursesWithoutCategory.length > 0) {
      grouped.push({
        category: { category_id: "none", category_name: "Khác" },
        courses: coursesWithoutCategory,
      });
    }

    return grouped;
  }, [coursesData, categories]);

  if (!coursesData || coursesData.length === 0) {
    return (
      <div className="flex items-center justify-center w-full">
        <p className="text-gray-500 relative">Hiện tại chưa có khoá học nào</p>
      </div>
    )
  }

  return (
    <div className="w-full px-4 md:px-8 lg:px-16 py-8">
      <div className="title w-full font-roboto-condensed-bold text-3xl text-center mb-8">{title}</div>
      
      {coursesByCategory.length === 0 ? (
        <div className="flex items-center justify-center w-full py-20">
          <p className="text-gray-500 text-lg">Không có khóa học nào</p>
        </div>
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
    </div>
  );
};

export default ListCourseCard;
