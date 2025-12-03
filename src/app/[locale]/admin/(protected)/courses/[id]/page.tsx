"use client";

import React, { useEffect, useState } from "react";
import Image from 'next/image';
import { useParams, useRouter } from "next/navigation";
import api from "@/app/lib/axios";
import { toast } from "sonner";
// Icons
import {  Lesson, Chapter } from "@/type/course.type";
import {
    ArrowLeft, CheckCircle, XCircle, Eye, PlayCircle, 
    LayoutTemplate, MonitorPlay, Lock, PauseCircle, FileQuestion, Loader2
} from "lucide-react";
// UI Components
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea"; 
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
// Skeleton unused in this page; removed to avoid lint warnings
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import CourseHeader from '@/components/CourseHeader';
import CourseTabs from '@/components/CourseTabs';
import CourseOverview from '@/components/CourseOverview';
import CourseCurriculum from '@/components/CourseCurriculum';
import InstructorInfo from '@/components/InstructorInfo';
// import ReviewsList from '@/components/ReviewsList';
import CourseSidebar from '@/components/CourseSidebar';
import Video from '@/components/Video';
import { Chapter as ImportedChapter } from '@/type/course.type';
import { InstructorWithData } from '@/type/user.type';


type InstructorProfile = {
  instructor_id?: string;
  user: {
    fullName: string;
    avatar: string | null;
    bio: string | null;
  };
  total_students?: number;
  total_reviews?: number;
  rating?: number;
};

type Review = {
  id: string;
  user: {
    fullName: string;
    avatar: string | null;
  };
  rating: number;
  content: string;
  created_at: string;
};
type RatingDistribution = {
  [star: string]: number;
};

// Type tổng hợp cho Course Data
type CourseData = {
  course_id: string;
  title: string;
  description: string;
  thumbnail: string;
  slug: string;
  admin_note?: string;
  price: number;
  original_price?: number;
  sale_off?: boolean;
  status: "Draft" | "Published" | "Pending" | "Archived";
  category_name: string;
  category?: { category_name: string };
  level_name: string;
  level?: { level_name: string };
  instructor: InstructorProfile;
  rating?: number;
  total_reviews?: number;
  total_students?: number; 
  created_by?: string; 
  last_updated?: string; 
  updatedAt?: string;
  available_language: string;
  what_you_learn: string[];
  requirement: string[] | string; 
//   chapters: Chapter[];
  chapter?: Chapter[]; 
  total_lectures: number;
  total_hours: number;
  reviews: Review[];
  rating_distribution: RatingDistribution;
  includes: string[];
};

type ViewMode = "marketing" | "content";

// Type cho Error
interface ApiErrorResponse {
  response?: {
    data?: {
      message?: string;
      error?: string;
    };
    status?: number;
  };
  message?: string;
}

export default function AdminCourseDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = Array.isArray(params?.id) ? params?.id[0] : params?.id; 
  const [course, setCourse] = useState<CourseData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [processing, setProcessing] = useState<boolean>(false);
  const [viewMode, setViewMode] = useState<ViewMode>("marketing");
  const [currentVideoUrl, setCurrentVideoUrl] = useState<string | null>(null);
  const [selectedLessonId, setSelectedLessonId] = useState<string | null>(null);
  const [isApproveDialogOpen, setIsApproveDialogOpen] = useState<boolean>(false);
  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState<boolean>(false);
  const [rejectReason, setRejectReason] = useState<string>("");

  useEffect(() => {
    if (!id) return;
    const fetchCourse = async () => {
      try {
        setLoading(true);
        const res = await api.get<CourseData>(`/courses/${id}`); 
        if (res.data) {
            setCourse(res.data);
        }
      } catch (error) {
         const err = error as ApiErrorResponse;
         console.error("Lỗi tải khóa học:", err);
         toast.error(err.response?.data?.message || "Không thể tải thông tin khóa học");
      } finally {
        setLoading(false);
      }
    };
    fetchCourse();
  }, [id]);

  // --- Auto Select First Lesson for Content View ---
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

  // --- Handler Bài học ---
  const handleLessonClick = (lesson: Lesson) => {
    setSelectedLessonId(lesson.lesson_id);
    setCurrentVideoUrl(lesson.video_url || null);
  };

  // --- Actions ---
  const handleApprove = async () => {
    if (!id) return;
    try {
      setProcessing(true);
      await api.post(`/courses/admin/approve/${id}`);
      toast.success("Đã duyệt khóa học thành công!");
      setCourse(prev => prev ? { ...prev, status: 'Published' } : null);
      setIsApproveDialogOpen(false);
    } catch (error) {
      const err = error as ApiErrorResponse;
      console.error(err);
      toast.error(err.response?.data?.message || "Duyệt thất bại");
    } finally {
      setProcessing(false);
    }
  };

  const handleReject = async () => {
    if (!id) return;
    if (!rejectReason.trim()) {
        toast.error("Vui lòng nhập lý do từ chối để giảng viên biết cần sửa gì.");
        return;
    }
    try {
      setProcessing(true);
      await api.post(`/courses/admin/reject/${id}`, { reason: rejectReason });
      toast.success("Đã từ chối khóa học.");
      setCourse(prev => prev ? { ...prev, status: 'Archived' } : null);
      setIsRejectDialogOpen(false);
      setRejectReason("");
    } catch (error) {
      const err = error as ApiErrorResponse;
      console.error(err);
      toast.error(err.response?.data?.message || "Thao tác thất bại");
    } finally {
      setProcessing(false);
    }
  };
  if (loading) return (
      <div className="flex h-screen items-center justify-center">
          <Loader2 className="animate-spin text-primary" size={40} />
      </div>
  );

  if (!course) return <div className="p-10 text-center">Không tìm thấy khóa học</div>;
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

    const mappedChapters: ImportedChapter[] = (chaptersData || []).map((ch) => ({
        chapter_id: ch.chapter_id,
        course_id: course.course_id,
        chapter_title: ch.chapter_title,
        lessons: ch.lessons.map((les) => ({
            chapter_id: ch.chapter_id,
            isCompleted: false,
            slug: '',
            badge: '',
            order_index: 0,
            lesson_id: les.lesson_id,
            title: les.title,
            duration: les.duration,
            video_url: les.video_url || undefined
        })),
        order_index: 0,
        quiz: ch.quiz || undefined
    }));

  return (
    <div className="min-h-screen bg-gray-50/50 pb-10">
      
      {/* --- HEADER QUẢN TRỊ & SWITCHER --- */}
      <div className="sticky top-0 z-40 bg-white border-b shadow-sm px-6 py-4 flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
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
                    {course.status === 'Published' ? "Published" : 
                     course.status === 'Pending' ? "Pending" : 
                     course.status === 'Draft' ? "Draft" : "Archived"}
                </Badge>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
            {/* View Mode Switcher */}
            <div className="bg-slate-100 p-1 rounded-lg hidden md:flex">
                <button 
                    onClick={() => setViewMode('marketing')}
                    className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all flex items-center gap-2 ${viewMode === 'marketing' ? 'bg-white shadow text-blue-600' : 'text-slate-500 hover:text-slate-700'}`}
                >
                    <LayoutTemplate className="h-4 w-4" /> Trang giới thiệu
                </button>
                <button 
                    onClick={() => setViewMode('content')}
                    className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all flex items-center gap-2 ${viewMode === 'content' ? 'bg-white shadow text-blue-600' : 'text-slate-500 hover:text-slate-700'}`}
                >
                    <MonitorPlay className="h-4 w-4" /> Nội dung học
                </button>
            </div>

            {/* Approve/Reject Buttons */}
            {course.status === 'Pending' && (
                <>
                    <Separator orientation="vertical" className="h-8 mx-2 hidden sm:block" />
                    
                    {/* Dialog Từ Chối */}
                    <Dialog open={isRejectDialogOpen} onOpenChange={setIsRejectDialogOpen}>
                        <DialogTrigger asChild>
                            <Button variant="destructive" disabled={processing} size="sm">
                                <XCircle className="mr-2 h-4 w-4" /> 
                                <span className="hidden sm:inline">Từ chối</span>
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle className="text-red-600">Từ chối duyệt khóa học?</DialogTitle>
                                <DialogDescription>Khóa học sẽ bị chuyển về trạng thái <b>Nháp (Draft)</b> để giảng viên chỉnh sửa lại.</DialogDescription>
                            </DialogHeader>
                            <div className="py-4 space-y-2">
                            <Label htmlFor="reason" className="font-semibold">Lý do từ chối <span className="text-red-500">*</span></Label>
                            <Textarea 
                                id="reason"
                                placeholder="Ví dụ: Video bài 3 bị mất tiếng, nội dung chương 2 chưa chi tiết..."
                                value={rejectReason}
                                onChange={(e) => setRejectReason(e.target.value)}
                                className="min-h-[100px]"
                            />
                        </div>
                            <DialogFooter>
                                <Button variant="outline" onClick={() => setIsRejectDialogOpen(false)} disabled={processing}>Hủy bỏ</Button>
                                <Button variant="destructive" onClick={handleReject} disabled={processing}>Xác nhận từ chối</Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>

                    {/* Dialog Duyệt */}
                    <Dialog open={isApproveDialogOpen} onOpenChange={setIsApproveDialogOpen}>
                        <DialogTrigger asChild>
                            <Button className="bg-green-600 hover:bg-green-700" disabled={processing} size="sm">
                                <CheckCircle className="mr-2 h-4 w-4" /> 
                                <span className="hidden sm:inline">Duyệt</span>
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle className="text-green-600">Phê duyệt khóa học?</DialogTitle>
                                <DialogDescription>Khóa học sẽ được <b>Xuất bản (Published)</b> ngay lập tức và hiển thị cho học viên.</DialogDescription>
                            </DialogHeader>
                            <DialogFooter>
                                <Button variant="outline" onClick={() => setIsApproveDialogOpen(false)} disabled={processing}>Hủy bỏ</Button>
                                <Button className="bg-green-600 hover:bg-green-700" onClick={handleApprove} disabled={processing}>Xác nhận duyệt</Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </>
            )}
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
      {/* --- MAIN CONTENT --- */}
      <div className="container mx-auto p-4 md:p-8">
        
        {/* MARKETING / LANDING PAGE === */}
        {viewMode === 'marketing' && (
            <div className="animate-in fade-in zoom-in-95 duration-300">
                <CourseHeader
                    category_name={categoryName}
                    title={course.title}
                    description={course.description}
                    // Thêm fallback || 0 để tránh lỗi undefined.toLocaleString()
                    rating={course.rating || 0}
                    total_reviews={course.total_reviews || 0}
                    total_students={course.total_students || 0}
                    created_by={course.created_by || course.instructor?.user?.fullName || "Giảng viên"}
                    last_updated={formattedLastUpdated}
                    available_language={course.available_language}
                    level_name={levelName}
                />

                <div className="max-w-7xl mx-auto mt-8">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        <div className="lg:col-span-2">
                            <CourseTabs>
                                <TabsContent value="overview" className="mt-6">
                                    <CourseOverview 
                                        what_you_learn={course.what_you_learn} 
                                        requirement={requirementProp} 
                                    />
                                </TabsContent>

                                <TabsContent value="curriculum" className="mt-6">
                                    <CourseCurriculum 
                                        chapters={mappedChapters} 
                                        // total_lectures={course.total_lectures} 
                                        total_duration={`${course.total_hours} giờ`} 
                                    />
                                </TabsContent>

                                <TabsContent value="instructor" className="mt-6">
                                    <InstructorInfo instructor={course.instructor as unknown as InstructorWithData} />
                                </TabsContent>

                                <TabsContent value="reviews" className="mt-6">
                                    {/* <ReviewsList 
                                        rating={course.rating || 0} 
                                        total_reviews={course.total_reviews || 0} 
                                        rating_distribution={course.rating_distribution} 
                                        reviews={course.reviews} 
                                    /> */}
                                </TabsContent>
                            </CourseTabs>
                        </div>

                        <div className="lg:col-span-1">
                            <div className="sticky top-24">
                                <CourseSidebar
                                    course_slug={course.slug || "No Slug Found!"}
                                    thumbnail={course.thumbnail}
                                    price={course.price}
                                    original_price={course.original_price}
                                    // sale_off={course.sale_off}
                                    includes={mappedIncludes}
                                />
                                <div className="mt-4 bg-blue-50 text-blue-700 p-4 rounded-md text-sm border border-blue-200 flex gap-3 items-start shadow-sm">
                                    <Eye className="h-5 w-5 shrink-0 mt-0.5"/> 
                                    <div>
                                        <p className="font-bold mb-1">Chế độ xem trước</p>
                                        <p>Giao diện học viên nhìn thấy trước khi mua.</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )}

        {/* === VIEW 2: CONTENT / LEARNING VIEW === */}
        {viewMode === 'content' && (
             <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in fade-in zoom-in-95 duration-300">
                {/* CỘT TRÁI: VIDEO & PLAYER */}
                <div className="lg:col-span-2 space-y-6">
                     <div className="space-y-3">
                        <h1 className="text-2xl md:text-3xl font-bold">{course.title}</h1>
                        <p className="text-muted-foreground">{course.description}</p>
                        <div className="flex flex-wrap gap-2">
                            <Badge variant="outline">{categoryName}</Badge>
                            <Badge variant="outline">{levelName}</Badge>
                        </div>
                    </div>

                    {/* Video Player */}
                    <div className="relative w-full aspect-video rounded-lg overflow-hidden border bg-black shadow-lg z-10">
                        {currentVideoUrl ? (
                            <Video key={currentVideoUrl} video_url={currentVideoUrl} />
                        ) : (
                            <div className="relative w-full h-full flex flex-col items-center justify-center bg-black/80 p-4 text-center">
                                <div className="relative w-full h-full flex items-center justify-center">
                                    {course.thumbnail && (
                                        <Image 
                                            src={course.thumbnail} 
                                            alt="thumbnail" 
                                            fill 
                                            className="object-cover opacity-30"
                                        />
                                    )}
                                    <div className="z-10 flex flex-col items-center text-white/70">
                                        <Lock className="h-12 w-12 mb-2" />
                                        <p>Chọn bài học để xem video</p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Nội dung Accordion */}
                    <div className="space-y-4 pt-4">
                        <h2 className="text-2xl font-semibold">Nội dung khóa học</h2>
                        <Accordion type="multiple" className="w-full" defaultValue={chaptersData?.[0]?.chapter_id ? [chaptersData[0].chapter_id] : undefined}>
                            {chaptersData.map((chapter) => (
                                <AccordionItem value={chapter.chapter_id} key={chapter.chapter_id} className="border-b-0">
                                    <AccordionTrigger className="text-base font-medium px-4 hover:no-underline hover:bg-muted/50 rounded-md">
                                        <div className="flex items-center gap-2 text-left">{chapter.chapter_title}</div>
                                        <span className="ml-auto text-sm text-muted-foreground font-normal mr-4 shrink-0">
                                            {(chapter.lessons?.length || 0) + (chapter.quiz ? 1 : 0)} mục
                                        </span>
                                    </AccordionTrigger>
                                    
                                    <AccordionContent className="pt-2 pb-4 px-4">
                                        <ul className="space-y-1">
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
                                                    </li>
                                                );
                                            })}

                                            {/* Quiz Dialog */}
                                            {chapter.quiz && (
                                                <li className="mt-2">
                                                    <Dialog>
                                                        <DialogTrigger asChild>
                                                            <div className="flex items-center gap-3 p-3 rounded-md bg-orange-50/50 border border-orange-100/50 cursor-pointer hover:bg-orange-100/50 transition-colors">
                                                                <FileQuestion className="h-5 w-5 text-orange-500 shrink-0" />
                                                                <div className="flex-1 flex flex-col">
                                                                    <span className="text-sm font-medium text-orange-900">
                                                                        Bài kiểm tra: {chapter.quiz.title}
                                                                    </span>
                                                                    <span className="text-xs text-orange-700/70">
                                                                        {chapter.quiz.questions?.length || 0} câu hỏi
                                                                    </span>
                                                                </div>
                                                                <Eye className="h-4 w-4 text-orange-400" />
                                                            </div>
                                                        </DialogTrigger>
                                                        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
                                                            <DialogHeader>
                                                                <DialogTitle className="text-xl text-primary">{chapter.quiz.title}</DialogTitle>
                                                            </DialogHeader>
                                                            <div className="space-y-8 py-4">
                                                                {chapter.quiz.questions?.map((question, qIndex) => (
                                                                    <div key={question.question_id} className="space-y-4 p-4 bg-slate-50 rounded-lg border">
                                                                        <h4 className="text-base font-medium flex gap-2">
                                                                            <Badge variant="outline" className="h-fit">Câu {qIndex + 1}</Badge>
                                                                            <span>{question.title}</span>
                                                                        </h4>
                                                                        <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                                            {question.options?.map((option, oIndex) => (
                                                                                <li key={option.option_id} className={`flex items-start gap-3 p-3 rounded-md border bg-white ${option.is_correct ? 'border-green-300 bg-green-50/50' : 'border-slate-200'}`}>
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
                            ))}
                        </Accordion>
                    </div>
                </div>

                {/* Cột Phải: Rỗng (Để layout cân đối) */}
                <div className="hidden lg:block lg:col-span-1"></div>
             </div>
        )}
      </div>
    </div>
  );
}