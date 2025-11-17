'use client';

import { useState, useEffect} from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import api from '@/app/lib/axios';
import { AxiosError } from 'axios';

// Import các component UI
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { BarChart2, Users, PlayCircle, Lock, FileQuestion, Eye, PauseCircle } from 'lucide-react';

import Video from '@/components/Video';

type Lesson = {
  lesson_id: string;
  title: string;
  duration: string;
  video_url?: string | null;
};
type Option = { option_id: string; option_content: string; is_correct: boolean };
type Question = { question_id: string; title: string; options: Option[] };
type Quiz = { quiz_id: string; title: string; questions: Question[]; };
type Chapter = {
  chapter_id: string;
  chapter_title: string;
  lessons: Lesson[];
  quiz?: Quiz | null;
};
type User = {
  fullName: string;
  avatar: string | null;
  bio: string | null;
};
type Instructor = {
  user: User;
};
type Course = {
  course_id: string;
  title: string;
  description: string;
  thumbnail: string;
  price: number;
  status: string;
  level: { level_name: string };
  category: { category_name: string };
  instructor: Instructor;
  chapter: Chapter[];
  _count: { chapter: number; lessons: number };
};

export default function CourseDetailPage() {
  const params = useParams();
  const id = params.id as string;

  const [course, setCourse] = useState<Course | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [currentVideoUrl, setCurrentVideoUrl] = useState<string | null>(null);
  const [selectedLessonId, setSelectedLessonId] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    const fetchCourse = async () => {
      try {
        setIsLoading(true);
        const response = await api.get(`/courses/${id}`);
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
    fetchCourse();
  }, [id]);

  useEffect(() => {
    if (course && course.chapter) {
      for (const chapter of course.chapter) {
        if (chapter.lessons && chapter.lessons.length > 0) {
          const firstLesson = chapter.lessons[0];
          setSelectedLessonId(firstLesson.lesson_id);
          if (firstLesson.video_url) {
            setCurrentVideoUrl(firstLesson.video_url);
          }
          return;
        }
      }
    }
  }, [course]);

  const handleLessonClick = (lesson: Lesson) => {
    setSelectedLessonId(lesson.lesson_id);
    setCurrentVideoUrl(lesson.video_url || null);
  };

  if (isLoading) return <CourseDetailSkeleton />;
  if (error) return <div className="container mx-auto p-6 text-red-500">Lỗi: {error}</div>;
  if (!course) return <div className="container mx-auto p-6">Không tìm thấy khóa học.</div>;

  return (
    <div className="container mx-auto max-w-6xl p-4 md:p-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* CỘT CHÍNH (BÊN TRÁI) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Thông tin chung */}
          <div className="space-y-3">
            <h1 className="text-3xl md:text-4xl font-bold">{course.title}</h1>
            <p className="text-lg text-muted-foreground">{course.description}</p>
            <div className="flex flex-wrap gap-2">
              <Badge variant="outline">{course.category?.category_name}</Badge>
              <Badge variant="outline">{course.level?.level_name}</Badge>
            </div>
          </div>

          {/* VIDEO PLAYER */}
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
            <Accordion type="multiple" className="w-full" defaultValue={course.chapter?.[0]?.chapter_id ? [course.chapter[0].chapter_id] : undefined}>
              {course.chapter.map((chapter) => {
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
                        {chapter.lessons?.map((lesson) => {
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
                        )})}

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
                                  {chapterQuiz.questions?.map((question, qIndex) => (
                                    <div key={question.question_id} className="space-y-4 p-4 bg-slate-50 rounded-lg border">
                                      <h4 className="text-base font-medium flex gap-2">
                                        <Badge variant="outline" className="h-fit">Câu {qIndex + 1}</Badge>
                                        <span>{question.title}</span>
                                      </h4>
                                      <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                        {question.options?.map((option, oIndex) => (
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

        {/* SIDEBAR (BÊN PHẢI) */}
        <div className="lg:col-span-1 space-y-6">
           <Card className="top-24 shadow-md border-t-4 border-t-primary">
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
                    src={course.instructor?.user?.avatar || '/default-avatar.png'}
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