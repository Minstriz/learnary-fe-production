'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import api from '@/app/lib/axios';
import { AxiosError } from 'axios';
import { useAuth } from "@/app/context/AuthContext";
// Import types
import { Chapter, Lesson, Question, Option } from '@/type/course.type';
import { InstructorWithData } from '@/type/user.type';
// Import các component UI
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart2, Users, PlayCircle, Lock, FileQuestion, Eye, PauseCircle, Loader2, AlertCircle, ChevronLeft, LayoutTemplate, MonitorPlay } from 'lucide-react';
import Video from '@/components/Video';
import { toast } from "sonner";
// Import course components
import CourseHeader from '@/components/CourseHeader';
import CourseTabs from '@/components/CourseTabs';
import CourseOverview from '@/components/CourseOverview';
import CourseCurriculum from '@/components/CourseCurriculum';
import InstructorInfo from '@/components/InstructorInfo';
import CourseSidebar from '@/components/CourseSidebar';

type ViewMode = "marketing" | "content";

type CourseData = {
  course_id: string;
  title: string;
  description: string;
  thumbnail: string;
  slug: string;
  admin_note?: string | null;
  price: number;
  original_price?: number;
  sale_off?: boolean;
  status: "Draft" | "Published" | "Pending" | "Archived";
  category_name?: string;
  category?: { category_name: string };
  level_name?: string;
  level?: { level_name: string };
  instructor: InstructorWithData;
  rating?: number;
  total_reviews?: number;
  total_students?: number;
  created_by?: string;
  last_updated?: string;
  updatedAt?: string;
  available_language?: string;
  what_you_learn?: string[];
  requirement?: string[] | string;
  chapter?: Chapter[];
  total_lectures?: number;
  total_hours?: number;
  includes?: string[];
  _count?: { chapter: number; lessons: number };
};

export default function CourseDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const { user, isLoggedIn, isLoading: isAuthLoading } = useAuth();
  const [course, setCourse] = useState<CourseData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>("marketing");
  const [currentVideoUrl, setCurrentVideoUrl] = useState<string | null>(null);
  const [selectedLessonId, setSelectedLessonId] = useState<string | null>(null);
  const fetchCourse = async (id: string) => {
    try {
      setIsLoading(true);
      const response = await api.get<CourseData>(`/courses/${id}`);
      setCourse(response.data);
    } catch (err) {
      let errorMessage = 'Không thể tải khóa học';
      if (err instanceof AxiosError) {
        errorMessage = err.response?.data?.message || err.message;
      }
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };
  useEffect(() => {
    if (isAuthLoading) return;
    if (!isLoggedIn || user?.role !== "INSTRUCTOR" && user?.role !== "ADMIN") {
      toast('Bạn không có quyền truy cập trang này.');
      router.push(`/`);
      return;
    }
    if (!id) return;
    fetchCourse(id);
  }, [id, isAuthLoading, isLoggedIn, user, router]);

  useEffect(() => {
    if (viewMode === 'content' && course) {
      const chapters = course.chapter || [];
      for (const chapter of chapters) {
        if (chapter.lessons && chapter.lessons.length > 0) {
          const firstLesson = chapter.lessons[0];
          if (!selectedLessonId) {
            setSelectedLessonId(firstLesson.lesson_id);
            if (firstLesson.video_url) {
              setCurrentVideoUrl(firstLesson.video_url);
            }
          }
          break;
        }
      }
    }
  }, [viewMode, course, selectedLessonId]);

  const handleLessonClick = (lesson: Lesson) => {
    setSelectedLessonId(lesson.lesson_id);
    setCurrentVideoUrl(lesson.video_url || null);
  };

  if (isLoading) return <CourseDetailSkeleton />;
  if (error) return <div className="container mx-auto p-6 text-red-500">Lỗi: {error}</div>;
  if (!course) return <div className="container mx-auto p-6">Không tìm thấy khóa học.</div>;
  if (isAuthLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="animate-spin text-primary" size={40} />
      </div>
    );
  }

  const chaptersData = course.chapter || [];
  const categoryName = course.category_name || course.category?.category_name || "";
  const levelName = course.level_name || course.level?.level_name || "";
  const formattedLastUpdated = course.last_updated || (course.updatedAt ? new Date(course.updatedAt).toLocaleDateString('vi-VN') : new Date().toLocaleDateString('vi-VN'));
  const requirementProp = Array.isArray(course.requirement) 
    ? course.requirement.join('\n') 
    : course.requirement || "";

  const mappedIncludes = (course.includes || []).map(item => ({
    icon: "check-circle",
    text: item
  }));

  const mappedChapters: Chapter[] = (chaptersData || []).map((ch) => ({
    chapter_id: ch.chapter_id,
    course_id: course.course_id,
    chapter_title: ch.chapter_title || "",
    lessons: ch.lessons || [],
    order_index: ch.order_index || 0,
    quiz: ch.quiz || undefined
  }));

  return (
    <div className="min-h-screen bg-gray-50/50 pb-10">
      {/* HEADER WITH VIEW SWITCHER */}
      <div className="sticky top-0 z-40 bg-white border-b shadow-sm px-6 py-4 flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link href="/instructor/my-courses">
            <Button variant="ghost" size="icon" className="hover:bg-gray-300 cursor-pointer">
              <ChevronLeft />
            </Button>
          </Link>
          <div>
            <h1 className="text-lg font-bold line-clamp-1 max-w-[300px] md:max-w-md" title={course.title}>
              {course.title}
            </h1>
            <div className="flex items-center gap-2 text-xs mt-1">
              <Badge 
                className={
                  course.status === 'Published' ? "bg-green-600 hover:bg-green-700" : 
                  course.status === 'Pending' ? "bg-amber-500 hover:bg-amber-600" : "bg-gray-500"
                }
              >
                {course.status}
              </Badge>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* View Mode Switcher */}
          <div className="bg-slate-100 p-1 rounded-lg hidden md:flex">
            <button 
              onClick={() => setViewMode('marketing')}
              className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all flex items-center gap-2 ${
                viewMode === 'marketing' ? 'bg-white shadow text-blue-600' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              <LayoutTemplate className="h-4 w-4" /> Trang giới thiệu
            </button>
            <button 
              onClick={() => setViewMode('content')}
              className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all flex items-center gap-2 ${
                viewMode === 'content' ? 'bg-white shadow text-blue-600' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              <MonitorPlay className="h-4 w-4" /> Nội dung học
            </button>
          </div>
        </div>
      </div>

      {/* Mobile View Switcher */}
      <div className="md:hidden px-4 py-3 bg-white border-b flex justify-center shadow-sm">
        <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as ViewMode)} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="marketing">Giới thiệu</TabsTrigger>
            <TabsTrigger value="content">Bài học</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* ADMIN NOTE */}
      {(course.status === 'Archived' || (course.status === 'Draft' && course.admin_note)) && course.admin_note && (
        <div className="container mx-auto p-4 md:p-8">
          <div className="mb-6 animate-in fade-in slide-in-from-top-2">
            <div className="p-4 bg-red-50 border border-red-200 rounded-md flex gap-3 text-red-800 shadow-sm items-start">
              <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold text-sm uppercase">Khóa học cần chỉnh sửa</h4>
                <p className="text-sm mt-1 font-medium">
                  <span className="font-bold">Lý do từ chối: </span>
                  {course.admin_note}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MAIN CONTENT */}
      <div className="container mx-auto p-4 md:p-8">
        {/* MARKETING VIEW */}
        {viewMode === 'marketing' && (
          <div className="animate-in fade-in zoom-in-95 duration-300">
            <CourseHeader
              category_name={categoryName}
              title={course.title}
              description={course.description}
              rating={course.rating || 0}
              total_reviews={course.total_reviews || 0}
              total_students={course.total_students || 0}
              created_by={course.created_by || course.instructor?.user?.fullName || "Giảng viên"}
              last_updated={formattedLastUpdated}
              available_language={course.available_language || "Tiếng Việt"}
              level_name={levelName}
            />

            <div className="max-w-7xl mx-auto mt-8">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2">
                  <CourseTabs>
                    <TabsContent value="overview" className="mt-6">
                      <CourseOverview 
                        what_you_learn={course.what_you_learn || []} 
                        requirement={requirementProp} 
                      />
                    </TabsContent>

                    <TabsContent value="curriculum" className="mt-6">
                      <CourseCurriculum 
                        chapters={mappedChapters} 
                        total_duration={`${course.total_hours || 0} giờ`} 
                      />
                    </TabsContent>

                    <TabsContent value="instructor" className="mt-6">
                      <InstructorInfo instructor={course.instructor} />
                    </TabsContent>
                  </CourseTabs>
                </div>

                <div className="lg:col-span-1">
                  <div className="sticky top-24">
                    <CourseSidebar
                      course_id={course.course_id}
                      course_slug={course.slug || ""}
                      thumbnail={course.thumbnail}
                      price={course.price}
                      original_price={course.original_price}
                      includes={mappedIncludes}
                      isPreviewMode={true}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {viewMode === 'content' && (
          <div className="animate-in fade-in zoom-in-95 duration-300">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-6">
                <div className="relative w-full aspect-video rounded-lg overflow-hidden border bg-black shadow-lg z-10">
            {currentVideoUrl ? (
              <Video key={currentVideoUrl} video_url={currentVideoUrl} />
            ) : (
              <div className="relative w-full h-full flex items-center justify-center">
                <Image
                  src={course.thumbnail || '/placeholder-image.jpg'}
                  alt={course.title}
                  fill
                  className="object-cover opacity-50"
                  priority
                />
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 p-4 text-center">
                  <Lock className="h-12 w-12 text-white/50 mb-2" />
                  <p className="text-white font-medium">Bài học này không có video xem trước.</p>
                </div>
              </div>
            )}
          </div>

              {/* NỘI DUNG KHÓA HỌC */}
              <div className="space-y-4 pt-4">
                <h2 className="text-2xl font-semibold">Nội dung khóa học</h2>
                <Accordion type="multiple" className="w-full" defaultValue={chaptersData?.[0]?.chapter_id ? [chaptersData[0].chapter_id] : undefined}>
                  {chaptersData.map((chapter: Chapter) => {
                const chapterQuiz = chapter.quiz;
                return (
                  <AccordionItem value={chapter.chapter_id} key={chapter.chapter_id}>
                    <AccordionTrigger className="text-base font-medium px-4 hover:no-underline hover:bg-muted/50 rounded-md">
                      <div className="flex items-center gap-2 text-left">{chapter.chapter_title}</div>
                      <span className="ml-auto text-sm text-muted-foreground font-normal mr-4 shrink-0">
                        {(chapter.lessons?.length || 0) + (chapterQuiz ? 1 : 0)} mục
                      </span>
                    </AccordionTrigger>

                    <AccordionContent className="pt-2 pb-4 px-4">
                      <ul className="space-y-1">
                          {/* DANH SÁCH BÀI HỌC */}
                          {chapter.lessons?.map((lesson: Lesson) => {
                          const isSelected = lesson.lesson_id === selectedLessonId;
                          const canPlay = !!lesson.video_url;
                          return (
                            <li
                              key={lesson.lesson_id}
                              onClick={() => handleLessonClick(lesson)}
                              className={`flex items-center gap-3 p-3 rounded-md transition-colors border ${canPlay ? 'cursor-pointer' : 'opacity-60 cursor-not-allowed'} ${isSelected ? 'bg-primary/10 border-primary/30' : 'border-transparent hover:bg-muted/80'}`}
                            >
                              {isSelected && canPlay ? (
                                <PauseCircle className="h-5 w-5 text-primary animate-pulse shrink-0" />
                              ) : canPlay ? (
                                <PlayCircle className="h-5 w-5 text-muted-foreground shrink-0" />
                              ) : (
                                <Lock className="h-4 w-4 text-muted-foreground/50 shrink-0" />
                              )}
                              <span className={`flex-1 text-sm font-medium line-clamp-2 ${isSelected ? 'text-primary' : ''}`}>
                                {lesson.title}
                              </span>
                              <span className="text-xs text-muted-foreground shrink-0">{lesson.duration || '00:00'}</span>
                              {canPlay && (
                                <Badge variant={isSelected ? "default" : "secondary"} className="text-[10px] px-2 py-0.5 shrink-0">
                                  {isSelected ? 'Đang xem' : 'Xem thử'}
                                </Badge>
                              )}
                            </li>
                          )
                        })}

                        {/* QUIZ SECTION (CÓ DIALOG) */}
                        {chapterQuiz && (
                          <li className="mt-2">
                            <Dialog>
                              <DialogTrigger asChild>
                                <div className="flex items-center gap-3 p-3 rounded-md bg-orange-50/50 border border-orange-100/50 cursor-pointer hover:bg-orange-100/50 transition-colors">
                                  <FileQuestion className="h-5 w-5 text-orange-500 shrink-0" />
                                  <div className="flex-1 flex flex-col">
                                    <span className="text-sm font-medium text-orange-900">
                                      Bài kiểm tra: {chapterQuiz.title}
                                    </span>
                                    <span className="text-xs text-orange-700/70">
                                      {chapterQuiz.questions?.length || 0} câu hỏi
                                    </span>
                                  </div>
                                  <Eye className="h-4 w-4 text-orange-400" />
                                </div>
                              </DialogTrigger>
                              <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
                                <DialogHeader>
                                  <DialogTitle className="text-xl text-primary">{chapterQuiz.title}</DialogTitle>
                                </DialogHeader>
                                <div className="space-y-8 py-4">
                                  {chapterQuiz.questions?.map((question: Question, qIndex: number) => (
                                    <div key={question.question_id} className="space-y-4 p-4 bg-slate-50 rounded-lg border">
                                      <h4 className="text-base font-medium flex gap-2">
                                        <Badge variant="outline" className="h-fit">Câu {qIndex + 1}</Badge>
                                        <span>{question.title}</span>
                                      </h4>
                                      <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                        {question.options?.map((option: Option, oIndex: number) => (
                                          <li
                                            key={option.option_id}
                                            className={`flex items-start gap-3 p-3 rounded-md border bg-white ${option.is_correct ? 'border-green-300 bg-green-50/50' : 'border-slate-200'}`}
                                          >
                                            <span className={`flex items-center justify-center w-6 h-6 rounded-full border text-xs font-bold shrink-0 ${option.is_correct ? 'bg-green-100 border-green-300 text-green-700' : 'bg-slate-100 border-slate-300 text-slate-600'}`}>
                                              {String.fromCharCode(65 + oIndex)}
                                            </span>
                                            <span className="text-sm pt-0.5">{option.option_content}</span>
                                          </li>
                                        ))}
                                      </ul>
                                    </div>
                                  ))}
                                </div>
                              </DialogContent>
                            </Dialog>
                          </li>
                        )}
                      </ul>
                    </AccordionContent>
                  </AccordionItem>
                );
              })}
            </Accordion>
          </div>
        </div>

        {/* SIDEBAR PHẢI */}
        <div className="lg:col-span-1 space-y-6">
          <Card className="sticky top-24 shadow-md border-t-4 border-t-primary">
            <CardHeader className="pb-2">
              <h3 className="text-3xl font-bold text-center text-primary">
                {course.price > 0 ? `${Number(course.price).toLocaleString('vi-VN')} đ` : 'Miễn phí'}
              </h3>
            </CardHeader>
            <CardContent className="space-y-6">
              <Button size="lg" className="w-full text-lg font-semibold">Đăng ký học ngay</Button>
              <div className="space-y-3 text-sm text-muted-foreground bg-muted/30 p-4 rounded-lg">
                <div className="flex items-center gap-3">
                  <BarChart2 className="h-5 w-5 text-primary/70" />
                  <span>Trình độ: <span className="font-medium text-foreground">{course.level?.level_name}</span></span>
                </div>
                <div className="flex items-center gap-3">
                  <Users className="h-5 w-5 text-primary/70" />
                  <span>Học viên: <span className="font-medium text-foreground">1,234</span></span>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="shadow-sm">
            <CardHeader className="flex flex-row items-center gap-4 pb-2">
              <div className="relative h-16 w-16 min-w-16">
                {/* <Image
                    src={course.instructor?.user?.avatar || '/images/temp/Profile-PNG-Photo.png'}
                    alt={course.instructor?.user?.fullName || 'Giảng viên'}
                    fill
                    className="rounded-full object-cover border-2 border-primary/10"
                  /> */}
              </div>
              <div className="overflow-hidden">
                <CardTitle className="text-lg truncate">{course.instructor?.user?.fullName || 'Thông tin giảng viên'}</CardTitle>
                <Badge variant="secondary" className="mt-1">Giảng viên</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground line-clamp-4 italic">
                {course.instructor?.user?.bio || 'Giảng viên chưa cập nhật thông tin giới thiệu.'}
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )}
      </div>
    </div>
  );
}

// Skeleton Component
function CourseDetailSkeleton() {
  return (
    <div className="container mx-auto max-w-6xl p-4 md:p-6 animate-pulse">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Skeleton className="h-12 w-3/4 rounded-md" />
          <Skeleton className="h-6 w-full rounded-md" />
          <Skeleton className="h-6 w-2/3 rounded-md" />
          <Skeleton className="relative w-full aspect-video rounded-xl" />
          <div className="space-y-2 pt-4">
            <Skeleton className="h-8 w-1/3 rounded-md" />
            <Skeleton className="h-12 w-full rounded-md" />
            <Skeleton className="h-12 w-full rounded-md" />
          </div>
        </div>
        <div className="lg:col-span-1 space-y-6">
          <Skeleton className="h-[300px] w-full rounded-xl" />
          <Skeleton className="h-[150px] w-full rounded-xl" />
        </div>
      </div>
    </div>
  );
}