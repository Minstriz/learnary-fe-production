"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/app/context/AuthContext";
import api from "@/app/lib/axios";
import { toast } from "sonner";
import CourseEnrolledCard from "@/components/CourseEnrolledCard";
import { BookOpen, GraduationCap } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { LearnerCourse } from "@/type/course.type";

interface LessonProgressData {
  lesson_id: string;
  is_completed: boolean;
  completed_at: string | null;
  lesson: {
    chapter_id: string;
    belongChapter: {
      course_id: string;
    };
  };
}

interface CourseProgress {
  // Index Signature (chữ ký chỉ mục), cho phép object có số lượng properties động với type của key là string, còn tên key có thể là bất kì tên nào.
  /* SAU KHI MAP NÓ SẼ RA NHƯ NÀY
        const courseProgress: CourseProgress = {
      "course-123": {
        totalLessons: 10,
        completedLessons: 5,
        progress: 50
      },
      "course-456": {
        totalLessons: 20,
        completedLessons: 15,
        progress: 75
      },
      ...
    };
   */
  [course_id: string]: {
    totalLessons: number;
    completedLessons: number;
    progress: number;
  };
}

export default function LearnAreaPage() {
  const { isLoggedIn } = useAuth();
  const [courses, setCourses] = useState<LearnerCourse[]>([]);
  const [courseProgress, setCourseProgress] = useState<CourseProgress>({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (isLoggedIn) {
      fetchData();
    } else {
      setIsLoading(false);
    }
  }, [isLoggedIn]);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [coursesResponse, progressResponse] = await Promise.all([
        api.get("/learner-courses/my-courses"),
        api.get("/lesson-progress/my")
      ]);
      const coursesData = Array.isArray(coursesResponse.data.data) ? coursesResponse.data.data : [];
      const progressData: LessonProgressData[] = Array.isArray(progressResponse.data.data) ? progressResponse.data.data : [];
      const progressMap: CourseProgress = {};

      coursesData.forEach((enrolledCourse: LearnerCourse) => {
        const courseId = enrolledCourse.course_id;
        const totalLessons = enrolledCourse.course?.chapter?.reduce((total, chapter) => {
          return total + (chapter.lessons?.length || 0);
        }, 0) || 0;
        progressMap[courseId] = {
          totalLessons,
          completedLessons: 0,
          progress: 0
        };
      });

      progressData.forEach((lessonProgress) => {
        if (lessonProgress.is_completed) {
          const courseId = lessonProgress.lesson.belongChapter.course_id;
          if (progressMap[courseId]) {
            progressMap[courseId].completedLessons++;
          }
        }
      });

      Object.keys(progressMap).forEach(courseId => {
        const { totalLessons, completedLessons } = progressMap[courseId];
        progressMap[courseId].progress = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;
      });

      setCourses(coursesData);
      setCourseProgress(progressMap);
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Không thể tải dữ liệu");
      setCourses([]);
      setCourseProgress({});
    } finally {
      setIsLoading(false);
    }
  };
  const completedCount = Object.values(courseProgress).filter(p => p.progress >= 100).length;
  const inProgressCount = Object.values(courseProgress).filter(p => p.progress > 0 && p.progress < 100).length;

  if (!isLoggedIn) {
    return (
      <div className="container mx-auto py-16 px-4">
        <Card className="max-w-md mx-auto">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <GraduationCap className="h-16 w-16 text-gray-400 mb-4" />
            <h2 className="text-2xl font-bold mb-2">Vui lòng đăng nhập</h2>
            <p className="text-gray-600 text-center">
              Bạn cần đăng nhập để xem các khóa học đã đăng ký
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="container mx-auto py-16 px-4">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Đang tải khóa học...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8 w-full flex flex-col justify-center">
        <h1 className="text-3xl font-bold mb-2 self-center">Khu Vực Học Tập</h1>
        <p className="text-gray-600">
          Quản lý và tiếp tục học tập các khóa học của bạn
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-100 rounded-lg">
                <BookOpen className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Tổng khóa học</p>
                <p className="text-2xl font-bold">{courses.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-100 rounded-lg">
                <GraduationCap className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Đã hoàn thành</p>
                <p className="text-2xl font-bold">{completedCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-orange-100 rounded-lg">
                <BookOpen className="h-6 w-6 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Đang học</p>
                <p className="text-2xl font-bold">{inProgressCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {courses.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <BookOpen className="h-16 w-16 text-gray-400 mb-4" />
            <h3 className="text-xl font-semibold mb-2">Chưa có khóa học nào</h3>
            <p className="text-gray-600 mb-4 text-center">
              Bạn chưa đăng ký khóa học nào. Hãy khám phá và đăng ký các khóa học mới!
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((enrolledCourse) => (
            <CourseEnrolledCard
              key={enrolledCourse.course_id}
              course={enrolledCourse.course}
              enrolledAt={enrolledCourse.enrolledAt}
              progress={courseProgress[enrolledCourse.course_id]?.progress || 0}
            />
          ))}
        </div>
      )}
    </div>
  );
}