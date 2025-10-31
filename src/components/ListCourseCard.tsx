"use client"
import React from 'react'
import SingleCourseCard from './SingleCourseCard'
import CoursesMock from '@/Mock/MockData/ListCourses.json'
import { useIsMobile } from '@/hooks/useIsMobile'
// Type assertion for JSON data
const typedCoursesMock = CoursesMock as Course[];
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
interface ListCourseCardProps {
  courses?: Course[];
}

const ListCourseCard: React.FC<ListCourseCardProps> = ({ courses }) => {
  const isMobile = useIsMobile();
  const data = courses ?? typedCoursesMock;
  if (!data || data.length == 0) {
    return <p className='text-gray-500'>Chưa có khoá học nào hiện tại</p>;
  } else
    return (
      isMobile ? (
        <div>
          <div className="title w-full font-roboto-condensed-bold text-2xl pl-5 pb-5 pt-5">Tên list khoá học</div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 justify-items-center">
            {data.map((course) => (
              <SingleCourseCard key={course.course_id} course={course} />
            ))}
          </div>
        </div>
      ) : (
        <div>
          <div className="title w-full font-roboto-condensed-bold text-2xl pl-5 pb-5 pt-5">Tên list khoá học</div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 p-5">
            {data.map((course) => (
              <SingleCourseCard key={course.course_id} course={course} />
            ))}
          </div>
        </div>
      )
    )
}

export default ListCourseCard;