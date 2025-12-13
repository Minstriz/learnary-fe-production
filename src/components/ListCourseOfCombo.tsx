import { LearnerCourse } from '@/type/course.type'
import React from 'react'
import CourseEnrolledCard from './CourseEnrolledCard'
import { Lock } from 'lucide-react'

interface CourseProgress {
  [course_id: string]: {
    totalLessons: number;
    completedLessons: number;
    progress: number;
  };
}

interface CourseInCombo {
  learnerCourse: LearnerCourse;
  order_index: number;
  progress: number;
  isLocked: boolean;
}

interface ListCourseOfComboProps {
  group_id: string;
  group_name: string;
  courses: CourseInCombo[];
  courseProgress: CourseProgress;
}

export default function ListCourseOfCombo({
/*   group_id, */
  group_name,
  courses,
/*   courseProgress */
}: ListCourseOfComboProps) {
  return (
    <div className='mt-3'>
      <div className='flex flex-col gap-5 w-full rounded-2xl min-h-[350px] p-5 border-2 bg-white border-pink-900'>
        <div className="title border-b pb-3 flex justify-between">
          <p className='text-2xl font-roboto-condensed-bold'>{group_name}</p>
          <p className='text-sm text-gray-600 mt-1 font-roboto-condensed'>
            {courses.filter(c => c.progress >= 100).length} / {courses.length} khóa học đã hoàn thành
          </p>
        </div>
        
        <div className="content w-full">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 ">
            {courses.map((courseData) => (
              <div key={courseData.learnerCourse.course_id} className="relative">
                {courseData.isLocked && (
                  <div className="absolute inset-0 z-10 border cursor-not-allowed rounded-lg flex items-center justify-center backdrop-blur-sm">
                    <div className="text-center text-white">
                      <Lock className="h-12 w-12 mx-auto mb-2 text-black" />
                      <p className="font-semibold text-black">Khóa học bị khóa</p>
                      <p className="text-sm mt-1 text-black">Hoàn thành khóa học trước để mở khóa</p>
                    </div>
                  </div>
                )}
                <CourseEnrolledCard
                  course={courseData.learnerCourse.course}
                  enrolledAt={courseData.learnerCourse.enrolledAt}
                  progress={courseData.progress}
                  isLocked={courseData.isLocked}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
