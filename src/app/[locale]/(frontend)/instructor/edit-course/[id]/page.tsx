'use client';

import { useState, useEffect, use, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { v4 as uuidv4 } from 'uuid';
import api from '@/app/lib/axios';
import { isAxiosError } from 'axios';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, } from '@/components/ui/select';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger, } from "@/components/ui/accordion";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Loader2, ChevronLeft, Save, Send, PlusCircle, Trash2, GripVertical, Video, FileQuestion, Plus, X, Pencil } from 'lucide-react';
import { VideoUploadDialog } from '@/components/VideoUploadDialog';
import { useAuth } from '@/app/context/AuthContext';
import { toast } from "sonner";

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
};

type VideoStaging = Record<string, string>;

export default function EditCoursePage({ params }: { params: Promise<{ id: string }> }) {
    const { id: courseId } = use(params);
    const router = useRouter();
    const [course, setCourse] = useState<Course | null>(null);
    const [videoStaging, setVideoStaging] = useState<VideoStaging>({});
    const [categories, setCategories] = useState<Category[]>([]);
    const [levels, setLevels] = useState<Level[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const { user, isLoggedIn, isLoading: isAuthLoading } = useAuth();

    useEffect(() => {
        if (isAuthLoading) return;

        if (!isLoggedIn || user?.role !== "INSTRUCTOR") {
        toast.success('Bạn không có quyền truy cập trang này!');
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
                setVideoStaging(newVideoStaging);
                setCategories(catRes.data.data || catRes.data);
                setLevels(lvlRes.data.data || lvlRes.data);
            } catch (err) {
                console.error(err);
                 toast.success("Không thể tải dữ liệu. Vui lòng thử lại.");
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, [courseId, user,isAuthLoading, isLoggedIn, router]);

    // --- HELPER UPDATE STATE ---
    const updateCourseState = (callback: (currentCourse: Course) => void) => {
        setCourse((prev) => {
            if (!prev) return null;
            const newData = JSON.parse(JSON.stringify(prev)) as Course;
            callback(newData);
            return newData;
        });
    };

    // --- HANDLERS (Thêm/Sửa/Xóa) ---
    const handleAddChapter = () => {
        updateCourseState((draft) => {
            draft.chapter.push({
                chapter_id: `new_${uuidv4()}`,
                chapter_title: "Chương mới",
                lessons: []
            });
        });
    };

    const handleDeleteChapter = (index: number) => {
        if (!confirm("Bạn chắc chắn muốn xóa chương này?")) return;
        updateCourseState((draft) => {
            draft.chapter.splice(index, 1);
        });
    };

    const handleAddLesson = (chapterIndex: number) => {
        updateCourseState((draft) => {
            draft.chapter[chapterIndex].lessons.push({
                lesson_id: `new_${uuidv4()}`,
                title: "Bài học mới",
                duration: "00:00",
            });
        });
    };

    const handleDeleteLesson = (chapterIndex: number, lessonIndex: number) => {
        if (!confirm("Xóa bài học này?")) return;
        const lessonIdToDelete = course?.chapter[chapterIndex]?.lessons[lessonIndex]?.lesson_id;
        updateCourseState((draft) => {
            draft.chapter[chapterIndex].lessons.splice(lessonIndex, 1);
        });

        // Xóa video khỏi staging (nếu có)
        if (lessonIdToDelete) {
            setVideoStaging(prev => {
                const newStaging = {...prev};
                delete newStaging[lessonIdToDelete];
                return newStaging;
            });
        }
    };

    const handleVideoUrlChange = (lessonId: string, url: string) => {
        setVideoStaging(prev => ({
            ...prev,
            [lessonId]: url,
        }));
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
    const canSaveDraft = !hasAnyVideo && course?.status === 'Draft';
    const canSubmit = allChaptersHaveLessons && allLessonsHaveVideo && course?.status === 'Draft';

    // --- SAVE ACTIONS ---
    const handleAction = async (action: 'save' | 'submit') => {
        if (!course) return;
        setIsSaving(true);
        try {
            if (action === 'save') {
                if (!canSaveDraft) {
                     toast.error("Chỉ có thể lưu nháp khi chưa có video nào.");
                    return;
                }
                await api.put(`/courses/draft/${courseId}`, course);
                toast.success("Đã lưu bản nháp thành công!");
                router.push('/instructor/my-courses');
            } else {
                if (!canSubmit) {
                    toast.error("Tất cả lesson đều phải có video và chapter buộc phải có lesson.");
                    return;
                }

                // Gộp 'course' và 'videoStaging'
                const finalPayload = JSON.parse(JSON.stringify(course)) as Course;
                finalPayload.chapter.forEach((chap: Chapter) => {
                    chap.lessons.forEach((lesson: Lesson & { video_url?: string }) => {
                        if (videoStaging[lesson.lesson_id]) {
                            lesson.video_url = videoStaging[lesson.lesson_id];
                        }
                    });
                });

                await api.post(`/courses/submit/${courseId}`, finalPayload);
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
    return (
        <div className="min-h-screen bg-slate-50/50 pb-32">
            {/* --- HEADER STICKY --- */}
            <div className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b px-6 py-4 flex items-center justify-between shadow-sm">
                <div className="flex items-center gap-4">
                    <Link href="/instructor/my-courses" className=''>
                        <Button variant="ghost" size="icon" className=' hover:bg-gray-300 cursor-pointer'><ChevronLeft /></Button>
                    </Link>
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
                    <Button variant="outline" onClick={() => handleAction('save')} disabled={isSaving || course.status !== 'Draft'} className='cursor-pointer hover:bg-gray-200'>
                        <Save className="w-4 h-4 mr-2" /> Lưu nháp
                    </Button>
                    <Button onClick={() => handleAction('submit')} disabled={isSaving || course.status !== 'Draft'}>
                        <Send className="w-4 h-4 mr-2" /> Gửi duyệt
                    </Button>
                </div>
            </div>
            <div className="container mx-auto max-w-7xl p-6 grid grid-cols-1 lg:grid-cols-12 gap-8">
                <div className="lg:col-span-4 space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Thông tin khóa học</CardTitle>
                            <CardDescription>Các thông tin cơ bản để học viên tìm thấy khóa học của bạn.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label>Tiêu đề</Label>
                                <Input value={course.title} onChange={(e) => updateCourseState(d => d.title = e.target.value)} />
                            </div>
                            <div className="space-y-2">
                                <Label>Danh mục</Label>
                                <Select value={course.category_id} onValueChange={(v) => updateCourseState(d => d.category_id = v)}>
                                    <SelectTrigger><SelectValue placeholder="Chọn danh mục" /></SelectTrigger>
                                    <SelectContent>
                                        {categories.map(c => <SelectItem key={c.category_id} value={c.category_id}>{c.category_name}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label>Cấp độ</Label>
                                <Select value={course.level_id} onValueChange={(v) => updateCourseState(d => d.level_id = v)}>
                                    <SelectTrigger><SelectValue placeholder="Chọn cấp độ" /></SelectTrigger>
                                    <SelectContent>
                                        {levels.map(l => <SelectItem key={l.level_id} value={l.level_id}>{l.level_name}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            </div>
                             <div className="space-y-2">
                                <Label>Giá (VNĐ)</Label>
                                <Input type="number" min={0} value={course.price} onChange={(e) => updateCourseState(d => d.price = Number(e.target.value))} />
                            </div>
                             <div className="space-y-2">
                                <Label>Ảnh bìa (URL)</Label>
                                <Input value={course.thumbnail || ''} onChange={(e) => updateCourseState(d => d.thumbnail = e.target.value)} placeholder="https://..." />
                                {/* TODO: Thay bằng component Upload Image */}
                            </div>
                            <div className="space-y-2">
                                <Label>Mô tả ngắn</Label>
                                <Textarea rows={4} value={course.description || ''} onChange={(e) => updateCourseState(d => d.description = e.target.value)} />
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* CỘT PHẢI: NỘI DUNG KHÓA HỌC */}
                <div className="lg:col-span-8 space-y-6">
                    <div className="flex items-center justify-between ">
                        <h2 className="text-2xl font-bold text-slate-800">Nội dung</h2>
                        <Button size="lg" onClick={handleAddChapter} className='cursor-pointer'><PlusCircle className="w-4 h-4 mr-2 " /> Thêm chương</Button>
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
                                    />
                                    <div className="flex items-center gap-1">
                                        <Button variant="ghost" size="icon" className="text-slate-400 hover:text-red-500" onClick={() => handleDeleteChapter(cIdx)}>
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
                                                    />
                                                    <Button variant="ghost" size="icon" className="text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => handleDeleteLesson(cIdx, lIdx)}>
                                                        <Trash2 size={16} />
                                                    </Button>
                                                </div>
                                                
                                                <div className="flex items-center gap-2 pl-10">
                                                    <VideoUploadDialog
                                                        lessonId={lesson.lesson_id}
                                                        currentVideoUrl={videoStaging[lesson.lesson_id]}
                                                        onUploadSuccess={(videoUrl) => handleVideoUrlChange(lesson.lesson_id, videoUrl)}
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

                                    <Button variant="ghost" className="w-full border border-dashed border-slate-300 text-slate-500 hover:text-primary hover:bg-primary/5" onClick={() => handleAddLesson(cIdx)}>
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
function QuizEditDialog({ quiz, onSave }: { quiz?: Quiz | null | undefined, onSave: (q: Quiz | null) => void }) {
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
                <Button variant={quiz ? "outline" : "secondary"} size="sm" className="h-8">
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
                        <Input value={localQuiz.title} onChange={e => updateLocalQuiz(q => q.title = e.target.value)} placeholder="Ví dụ: Kiểm tra kiến thức chương 1" />
                    </div>

                    <div className="space-y-4">
                        <Label>Danh sách câu hỏi ({localQuiz.questions.length})</Label>
                        {localQuiz.questions.map((q, qIdx) => (
                            <div key={qIdx} className="p-4 border rounded-lg bg-slate-50 relative space-y-3">
                                <Button 
                                    variant="ghost" size="icon" 
                                    className="absolute top-2 right-2 text-slate-400 hover:text-red-500"
                                    onClick={() => updateLocalQuiz(draft => draft.questions.splice(qIdx, 1))}
                                >
                                    <Trash2 size={16} />
                                </Button>
                                <div className="pr-10">
                                    <Input 
                                        className="font-medium bg-white"
                                        placeholder={`Câu hỏi ${qIdx + 1}`} 
                                        onChange={e => updateLocalQuiz(draft => draft.questions[qIdx].title = e.target.value)}
                                    />
                                </div>
                                <div className="space-y-2 pl-4 border-l-2 border-slate-200 ml-1">
                                    {q.options.map((opt, oIdx) => (
                                        <div key={oIdx} className="flex items-center gap-2">
                                            <Switch 
                                                checked={opt.is_correct}
                                                onCheckedChange={(checked) => updateLocalQuiz(draft => {
                                                    // Nếu chọn đáp án này là đúng, các đáp án khác phải sai (nếu chỉ cho phép 1 đáp án đúng)
                                                    if (checked) {
                                                        draft.questions[qIdx].options.forEach((o, i) => o.is_correct = i === oIdx);
                                                    } else {
                                                        draft.questions[qIdx].options[oIdx].is_correct = false;
                                                    }
                                                })}
                                            />
                                            <Input 
                                                className={`flex-1 h-9 ${opt.is_correct ? 'border-green-500 bg-green-50/50' : 'bg-white'}`}
                                                value={opt.option_content}
                                                onChange={e => updateLocalQuiz(draft => draft.questions[qIdx].options[oIdx].option_content = e.target.value)}
                                                placeholder={`Lựa chọn ${oIdx + 1}`}
                                            />
                                            <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-300 hover:text-red-500" onClick={() => updateLocalQuiz(draft => draft.questions[qIdx].options.splice(oIdx, 1))}>
                                                <X size={16} />
                                            </Button>
                                        </div>
                                    ))}
                                    <Button variant="link" size="sm" className="h-auto p-0 text-blue-600" onClick={() => updateLocalQuiz(draft => draft.questions[qIdx].options.push({ option_content: '', is_correct: false }))}>
                                        <Plus className="w-3 h-3 mr-1" /> Thêm lựa chọn
                                    </Button>
                                </div>
                            </div>
                        ))}
                        <Button variant="outline" className="w-full border-dashed" onClick={() => updateLocalQuiz(draft => draft.questions.push({
                            title: '',
                            options: Array(2).fill(null).map(() => ({ option_content: '', is_correct: false }))
                        }))}>
                            <PlusCircle className="w-4 h-4 mr-2" /> Thêm câu hỏi
                        </Button>
                    </div>
                </div>
                <DialogFooter className="flex justify-between sm:justify-between gap-2 mt-4 pt-4 border-t">
                    {quiz ? (
                        <Button variant="destructive" onClick={() => { if(confirm("Xóa bài kiểm tra này?")) onSave(null); }}>
                            Xóa Quiz
                        </Button>
                    ) : <div></div>}
                    <div className="flex gap-2">
                        <DialogClose asChild><Button variant="outline">Hủy</Button></DialogClose>
                        {/* Khi bấm Lưu, gọi onSave để đẩy dữ liệu ra component cha */}
                        <DialogClose asChild><Button onClick={() => onSave(localQuiz)}>Lưu Quiz</Button></DialogClose>
                    </div>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}