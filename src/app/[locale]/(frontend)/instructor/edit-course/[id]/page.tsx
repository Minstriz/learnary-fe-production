'use client';

import { useState, useEffect, use, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/app/lib/axios';
import { isAxiosError } from 'axios';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { ImageUploadDialog } from '@/components/UploadImageDialog';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, } from '@/components/ui/select';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger, } from "@/components/ui/accordion";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Loader2, ChevronLeft, Save, Send, PlusCircle, Trash2, GripVertical, Video, FileQuestion, Plus, X, Pencil, LayoutList } from 'lucide-react';
import { VideoUploadDialog } from '@/components/VideoUploadDialog';
import { useAuth } from '@/app/context/AuthContext';
import { formatNumberWithDots, parseNumberFromDots } from '@/utils/convert_price';
import { slugify } from '@/utils/utils';
import { toast } from 'sonner';
import Link from 'next/link';
type Category = { category_id: string; category_name: string; };
type Level = { level_id: string; level_name: string; };
type Option = { option_id?: string; option_content: string; is_correct: boolean; };
type Question = { question_id?: string; title: string; options: Option[]; };
type Quiz = { quiz_id?: string; title: string; questions: Question[]; };
type Lesson = {
    lesson_id: string;
    title: string;
    duration: string;
};

type Chapter = {
    chapter_id: string;
    chapter_title: string;
    lessons: Lesson[];
    quiz?: Quiz | null;
};

type Course = {
    course_id: string;
    title: string;
    description: string;
    price: number;
    requirement: string;
    thumbnail: string;
    status: 'Draft' | 'Pending' | 'Published' | 'Archived';
    category_id: string;
    level_id: string;
    chapter: Chapter[];
    admin_note?: string | null;
    sale_off?: number | null;
    createdAt?: string;
    updatedAt?: string;
};

type VideoStaging = Record<string, string>;

export default function EditCoursePage({ params }: { params: Promise<{ id: string }> }) {
    const { id: courseId } = use(params);
    const router = useRouter();
    const [course, setCourse] = useState<Course | null>(null);
    const [editLocked, setEditLocked] = useState(false);
    const [priceDisplay, setPriceDisplay] = useState<string>('');
    const [videoStaging, setVideoStaging] = useState<VideoStaging>({});
    const [categories, setCategories] = useState<Category[]>([]);
    const [levels, setLevels] = useState<Level[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
    const [newlyCreatedChapters, setNewlyCreatedChapters] = useState<string[]>([]);
    const [newlyCreatedLessons, setNewlyCreatedLessons] = useState<string[]>([]);
    // State cho giảm giá
    const [discountPercent, setDiscountPercent] = useState<number>(0);
    const { user, isLoggedIn, isLoading: isAuthLoading } = useAuth();

    // Tính giá sau khi giảm
    const discountedPrice = useMemo(() => {
        if (!course) return 0;
        if (!discountPercent || discountPercent <= 0) return course.price;
        return Math.max(0, Math.round(course.price * (1 - discountPercent / 100)));
    }, [course, discountPercent]);

    useEffect(() => {
        if (isAuthLoading) return;

        if (!isLoggedIn || user?.role !== "INSTRUCTOR" && user?.role !== "ADMIN") {
            toast.info('Bạn không có quyền truy cập trang này.');
            router.push(`/`);
            return;
        }
        const fetchData = async () => {
            try {
                const [cRes, catRes, lvlRes] = await Promise.all([
                    api.get(`/courses/${courseId}`),
                    api.get('/categories'),
                    api.get('/levels')
                ]);
                const courseData = (cRes.data.data || cRes.data) as Course;
                const newVideoStaging: VideoStaging = {};

                if (courseData.chapter) {
                    courseData.chapter.forEach((chap: Chapter) => {
                        chap.lessons?.forEach((lesson: Lesson & { video_url?: string }) => {
                            if (lesson.video_url) {
                                newVideoStaging[lesson.lesson_id] = lesson.video_url;
                                Reflect.deleteProperty(lesson, 'video_url'); // Xóa khỏi dữ liệu chính
                            }
                        });
                    });
                }

                setCourse(courseData);
                setPriceDisplay(courseData.price > 0 ? formatNumberWithDots(courseData.price) : '');
                setVideoStaging(newVideoStaging);
                setCategories(catRes.data.data || catRes.data);
                setLevels(lvlRes.data.data || lvlRes.data);
                // Nếu bị từ chối quá 3 ngày thì khóa sửa
                if (courseData.status === 'Archived' && courseData.updatedAt) {
                    const updatedAt = new Date(courseData.updatedAt);
                    const now = new Date();
                    const diffMs = now.getTime() - updatedAt.getTime();
                    const diffDays = diffMs / (1000 * 60 * 60 * 24 * 3);
                    if (diffDays > 3) {
                        setEditLocked(true);
                    } else {
                        setEditLocked(false);
                    }
                } else {
                    setEditLocked(false);
                }
                // Đồng bộ discountPercent với sale_off
                setDiscountPercent(courseData.sale_off ?? 0);
            } catch (err) {
                console.error(err);
                toast.info("Không thể tải dữ liệu. Vui lòng thử lại.");
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, [courseId, user, isAuthLoading, isLoggedIn, router]);

    // Cảnh báo khi rời trang mà chưa lưu
    useEffect(() => {
        const handleBeforeUnload = (e: BeforeUnloadEvent) => {
            if (hasUnsavedChanges) {
                e.preventDefault();
                e.returnValue = '';
            }
        };

        window.addEventListener('beforeunload', handleBeforeUnload);
        return () => window.removeEventListener('beforeunload', handleBeforeUnload);
    }, [hasUnsavedChanges]);

    // --- HELPER UPDATE STATE ---
    const updateCourseState = (callback: (currentCourse: Course) => void) => {
        setCourse((prev) => {
            if (!prev) return null;
            const newData = JSON.parse(JSON.stringify(prev)) as Course;
            callback(newData);
            setHasUnsavedChanges(true);
            return newData;
        });
    };

    // --- HANDLERS (Thêm/Sửa/Xóa) ---
    const handleAddChapter = async () => {
        if (!course) return;
        try {
            const response = await api.post(`/chapters`, {
                course_id: courseId,
                chapter_title: "Chương mới",
                order_index: course.chapter.length
            });

            const newChapter = response.data.data || response.data;
            setNewlyCreatedChapters(prev => [...prev, newChapter.chapter_id]);

            updateCourseState((draft) => {
                draft.chapter.push({
                    chapter_id: newChapter.chapter_id,
                    chapter_title: newChapter.chapter_title,
                    lessons: []
                });
            });
            toast.success("Đã thêm chương mới!");
        } catch (err) {
            console.error(err);
            toast.error("Không thể tạo chương. Vui lòng thử lại.");
        }
    };

    const handleDeleteChapter = async (index: number) => {
        if (!confirm("Bạn chắc chắn muốn xóa chương này?")) return;
        if (!course) return;

        const chapterIdToDelete = course.chapter[index]?.chapter_id;
        if (!chapterIdToDelete) return;

        try {
            await api.delete(`/chapters/${chapterIdToDelete}`);

            setNewlyCreatedChapters(prev => prev.filter(id => id !== chapterIdToDelete));

            updateCourseState((draft) => {
                draft.chapter.splice(index, 1);
            });
            toast.success("Đã xóa chương!");
        } catch (err) {
            console.error(err);
            toast.error("Không thể xóa chương. Vui lòng thử lại.");
        }
    };

    const handleAddLesson = async (chapterIndex: number) => {
        if (!course) return;
        const chapterId = course.chapter[chapterIndex].chapter_id;
        const lessonTitle = "Bài học mới";
        try {
            const response = await api.post(`/lessons`, {
                chapter_id: chapterId,
                title: lessonTitle,
                slug: slugify(lessonTitle),
                duration: "00:00"
            });
            const newLesson = response.data.data || response.data;
            setNewlyCreatedLessons(prev => [...prev, newLesson.lesson_id]);
            updateCourseState((draft) => {
                draft.chapter[chapterIndex].lessons.push({
                    lesson_id: newLesson.lesson_id,
                    title: newLesson.title,
                    duration: newLesson.duration
                });
            });
            toast.success("Đã thêm bài học mới!");
        } catch (err) {
            console.error('Error creating lesson:', err);
            if (isAxiosError(err)) {
                console.error('Response error:', err.response?.data);
                toast.error(err.response?.data?.message || "Không thể tạo bài học. Vui lòng thử lại.");
            } else {
                toast.error("Không thể tạo bài học. Vui lòng thử lại.");
            }
        }
    };

    const handleDeleteLesson = async (chapterIndex: number, lessonIndex: number) => {
        if (!confirm("Xóa bài học này?")) return;
        if (!course) return;

        const lessonIdToDelete = course.chapter[chapterIndex]?.lessons[lessonIndex]?.lesson_id;
        if (!lessonIdToDelete) return;

        try {
            await api.delete(`/lessons/${lessonIdToDelete}`);

            setNewlyCreatedLessons(prev => prev.filter(id => id !== lessonIdToDelete));

            updateCourseState((draft) => {
                draft.chapter[chapterIndex].lessons.splice(lessonIndex, 1);
            });

            // Xóa video khỏi staging (nếu có)
            setVideoStaging(prev => {
                const newStaging = { ...prev };
                delete newStaging[lessonIdToDelete];
                return newStaging;
            });

            toast.success("Đã xóa bài học!");
        } catch (err) {
            console.error(err);
            toast.error("Không thể xóa bài học. Vui lòng thử lại.");
        }
    };

    const handleVideoUrlChange = (lessonId: string, url: string) => {
        setVideoStaging(prev => ({
            ...prev,
            [lessonId]: url,
        }));
        setHasUnsavedChanges(true);
    };

    const rollbackChanges = async () => {
        try {
            for (const lessonId of newlyCreatedLessons) {
                await api.delete(`/lessons/${lessonId}`);
            }
            for (const chapterId of newlyCreatedChapters) {
                await api.delete(`/chapters/${chapterId}`);
            }
            setNewlyCreatedChapters([]);
            setNewlyCreatedLessons([]);
            setHasUnsavedChanges(false);
        } catch (err) {
            console.error('Error rolling back changes:', err);
        }
    };

    const hasAnyVideo = useMemo(() => {
        return Object.values(videoStaging).some(url => url && url.trim() !== '');
    }, [videoStaging]);

    const allChaptersHaveLessons = useMemo(() => {
        if (!course || !course.chapter || course.chapter.length === 0) return false;
        return course.chapter.every(c => c.lessons && c.lessons.length > 0);
    }, [course]);

    const allLessonsHaveVideo = useMemo(() => {
        if (!allChaptersHaveLessons || !course) return false;
        return course.chapter.every(c =>
            c.lessons.every(l => {
                const videoUrl = videoStaging[l.lesson_id];
                return videoUrl && videoUrl.trim() !== '';
            })
        );
    }, [course, videoStaging, allChaptersHaveLessons]);

    const allRequiredFieldsFilled = useMemo(() => {
        if (!course) return false;
        return (
            course.title.trim() !== '' &&
            course.category_id.trim() !== '' &&
            course.level_id.trim() !== '' &&
            course.price > 0 &&
            course.thumbnail.trim() !== '' &&
            course.requirement.trim() !== '' &&
            course.description.trim() !== ''
        );
    }, [course]);

    const canSaveDraft = !hasAnyVideo && course?.status === 'Draft';
    // Cho phép gửi duyệt lại nếu bị từ chối (Archived) hoặc là bản nháp (Draft)
    const canSubmit = allChaptersHaveLessons && allLessonsHaveVideo && allRequiredFieldsFilled && (course?.status === 'Draft' || course?.status === 'Archived');

    const handleAction = async (action: 'save' | 'submit') => {
        if (!course) return;
        setIsSaving(true);
        try {
            // Luôn đồng bộ sale_off với discountPercent trước khi gửi lên API
            const courseToSave = { ...course, sale_off: discountPercent };
            if (action === 'save') {
                if (course.status === 'Published') {
                    // Chỉ cho phép lưu thay đổi giá và level khi Published
                    await api.put(`/courses/draft/${courseId}`, courseToSave);
                    setHasUnsavedChanges(false);
                    setNewlyCreatedChapters([]);
                    setNewlyCreatedLessons([]);
                    toast.success("Đã lưu thay đổi giá thành công!");
                } else {
                    if (!canSaveDraft) {
                        toast.warning("Chỉ có thể lưu nháp khi chưa có video nào.");
                        return;
                    }
                    await api.put(`/courses/draft/${courseId}`, courseToSave);
                    setHasUnsavedChanges(false);
                    setNewlyCreatedChapters([]);
                    setNewlyCreatedLessons([]);
                    toast.success("Đã lưu bản nháp thành công! Bạn có thể xem tất cả khoá học của bạn tại trang khoá học của tôi!");
                }
            } else {
                if (!canSubmit) {
                    if (!allRequiredFieldsFilled) {
                        toast.error("Vui lòng điền đầy đủ tất cả thông tin bắt buộc (có dấu *)");
                        return;
                    }
                    if (!allChaptersHaveLessons) {
                        toast.error("Mỗi chương phải có ít nhất một bài học.");
                        return;
                    }
                    if (!allLessonsHaveVideo) {
                        toast.error("Tất cả bài học đều phải có video.");
                        return;
                    }
                    return;
                }

                const finalPayload = JSON.parse(JSON.stringify(courseToSave)) as Course;
                finalPayload.chapter.forEach((chap: Chapter) => {
                    chap.lessons.forEach((lesson: Lesson & { video_url?: string }) => {
                        if (videoStaging[lesson.lesson_id]) {
                            lesson.video_url = videoStaging[lesson.lesson_id];
                        }
                    });
                });
                await api.post(`/courses/submit/${courseId}`, finalPayload);
                setHasUnsavedChanges(false);
                setNewlyCreatedChapters([]);
                setNewlyCreatedLessons([]);
                toast.success("Đã gửi phê duyệt thành công!");
                router.push('/instructor/my-courses');
            }
        } catch (err) {
            let msg = "Có lỗi xảy ra.";
            if (isAxiosError(err) && err.response?.data?.message) {
                msg = err.response.data.message;
            } else if (err instanceof Error) {
                msg = err.message;
            }
            toast.error(msg);
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) return <div className="flex h-screen items-center justify-center"><Loader2 className="animate-spin h-8 w-8 text-primary" /></div>;
    if (!course) return <div className="p-10 text-center text-red-500">Không tìm thấy dữ liệu khóa học.</div>;
    if (isAuthLoading) {
        return (
            <div className="flex h-screen items-center justify-center">
                <Loader2 className="animate-spin text-primary" size={40} />
            </div>
        );
    }
    if (editLocked) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen p-10">
                <div className="p-6 bg-red-50 border border-red-200 rounded-md text-red-700 text-center max-w-lg">
                    <h2 className="font-bold text-lg mb-2">Bạn không thể chỉnh sửa khóa học này</h2>
                    <p>Khóa học đã bị từ chối và đã quá 3 ngày kể từ thời điểm bị từ chối. Nếu cần hỗ trợ, vui lòng liên hệ quản trị viên.</p>
                    <Button className="mt-6" onClick={() => router.push('/instructor/my-courses')}>Quay lại danh sách khóa học</Button>
                </div>
            </div>
        );
    }
    return (
        <div className="min-h-screen bg-slate-50/50 pb-32">
            {/* --- ADMIN NOTE (REJECTED) --- */}
            {course.status === 'Archived' && course.admin_note && (
                <div className="container mx-auto p-4 md:p-8">
                    <div className="mb-6 animate-in fade-in slide-in-from-top-2">
                        <div className="p-4 bg-red-50 border border-red-200 rounded-md flex flex-col gap-2 text-red-800 shadow-sm items-start">
                            <span className="font-bold text-sm uppercase">Khóa học của bạn đã bị từ chối.</span>
                            <div>
                                <span className="font-bold">Lý do từ chối: </span>
                                {course.admin_note}
                            </div>
                            <div className="text-sm mt-1">
                                Bạn có thể phản hồi lý do từ chối qua email trả lời trong vòng 3 ngày kể từ khi nhận được thông báo này. Sau 3 ngày, bạn sẽ không thể phản hồi nữa.
                            </div>
                        </div>
                    </div>
                </div>
            )}
            {/* --- HEADER STICKY --- */}
            <div className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b px-6 py-4 flex items-center justify-between shadow-sm">
                <div className="flex items-center gap-4">
                    <Button
                        variant="ghost"
                        size="icon"
                        className='hover:bg-gray-300 cursor-pointer'
                        onClick={async () => {
                            if (hasUnsavedChanges) {
                                const confirmed = confirm(
                                    'Bạn có thay đổi chưa lưu. Nếu rời trang, tất cả thay đổi mới tạo sẽ bị xóa. Bạn có chắc muốn rời trang?'
                                );
                                if (!confirmed) return;

                                await rollbackChanges();
                            }
                            router.push('/instructor/my-courses');
                        }}
                    >
                        <ChevronLeft />
                    </Button>
                    <div>
                        <h1 className="text-xl font-bold text-slate-900 truncate max-w-md">{course.title}</h1>
                        <div className="flex items-center gap-2 mt-1">
                            <Badge variant={course.status === 'Published' ? 'default' : 'secondary'}>
                                {course.status}
                            </Badge>
                            {isSaving && <span className="text-xs text-muted-foreground flex items-center"><Loader2 className="h-3 w-3 animate-spin mr-1" /> Đang lưu...</span>}
                        </div>
                    </div>
                </div>
                <div className="flex gap-2">
                    <Link href="/instructor/my-courses">
                        <Button variant="outline" className='cursor-pointer hover:bg-gray-200'>
                            <LayoutList className="w-4 h-4 mr-2" /> Khoá học của tôi
                        </Button>
                    </Link>
                    {course.status === 'Published' ? (
                        <Button
                            title="Lưu thay đổi giá khóa học"
                            variant="outline"
                            onClick={() => handleAction('save')}
                            disabled={isSaving}
                            className="cursor-pointer hover:bg-gray-200"
                        >
                            <Save className="w-4 h-4 mr-2" /> Lưu thay đổi
                        </Button>
                    ) : (
                        <Button
                            title='Bạn sẽ không thể lưu nháp nếu có video bài học'
                            variant="outline"
                            onClick={() => handleAction('save')}
                            disabled={!canSaveDraft || isSaving || course.status !== 'Draft'}
                            className={`${!canSaveDraft ? 'cursor-not-allowed hover:bg-gray-200' : 'cursor-pointer hover:bg-gray-200'}`}
                        >
                            <Save className="w-4 h-4 mr-2" /> Lưu nháp
                        </Button>
                    )}
                    <Button
                        title={!canSubmit ? 'Vui lòng điền đầy đủ thông tin và thêm video cho tất cả bài học' : 'Gửi khóa học để admin phê duyệt'}
                        onClick={() => handleAction('submit')}
                        disabled={!canSubmit || isSaving}
                        className={`${!canSubmit ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'} text-blue-600 bg-white border border-blue-600 hover:bg-blue-600 hover:text-white`}
                    >
                        <Send className="w-4 h-4 mr-2" /> Gửi duyệt
                    </Button>
                </div>
            </div>
            <div className="container mx-auto max-w-screen p-6 grid grid-cols-1 lg:grid-cols-12 gap-8">
                <div className="lg:col-span-4 space-y-6">
                    <Card>
                        <CardHeader className='flex flex-col items-center text-black '>
                            <CardTitle className='font-roboto-bold text-xl'>Thông tin cơ bản của khóa học</CardTitle>
                            <CardDescription className='text-sm font-robotoitalic'>Các thông tin cơ bản để học viên tìm thấy khóa học của bạn.</CardDescription>
                        </CardHeader>
                        <div className='h-px bg-linear-to-r from-transparent via-gray-300 to-transparent border-t'>
                        </div>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <div className='flex gap-1'>
                                    <Label className='text-blue-700 font-roboto-condensed-bold'>Tiêu đề</Label>
                                    <p className='text-red-600'>*</p>
                                </div>
                                <Input value={course.title} onChange={(e) => updateCourseState(d => d.title = e.target.value)} disabled={course.status === 'Published'} />
                            </div>
                            <div className="space-y-2">
                                <div className='flex gap-1'>
                                    <Label className='text-blue-700 font-roboto-condensed-bold'>Danh mục</Label>
                                    <p className='text-red-600'>*</p>
                                </div>
                                <Select value={course.category_id} onValueChange={(v) => updateCourseState(d => d.category_id = v)} disabled={course.status === 'Published'}>
                                    <SelectTrigger><SelectValue placeholder="Chọn danh mục" /></SelectTrigger>
                                    <SelectContent>
                                        {categories.map(c => <SelectItem key={c.category_id} value={c.category_id}>{c.category_name}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <div className='flex gap-1'>
                                    <Label className='text-blue-700 font-roboto-condensed-bold'>Cấp độ</Label>
                                    <p className='text-red-600'>*</p>
                                </div>
                                <Select value={course.level_id} onValueChange={(v) => updateCourseState(d => d.level_id = v)}>
                                    <SelectTrigger><SelectValue placeholder="Chọn cấp độ" /></SelectTrigger>
                                    <SelectContent>
                                        {levels.map(l => <SelectItem key={l.level_id} value={l.level_id}>{l.level_name}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            </div>
                            {/* Giá gốc */}
                            <div className="space-y-2">
                                <div className='flex gap-1'>
                                    <Label className='text-blue-700 font-roboto-condensed-bold'>Giá của khóa học</Label>
                                    <p className='text-red-600'>*</p>
                                </div>
                                <Input
                                    type="text"
                                    value={priceDisplay}
                                    onChange={(e) => {
                                        const rawValue = e.target.value.replace(/\./g, '');
                                        if (rawValue === '' || /^\d+$/.test(rawValue)) {
                                            const numValue = parseNumberFromDots(e.target.value);
                                            updateCourseState(d => d.price = numValue);
                                            setPriceDisplay(rawValue === '' ? '' : formatNumberWithDots(numValue));
                                        }
                                    }}
                                    placeholder="0"
                                />
                            </div>
                            {/* % Giảm giá */}
                            <div className="space-y-2 mt-2">
                                <div className='flex gap-1'>
                                    <Label className='text-blue-700 font-roboto-condensed-bold'>% Giảm giá</Label>
                                </div>
                                <Input
                                    type="number"
                                    min={0}
                                    max={100}
                                    step={10}
                                    value={discountPercent}
                                    onChange={e => {
                                        const val = e.target.value;
                                        if (val === '') {
                                            setDiscountPercent(0);
                                            updateCourseState(d => { d.sale_off = 0; });
                                            return;
                                        }
                                        let num = parseInt(val, 10);
                                        if (isNaN(num) || num < 0) num = 0;
                                        if (num > 100) num = 100;
                                        setDiscountPercent(num);
                                        updateCourseState(d => { d.sale_off = num; });
                                    }}
                                    placeholder="0"
                                    
                                />
                            </div>
                            {/* Giá sau khi giảm */}
                            <div className="space-y-2 mt-2">
                                <div className='flex gap-1'>
                                    <Label className='text-blue-700 font-roboto-condensed-bold'>Giá sau khi giảm</Label>
                                </div>
                                <Input
                                    type="text"
                                    value={formatNumberWithDots(discountedPrice)}
                                    disabled
                                />
                            </div>
                            <div className="space-y-2">
                                <div className='flex gap-1'>
                                    <Label className='text-blue-700 font-roboto-condensed-bold'>Ảnh bìa</Label>
                                    <p className='text-red-600'>*</p>
                                </div>
                                <ImageUploadDialog
                                    onUploadSuccess={(url) => { updateCourseState(d => d.thumbnail = `${url}t=${Date.now()}`) }}
                                    courseId={`${course.course_id}`}
                                    userId={`${user?.id}`}
                                    currentImageUrl={course.thumbnail ? `${course.thumbnail ?? ""}?t=${Date.now()}` : ""}
                                    disabled={course.status === 'Published'}
                                />
                            </div>
                            <div className="space-y-2">
                                <div className='flex gap-1'>
                                    <Label className='text-blue-700 font-roboto-condensed-bold'>Yêu cầu của khóa học</Label>
                                    <p className='text-red-600'>*</p>
                                </div>
                                <Textarea
                                    rows={4}
                                    value={course.requirement || ''}
                                    onChange={(e) => updateCourseState(d => d.requirement = e.target.value)}
                                    maxLength={350}
                                    disabled={course.status === 'Published'}
                                />
                                <p className="text-xs text-gray-500 text-right">
                                    {course.requirement?.length || 0}/350 ký tự
                                </p>
                            </div>
                            <div className="space-y-2">
                                <div className='flex gap-1'>
                                    <Label className='text-blue-700 font-roboto-condensed-bold'>Mô tả khóa học</Label>
                                    <p className='text-red-600'>*</p>
                                </div>
                                <Textarea
                                    rows={4}
                                    maxLength={500}
                                    value={course.description || ''}
                                    onChange={(e) => updateCourseState(d => d.description = e.target.value)}
                                    disabled={course.status === 'Published'}
                                />
                                <p className="text-xs text-gray-500 text-right">
                                    {course.description?.length || 0}/500 ký tự
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* CỘT PHẢI: NỘI DUNG KHÓA HỌC */}
                <div className="lg:col-span-8 space-y-6">
                    <div className="flex items-center justify-between ">
                        <h2 className="text-2xl font-bold text-slate-800">Nội dung</h2>
                        <Button size="lg" onClick={handleAddChapter} className='cursor-pointer' disabled={course.status === 'Published'}><PlusCircle className="w-4 h-4 mr-2 " /> Thêm chương</Button>
                    </div>
                    <Accordion type="multiple" className="w-full space-y-4" defaultValue={course.chapter.map(c => c.chapter_id)}>
                        {course.chapter.map((chapter, cIdx) => (
                            <AccordionItem key={chapter.chapter_id} value={chapter.chapter_id} className="border rounded-lg bg-white overflow-hidden">
                                <div className="flex items-center px-4 py-2 bg-slate-50/80 border-b">
                                    <GripVertical className="text-slate-400 mr-2 cursor-move" size={20} />
                                    <span className="font-semibold text-slate-500 mr-3 text-sm whitespace-nowrap">Chương {cIdx + 1}:</span>
                                    <Input
                                        className="border-transparent bg-transparent shadow-none font-bold text-slate-800 focus-visible:ring-0 px-2 h-9 flex-1 hover:bg-slate-100/50 focus:bg-white transition-all"
                                        value={chapter.chapter_title}
                                        onChange={(e) => updateCourseState(d => d.chapter[cIdx].chapter_title = e.target.value)}
                                        disabled={course.status === 'Published'}

                                    />
                                    <div className="flex items-center gap-1">
                                        <Button variant="ghost" size="icon" className="text-slate-400 hover:text-red-500" onClick={() => handleDeleteChapter(cIdx)} disabled={course.status === 'Published'}>
                                            <Trash2 size={18} />
                                        </Button>
                                        <AccordionTrigger className="py-0 hover:no-underline p-2" />
                                    </div>
                                </div>

                                <AccordionContent className="p-4 bg-slate-50/30 space-y-3">
                                    {/* Danh sách bài học */}
                                    {chapter.lessons.map((lesson, lIdx) => (
                                        <div key={lesson.lesson_id} className="flex items-start gap-3 p-3 bg-white border rounded-md shadow-sm group">
                                            <GripVertical className="text-slate-300 cursor-move mt-3" size={18} />
                                            <div className="flex-1 space-y-3">
                                                <div className="flex items-center gap-2">
                                                    <div className="p-2 bg-blue-50 text-blue-600 rounded-md">
                                                        <Video size={18} />
                                                    </div>
                                                    <Input
                                                        className="border-transparent shadow-none font-medium focus-visible:ring-0 px-2 h-auto py-1 flex-1 hover:underline focus:no-underline"
                                                        value={lesson.title}
                                                        onChange={(e) => updateCourseState(d => d.chapter[cIdx].lessons[lIdx].title = e.target.value)}
                                                        placeholder="Tên bài học"
                                                        disabled={course.status === 'Published'}
                                                    />
                                                    <Button variant="ghost" size="icon" className="text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => handleDeleteLesson(cIdx, lIdx)} disabled={course.status === 'Published'}>
                                                        <Trash2 size={16} />
                                                    </Button>
                                                </div>

                                                <div className="flex items-center gap-2 pl-10">
                                                    <VideoUploadDialog
                                                        lessonId={lesson.lesson_id}
                                                        currentVideoUrl={videoStaging[lesson.lesson_id]}
                                                        onUploadSuccess={(videoUrl) => handleVideoUrlChange(lesson.lesson_id, videoUrl)}
                                                        disabled={course.status === 'Published'}
                                                    />
                                                    {videoStaging[lesson.lesson_id] && (
                                                        <span className="text-xs text-green-600 flex items-center gap-1">
                                                            ✓ Đã có video
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))}

                                    <Button variant="ghost" className="w-full border border-dashed border-slate-300 text-slate-500 hover:text-primary hover:bg-primary/5" onClick={() => handleAddLesson(cIdx)} disabled={course.status === 'Published'}>
                                        <Plus className="w-4 h-4 mr-2" /> Thêm bài học
                                    </Button>

                                    {/* --- KHU VỰC QUIZ (Nằm ở cuối chương) --- */}
                                    <div className="mt-6 pt-4 border-t border-slate-200">
                                        <div className="flex items-center justify-between mb-3">
                                            <h4 className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                                                <FileQuestion className="text-orange-500" size={18} />
                                                Bài kiểm tra cuối chương
                                            </h4>
                                            {/* Dialog chỉnh sửa Quiz */}
                                            <QuizEditDialog
                                                quiz={chapter.quiz}
                                                onSave={(newQuiz) => updateCourseState(d => d.chapter[cIdx].quiz = newQuiz)}
                                                disabled={course.status === 'Published'}
                                            />
                                        </div>
                                        {chapter.quiz ? (
                                            <div className="p-3 bg-orange-50 border border-orange-200 rounded-md flex justify-between items-center">
                                                <div>
                                                    <p className="font-medium text-orange-900">{chapter.quiz.title}</p>
                                                    <p className="text-xs text-orange-700">{chapter.quiz.questions.length} câu hỏi</p>
                                                </div>
                                                <Badge variant="outline" className="border-orange-300 text-orange-700 bg-orange-100">Đã có</Badge>
                                            </div>
                                        ) : (
                                            <p className="text-xs text-slate-500 italic pl-7">Chương này chưa có bài kiểm tra.</p>
                                        )}
                                    </div>
                                </AccordionContent>
                            </AccordionItem>
                        ))}
                    </Accordion>

                    {course.chapter.length === 0 && (
                        <div className="text-center py-12 border-2 border-dashed rounded-xl">
                            <p className="text-muted-foreground mb-4">Chưa có nội dung nào.</p>
                            <Button onClick={handleAddChapter}>Thêm chương đầu tiên</Button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

// =========================================
// COMPONENT: QUIZ EDITOR DIALOG
// =========================================
interface QuizEditDialogProps {
    quiz?: Quiz | null;
    onSave: (q: Quiz | null) => void;
    disabled?: boolean;
}

function QuizEditDialog({ quiz, onSave, disabled }: QuizEditDialogProps) {
    // State nội bộ để edit trước khi save
    const [localQuiz, setLocalQuiz] = useState<Quiz>(
        quiz || { title: "Bài kiểm tra", questions: [] }
    );

    // Reset state khi mở dialog nếu quiz props thay đổi
    useEffect(() => {
        setLocalQuiz(quiz || { title: "Bài kiểm tra", questions: [] });
    }, [quiz]);

    const updateLocalQuiz = (fn: (q: Quiz) => void) => {
        setLocalQuiz(prev => {
            const newData = JSON.parse(JSON.stringify(prev));
            fn(newData);
            return newData;
        });
    };

    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button variant={quiz ? "outline" : "secondary"} size="sm" className="h-8" disabled={disabled}>
                    {quiz ? <><Pencil className="w-3.5 h-3.5 mr-1.5" /> Sửa Quiz</> : <><Plus className="w-3.5 h-3.5 mr-1.5" /> Thêm Quiz</>}
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto flex flex-col">
                <DialogHeader>
                    <DialogTitle>{quiz ? 'Chỉnh sửa bài kiểm tra' : 'Tạo bài kiểm tra mới'}</DialogTitle>
                </DialogHeader>

                <div className="flex-1 py-4 space-y-6 overflow-y-auto pr-2">
                    <div className="space-y-2">
                        <Label>Tiêu đề bài kiểm tra</Label>
                        <Input value={localQuiz.title} onChange={e => updateLocalQuiz(q => q.title = e.target.value)} placeholder="Ví dụ: Kiểm tra kiến thức chương 1" disabled={disabled} />
                    </div>

                    <div className="space-y-4">
                        <Label>Danh sách câu hỏi ({localQuiz.questions.length})</Label>
                        {localQuiz.questions.map((q, qIdx) => (
                            <div key={qIdx} className="p-4 border rounded-lg bg-slate-50 relative space-y-3">
                                <Button
                                    variant="ghost" size="icon"
                                    className="absolute top-2 right-2 text-slate-400 hover:text-red-500"
                                    onClick={() => updateLocalQuiz(draft => draft.questions.splice(qIdx, 1))}
                                    disabled={disabled}
                                >
                                    <Trash2 size={16} />
                                </Button>
                                <div className="pr-10">
                                    <Input
                                        className="font-medium bg-white"
                                        placeholder={`Câu hỏi ${qIdx + 1}`}
                                        onChange={e => updateLocalQuiz(draft => draft.questions[qIdx].title = e.target.value)}
                                        disabled={disabled}
                                    />
                                </div>
                                <div className="space-y-2 pl-4 border-l-2 border-slate-200 ml-1">
                                    {q.options.map((opt, oIdx) => (
                                        <div key={oIdx} className="flex items-center gap-2">
                                            <Switch
                                                checked={opt.is_correct}
                                                onCheckedChange={(checked) => updateLocalQuiz(draft => {
                                                    if (disabled) return;
                                                    if (checked) {
                                                        draft.questions[qIdx].options.forEach((o, i) => o.is_correct = i === oIdx);
                                                    } else {
                                                        draft.questions[qIdx].options[oIdx].is_correct = false;
                                                    }
                                                })}
                                                disabled={disabled}
                                            />
                                            <Input
                                                className={`flex-1 h-9 ${opt.is_correct ? 'border-green-500 bg-green-50/50' : 'bg-white'}`}
                                                value={opt.option_content}
                                                onChange={e => updateLocalQuiz(draft => draft.questions[qIdx].options[oIdx].option_content = e.target.value)}
                                                placeholder={`Lựa chọn ${oIdx + 1}`}
                                                disabled={disabled}
                                            />
                                            <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-300 hover:text-red-500" onClick={() => updateLocalQuiz(draft => draft.questions[qIdx].options.splice(oIdx, 1))} disabled={disabled}>
                                                <X size={16} />
                                            </Button>
                                        </div>
                                    ))}
                                    <Button variant="link" size="sm" className="h-auto p-0 text-blue-600" onClick={() => updateLocalQuiz(draft => draft.questions[qIdx].options.push({ option_content: '', is_correct: false }))} disabled={disabled}>
                                        <Plus className="w-3 h-3 mr-1" /> Thêm lựa chọn
                                    </Button>
                                </div>
                            </div>
                        ))}
                        <Button variant="outline" className="w-full border-dashed" onClick={() => updateLocalQuiz(draft => draft.questions.push({
                            title: '',
                            options: Array(2).fill(null).map(() => ({ option_content: '', is_correct: false }))
                        }))} disabled={disabled}>
                            <PlusCircle className="w-4 h-4 mr-2" /> Thêm câu hỏi
                        </Button>
                    </div>
                </div>
                <DialogFooter className="flex justify-between sm:justify-between gap-2 mt-4 pt-4 border-t">
                    {quiz ? (
                        <Button variant="destructive" onClick={() => { if (confirm("Xóa bài kiểm tra này?")) onSave(null); }} disabled={disabled}>
                            Xóa Quiz
                        </Button>
                    ) : <div></div>}
                    <div className="flex gap-2">
                        <DialogClose asChild><Button variant="outline" disabled={disabled}>Hủy</Button></DialogClose>
                        {/* Khi bấm Lưu, gọi onSave để đẩy dữ liệu ra component cha */}
                        <DialogClose asChild><Button onClick={() => onSave(localQuiz)} disabled={disabled}>Lưu Quiz</Button></DialogClose>
                    </div>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}