"use client"
import React, { useEffect, useState, useCallback } from 'react'
import ChapterBox from '@/components/ChapterBox'
import { useIsMobile } from '@/hooks/useIsMobile'
import "plyr/dist/plyr.css";
import Video from "@/components/Video"
import NotesTab from '@/components/NotesTab';
import QuizDialog from '@/components/QuizDialog';
import { Course, Chapter, Lesson, Quiz, LessonProgressData, LessonProgressMap } from '@/type/course.type';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { TriangleAlert,Lock } from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';
import api from '@/app/lib/axios';
import { toast } from 'sonner';
import axios from 'axios';
import { useAuth } from '@/app/context/AuthContext';

const CourseDetailPage = () => {
  const user = useAuth();
  const isMobile = useIsMobile();
  const params = useParams();
  const router = useRouter();
  const slug = params?.slug as string;

  const [pageIsLoading, setPageIsLoading] = useState<boolean>(true);
  const [course, setCourse] = useState<Course | null>(null);
  const [currentLesson, setCurrentLesson] = useState<Lesson | null>(null);
  const [selectedQuiz, setSelectedQuiz] = useState<Quiz | null>(null);
  const [isQuizDialogOpen, setIsQuizDialogOpen] = useState(false);
  const [lessonProgress, setLessonProgress] = useState<LessonProgressMap>({});
  const [canLearn, setCanLearn] = useState(false);
  const [isCheckingAccess, setIsCheckingAccess] = useState(true);
  const verifiedLearnerCourse = useCallback(async () => {
    try {
      setIsCheckingAccess(true);
      const res = await api.get(`learner-courses/verifyLearnerCourse/${course?.course_id}`)
      if (res.status === 200 && res.data) {
        setCanLearn(true)
      }
      else {
        setCanLearn(false)
      }
    } catch (error) {
      console.log(error)
      setCanLearn(false);
      toast.error("Bạn không có quyền truy cập khóa học này!")
    } finally {
      setIsCheckingAccess(false);
    }
  }, [course?.course_id])

  const fetchCourse = useCallback(async () => {
    try {
      setPageIsLoading(true);
      const response = await api.get(`/courses/slug/${slug}`);
      const courseData: Course = response.data;
      setCourse(courseData);
      if (courseData.course_id) {
        await fetchLessonProgress(courseData.course_id);
      }
      if (courseData.chapter && courseData.chapter.length > 0) {
        const firstChapter = courseData.chapter[0];
        if (firstChapter.lessons && firstChapter.lessons.length > 0) {
          setCurrentLesson(firstChapter.lessons[0]);
        }
      }
    } catch (error) {
      console.error('Error fetching course:', error);
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 404) {
          toast.error('Không tìm thấy khóa học');
          router.push('/');
        } else if (error.response?.status === 401) {
          toast.error('Bạn không có quyền truy cập khóa học này');
          router.push('/');
        } else {
          toast.error('Có lỗi xảy ra khi tải khóa học');
        }
      } else {
        toast.error('Có lỗi xảy ra khi tải khóa học');
      }
    } finally {
      setPageIsLoading(false);
    }
  }, [router, slug]);
  useEffect(() => {
    if (slug) {
      fetchCourse();
    }
  }, [slug, fetchCourse]);

  useEffect(() => {
    if (course?.course_id) {
      verifiedLearnerCourse();
    }
  }, [course?.course_id, verifiedLearnerCourse]);

  const fetchLessonProgress = async (courseId: string) => {
    try {
      const response = await api.get(`/lesson-progress/course/${courseId}`);
      const progressData: LessonProgressData[] = response.data.data || [];

      const progressMap: LessonProgressMap = {};
      progressData.forEach((item) => {
        progressMap[item.lesson_id] = {
          is_completed: item.is_completed,
          completed_at: item.completed_at
        };
      });
      setLessonProgress(progressMap);
    } catch (error) {
      console.log(error)
      toast.error('Error fetching lesson progress:');
    }
  };

  const markLessonComplete = async (lessonId: string) => {
    try {
      await api.post('/lesson-progress/complete', {
        lesson_id: lessonId
      });
      setLessonProgress(prev => ({
        ...prev,
        [lessonId]: {
          is_completed: true,
          completed_at: new Date().toISOString()
        }
      }));
      toast.success('Đã đánh dấu hoàn thành bài học!');
    } catch (error) {
      console.error('Error marking lesson complete:', error);
      toast.error('Không thể cập nhật tiến độ');
    }
  };

  const handleVideoComplete = () => {
    if (currentLesson && !lessonProgress[currentLesson.lesson_id]?.is_completed) {
      markLessonComplete(currentLesson.lesson_id);
    }
  };

  const handleLessonSelect = (lesson: Lesson) => {
    setCurrentLesson(lesson);
  };

  const handleQuizSelect = (quiz: Chapter['quiz']) => {
    if (quiz) {
      setSelectedQuiz(quiz);
      setIsQuizDialogOpen(true);
    }
  };

  const handleQuizComplete = () => {
    toast.success('Chúc mừng bạn đã hoàn thành bài kiểm tra!');
  };

  if (pageIsLoading || isCheckingAccess) {
    return (
      <div className='w-full h-full flex items-center justify-center min-h-screen'>
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className='w-full h-full flex items-center justify-center min-h-screen'>
        <p>Không tìm thấy khóa học</p>
      </div>
    );
  }

  return canLearn ? (
    isMobile ? (
      <div className={`mt-0 h-full w-full `}>
        <div>
          <div className="flex flex-col p-3">
            <div className={`breadcrumb`}>
              <Breadcrumb>
                <BreadcrumbList>
                  <BreadcrumbItem>
                    <BreadcrumbLink href="/">Home</BreadcrumbLink>
                  </BreadcrumbItem>
                  <BreadcrumbSeparator />
                  <BreadcrumbItem>
                    <BreadcrumbLink href="/learn-area">Khu vực học tập</BreadcrumbLink>
                  </BreadcrumbItem>
                  <BreadcrumbSeparator />
                  <BreadcrumbItem>
                    <BreadcrumbPage>{course.title}</BreadcrumbPage>
                  </BreadcrumbItem>
                </BreadcrumbList>
              </Breadcrumb>
            </div>

            {currentLesson && (
              <div className='flex flex-col justify-items-center w-full '>
                <div className="video grow h-fit rounded overflow-hidden mt-4 ">
                  {currentLesson.video_url ? (
                    <Video
                      key={currentLesson.lesson_id}
                      video_url={currentLesson.video_url}
                      onCompleted={handleVideoComplete}
                    />
                  ) : (
                    <p className="text-center p-8">Video hiện tại đang lỗi! Chúng tôi đang cố gắng khắc phục, bạn kiên nhẫn nhé!</p>
                  )}
                </div>
                <div className="mb-3 pt-5 ml-1">
                  <h2 className="text-xl font-bold">{currentLesson.title}</h2>
                  {lessonProgress[currentLesson.lesson_id]?.is_completed && (
                    <p className="text-green-600 text-sm mt-1">✓ Đã hoàn thành</p>
                  )}
                </div>
                <div className="tab mt-3">
                  <NotesTab lessonId={currentLesson.lesson_id} />
                </div>
              </div>
            )}
          </div>

          <div className='ChapterBox flex justify-center items-center w-full mt-5'>
            <ChapterBox
              chapters={course.chapter || []}
              emptyState={'Chưa có bài học nào'}
              onLessonSelect={handleLessonSelect}
              onQuizSelect={handleQuizSelect}
              currentLessonId={currentLesson?.lesson_id}
              lessonProgress={lessonProgress}
            />
          </div>
        </div>

        {selectedQuiz && selectedQuiz.questions && (
          <QuizDialog
            user_id=''
            quiz={selectedQuiz as Quiz & { questions: NonNullable<Quiz['questions']> }}
            open={isQuizDialogOpen}
            onOpenChange={setIsQuizDialogOpen}
            onComplete={handleQuizComplete}
          />
        )}
      </div>
    ) : (
      <div className={`flex flex-col w-full h-screen pl-10 pr-20 pb-20`}>
        <div className='flex flex-col'>
          <div className="breadcrumb ml-5 pt-6 pb-3">
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbLink href="/">Home</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbLink href="/">Khu vực học tập</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage>{course.title}</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>

          <div className={`chapter_video_frame flex w-full gap-5`}>
            <ChapterBox
              chapters={course.chapter || []}
              emptyState={'Chưa có bài học nào'}
              onLessonSelect={handleLessonSelect}
              onQuizSelect={handleQuizSelect}
              currentLessonId={currentLesson?.lesson_id}
              lessonProgress={lessonProgress}
            />

            <div className="flex flex-col flex-1">
              {currentLesson && (
                <div className='pt-2'>
                  {currentLesson.video_url ? (
                    <Video
                      key={currentLesson.lesson_id}
                      video_url={currentLesson.video_url}
                      onCompleted={handleVideoComplete}
                    />
                  ) : (
                    <div className='flex flex-col items-center gap-10 border-red-500 border-2 rounded p-10'>
                      <TriangleAlert size={150} className='text-red-600' />
                      <p className="text-center text-red-500 font-bold">Video hiện tại đang lỗi! Chúng tôi đang cố gắng khắc phục, bạn kiên nhẫn nhé!</p>
                    </div>
                  )}
                  <div className="mb-3">
                    <h2 className="text-2xl font-bold pt-5">{currentLesson.title}</h2>
                    {currentLesson.duration && (
                      <p className="text-gray-500 mt-1">Thời lượng: {currentLesson.duration}</p>
                    )}
                    {lessonProgress[currentLesson.lesson_id]?.is_completed && (
                      <p className="text-green-600 text-sm mt-1">✓ Đã hoàn thành</p>
                    )}
                  </div>
                  <div className={`${isMobile ? 'tab mt-5 ml-5' : 'tab mt-5'}`}>
                    <NotesTab lessonId={currentLesson.lesson_id} />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {selectedQuiz && selectedQuiz.questions && (
          <QuizDialog
            user_id={user.user?.id ?? ""}
            quiz={selectedQuiz as Quiz & { questions: NonNullable<Quiz['questions']> }}
            open={isQuizDialogOpen}
            onOpenChange={setIsQuizDialogOpen}
            onComplete={handleQuizComplete}
          />
        )}
      </div>
    )
  ) : (
    <div className='font-roboto-bold text-2xl flex items-center justify-center w-full h-screen gap-10 flex-col'>
      <Lock size={100} className='text-red-800'></Lock>
      <p className='text-red-800'>Bạn không có quyền truy cập khóa học này</p>
    </div>
  )
}

export default CourseDetailPage