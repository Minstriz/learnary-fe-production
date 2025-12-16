"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/app/context/AuthContext";
import api from "@/app/lib/axios";
import { toast } from "sonner";
import CourseEnrolledCard from "@/components/CourseEnrolledCard";
import { BookOpen, GraduationCap } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { LearnerCourse } from "@/type/course.type";
import ListCourseOfCombo from "@/components/ListCourseOfCombo";

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
  [course_id: string]: {
    totalLessons: number;
    completedLessons: number;
    progress: number;
  };
}

interface CourseInGroup {
  group_id: string;
  course_id: string;
  order_index: number;
  createdAt: string;
  updateAt: string;
  belongToGroup: {
    group_id: string;
  };
}

interface ComboData {
  group_id: string;
  group_name: string;
  courses: Array<{
    learnerCourse: LearnerCourse;
    order_index: number;
    progress: number;
    isLocked: boolean;
  }>;
}

export default function LearnAreaPage() {
  const { isLoggedIn } = useAuth();
  const [courses, setCourses] = useState<LearnerCourse[]>([]);
  const [courseProgress, setCourseProgress] = useState<CourseProgress>({});
  const [isLoading, setIsLoading] = useState(true);
  const [comboCourses, setComboCourses] = useState<ComboData[]>([]);
  const [standaloneCourses, setStandaloneCourses] = useState<LearnerCourse[]>([]);


  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [coursesResponse, progressResponse] = await Promise.all([
        api.get("/learner-courses/my-courses"),
        api.get("/lesson-progress/my"),
      ]);

      const coursesData: LearnerCourse[] = Array.isArray(coursesResponse.data.data) ? coursesResponse.data.data : [];
      const progressData: LessonProgressData[] = Array.isArray(progressResponse.data.data) ? progressResponse.data.data : [];
      // Tính progress cho mỗi course
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

      // Nhóm courses theo combo
      await groupCoursesByCombo(coursesData, progressMap);

    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Không thể tải dữ liệu");
      setCourses([]);
      setCourseProgress({});
    } finally {
      setIsLoading(false);
    }
  }, []);
  useEffect(() => {
    if (isLoggedIn) {
      fetchData();
    } else {
      setIsLoading(false);
    }
  }, [isLoggedIn, fetchData]);
  const groupCoursesByCombo = async (coursesData: LearnerCourse[], progressMap: CourseProgress) => {
    try {
      const courseGroupMap: Map<string, CourseInGroup[]> = new Map();
      const groupPromises = coursesData.map(async (course) => {
        try {
          const response = await api.get(`/course-groups/find-group-of-course/${course.course_id.trim()}`);
          const groups: CourseInGroup[] = response.data.data || [];
          if (groups.length > 0) {
            courseGroupMap.set(course.course_id.trim(), groups);
          }
        } catch (error) {
          console.error(`Error fetching groups for course ${course.course_id}:`, error);
        }
      });

      await Promise.all(groupPromises);
      //nhóm các khóa học chung 1 group_id với nhau
      const groupCoursesMap: Map<string, Array<{
        learnerCourse: LearnerCourse;//course
        order_index: number;//vị trí của course trong group
      }>> = new Map();

      //set là ctdl để lưu trữ các giá trị duy nhất (unique), 1 set không có phép giá trị trùng lặp
      const coursesInCombo = new Set<string>();

      coursesData.forEach((course) => {
        const groups = courseGroupMap.get(course.course_id.trim());
        if (groups && groups.length > 0) {
          groups.forEach((groupInfo) => {
            const groupId = groupInfo.group_id.trim();
            if (!groupCoursesMap.has(groupId)) {
              groupCoursesMap.set(groupId, []);
            }
            groupCoursesMap.get(groupId)!.push({
              learnerCourse: course, //thông tin khóa học
              order_index: groupInfo.order_index //thứ tự học của khóa học trong group
            });
            coursesInCombo.add(course.course_id.trim());
          });
        }
      });

      //entrires() là lấy ra cặp key-value của mảng
      const comboDataPromises = Array.from(groupCoursesMap.entries()).map(async ([groupId, courses]) => {
        try {
          const groupResponse = await api.get(`/course-groups/${groupId}/courses`);
          const groupName = groupResponse.data[0]?.belongToGroup?.name || "Combo";
          courses.sort((a, b) => a.order_index - b.order_index);
          const coursesWithLockStatus = courses.map((courseData, index) => {
            const progress = progressMap[courseData.learnerCourse.course_id]?.progress || 0;
            let isLocked = false;
            if (index > 0) {
              const previousCourse = courses[index - 1];
              const previousProgress = progressMap[previousCourse.learnerCourse.course_id]?.progress || 0;
              isLocked = previousProgress < 100;
            }

            return {
              learnerCourse: courseData.learnerCourse,
              order_index: courseData.order_index,
              progress,
              isLocked
            };
          });

          return {
            group_id: groupId,
            group_name: groupName,
            courses: coursesWithLockStatus
          };
        } catch (error) {
          console.error(`Error fetching group details for ${groupId}:`, error);
          return null;
        }
      });
      const comboData = (await Promise.all(comboDataPromises)).filter((combo): combo is ComboData => combo !== null);
      setComboCourses(comboData);

      // Set standalone courses (courses không thuộc combo nào)
      const standalone = coursesData.filter((course) => !coursesInCombo.has(course.course_id.trim()));
      setStandaloneCourses(standalone);
    } catch (error) {
      console.error("Error grouping courses by combo:", error);
      toast.error("Không thể nhóm khóa học theo combo");
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
        <>
          {/* khóa học riêng lẻ */}
          {standaloneCourses.length > 0 && (
            <div>
              <h2 className="text-2xl font-bold mb-4">Khóa học của bạn</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {standaloneCourses.map((enrolledCourse) => (
                  <CourseEnrolledCard
                    key={enrolledCourse.course_id}
                    course={enrolledCourse.course}
                    enrolledAt={enrolledCourse.enrolledAt}
                    progress={courseProgress[enrolledCourse.course_id]?.progress || 0}
                    isLocked={false}
                  />
                ))}
              </div>
            </div>
          )}
          {/* khóa học theo combo */}
          {comboCourses.length > 0 && (
            <div className="mb-8 mt-10">
              <h2 className="text-2xl font-bold mb-4">Combo khóa học của bạn</h2>
              <div className="space-y-6">
                {comboCourses.map((combo) => (
                  <ListCourseOfCombo
                    key={combo.group_id}
                    group_id={combo.group_id}
                    group_name={combo.group_name}
                    courses={combo.courses}
                    courseProgress={courseProgress}
                  />
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}