"use client";
import React, { useEffect, useState } from "react";
import SingleCourseCard from "./SingleCourseCard";
import { useIsMobile } from "@/hooks/useIsMobile";
import { Course } from "@/type/course.type";
import { toast } from "sonner";
import api from "@/app/lib/axios";

type ListCourseCardProps = {
  title: string;
  courses?: Course[];
};

const fetchListCourses = async (): Promise<Course[]> => {
  try {
    const res = await api.get("/courses");
    const data = res.data.data;
    if (!data || data.length === 0) {
      toast.info("Hệ thống chưa có khoá học nào");
      return [];
    }
    const PublishedCourse = data.filter((course: Course) => course.status === "Published");
    return PublishedCourse;
  } catch {
    toast.error("Lỗi khi lấy danh sách khoá học!");
    return [];
  }
};

const ListCourseCard: React.FC<ListCourseCardProps> = ({ title, courses }) => {
  const [coursesData, setCoursesData] = useState<Course[]>([]);
  const isMobile = useIsMobile();

  useEffect(() => {
    if (courses && courses.length > 0) {
      setCoursesData(courses);
    } else {
      const fetchData = async () => {
        const data = await fetchListCourses();
        setCoursesData(data);
      };
      fetchData();
    }
  }, [courses]);

  if (!coursesData || coursesData.length === 0) {
    return <p className="text-gray-500">Chưa có khoá học nào hiện tại</p>;
  }

  return isMobile ? (
    <div>
      <div className="title w-full font-roboto-condensed-bold text-2xl pl-5 pb-5 pt-5">{title}</div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 justify-items-center">
        {coursesData.map((course) => (
          <SingleCourseCard key={course.course_id} course={course} />
        ))}
      </div>
    </div>
  ) : (
    <div>
      <div className="title w-full font-roboto-condensed-bold text-2xl pl-5 pb-5 pt-5">{title}</div>
      <div className="flex flex-wrap gap-4 p-2">
        {coursesData.map((course) => (
          <div key={course.course_id} className="w-full sm:w-1/2 lg:w-1/4">
            <SingleCourseCard course={course} />
          </div>
        ))}
      </div>
    </div>
  );
};

export default ListCourseCard;
