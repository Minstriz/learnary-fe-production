"use client";
import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { TabsContent } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import CourseHeader from '@/components/CourseHeader';
import CourseTabs from '@/components/CourseTabs';
import CourseOverview from '@/components/CourseOverview';
import CourseCurriculum from '@/components/CourseCurriculum';
import InstructorInfo from '@/components/InstructorInfo';
/* import ReviewsList from '@/components/ReviewsList'; */
import CourseSidebar from '@/components/CourseSidebar';
import api from '@/app/lib/axios';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb';
import { useIsMobile } from '@/hooks/useIsMobile';
import { Course } from '@/type/course.type';
import { DEFAULT_LANGUAGE, PLACEHOLDER_THUMBNAIL } from '@/const/urls';
import { useAuth } from '@/app/context/AuthContext';
import { isAxiosError } from 'axios';
import { toast } from 'sonner';
import FeedbackBox from '@/components/FeedbackBox';
export default function CourseDetailPage() {
    const params = useParams();
    const router = useRouter();
    const slug = params?.slug;
    const isMobile = useIsMobile();
    const { user, isLoggedIn } = useAuth();
    const [courseData, setCourseData] = useState<Course | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isPaying, setIsPaying] = useState(false);
    const [canLearn, setCanLearn] = useState(false);
    useEffect(() => {
        const fetchCourseData = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const response = await api.get(`/courses/slug/${slug}`);
                if (response.data && response.status === 200) {
                    setCourseData(response.data);
                }
                if (isLoggedIn && user?.id) {
                    try {
                        const enrolledCourseRes = await api.get(`/learner-courses/my-courses`);
                        const enrolledCourses: Course[] = enrolledCourseRes.data?.data || enrolledCourseRes.data || [];
                        const isEnrolled = enrolledCourses.some((item: Course) => item.course_id?.trim() === response.data.course_id.trim());
                        setCanLearn(isEnrolled);
                    } catch (err) {
                        console.error('Error checking enrollment:', err);
                        setCanLearn(false);
                    }
                } else {
                    setCanLearn(false);
                }
            } catch (err) {
                console.log('Error fetching course:', err);
                setError('Không thể lấy thông tin khóa học này!');
            } finally {
                setIsLoading(false);
            }
        };
        fetchCourseData();
    }, [slug, isLoggedIn, user]);

    const handleBuyNow = async () => {
        if (!isLoggedIn || !user?.id) {
            toast.error("Vui lòng đăng nhập để mua khóa học!");
            router.push('/login');
            return;
        }

        if (!courseData?.course_id) {
            toast.error("Không tìm thấy thông tin khóa học");
            return;
        }

        try {
            setIsPaying(true);
            console.log("Đang tạo link thanh toán...");

            const response = await api.post('/payment/create-link', {
                userId: user.id,
                courseId: courseData.course_id
            });

            const { checkoutUrl } = response.data;

            if (checkoutUrl) {
                // Lưu thông tin để redirect sau khi thanh toán thành công
                sessionStorage.setItem('payment_course_slug', courseData.slug || '');
                window.location.href = checkoutUrl;
            } else {
                toast.error("Không nhận được link thanh toán");
            }

        } catch (err) {
            console.error("Payment Error:", err);

            if (isAxiosError(err)) {
                const errorMessage = err.response?.data?.error
                    || err.response?.data?.message
                    || "Thanh toán thất bại";
                toast.error(errorMessage);
            } else {
                toast.error("Có lỗi xảy ra khi tạo link thanh toán");
            }
        } finally {
            setIsPaying(false);
        }
    };
    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
            </div>
        );
    }

    if (!courseData) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <p className="font-roboto text-gray-600">Course not found</p>
            </div>
        );
    }
    const includesData = [
        {
            icon: 'PlayCircle',
            text: courseData.description ?? "Chưa có mô tả khoá học"
        }
    ]
    const formatPrice = (priceValue?: number) => {
        if (typeof priceValue !== 'number' || isNaN(priceValue)) return '0 ₫';
        return new Intl.NumberFormat('vi-VN').format(priceValue) + ' ₫';
    };
    return (
        <div className="min-h-screen bg-white">
            <CourseHeader
                category_name={courseData.category?.category_name ?? "Không có thông tin loại khoá học"}
                title={courseData.title ?? "Không có tiêu đề khoá học"}
                description={courseData.description ?? "Không có mô tả khoá học"}
                /* rating={courseData.rating} */
                total_reviews={courseData.feedbacks.length}
                total_students={courseData.learnerCourses.length}
                created_by={courseData.instructor?.user?.fullName || "Chưa lấy được thông tin"} 
                /* last_updated={courseData.last_updated} */
                available_language={courseData.available_language ?? DEFAULT_LANGUAGE}
                level_name={courseData.level?.level_name ?? "Chưa có cấp độ cho khoá học này"}
            />

            {error && (
                <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mx-4 md:mx-10 mt-6">
                    <p className="font-roboto text-yellow-700">{error}</p>
                </div>
            )}
            <div className={`${isMobile ? 'breadcrumb ml-5 pt-5' : 'breadcrumb  ml-15 pt-5'}`}>
                <Breadcrumb>
                    <BreadcrumbList>
                        <BreadcrumbItem>
                            <BreadcrumbLink href="/">Home</BreadcrumbLink>
                        </BreadcrumbItem>
                        <BreadcrumbSeparator />
                        <BreadcrumbItem>
                            <BreadcrumbLink href="/">Khám phá khoá học</BreadcrumbLink>
                        </BreadcrumbItem>
                        <BreadcrumbSeparator />
                        <BreadcrumbItem>
                            <BreadcrumbPage>{courseData.slug}</BreadcrumbPage>
                        </BreadcrumbItem>
                    </BreadcrumbList>
                </Breadcrumb>
            </div>
            <div className="max-w-7xl mx-auto px-4 md:px-10 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2">
                        <CourseTabs>
                            <TabsContent value="overview" className="mt-6">
                                <CourseOverview
                                    what_you_learn={[courseData.description ?? "Chưa có mô tả chi tiết."]}
                                    requirement={courseData.requirement ?? "Khoá học này không yêu cầu gì."}
                                />
                            </TabsContent>
                            <TabsContent value="curriculum" className="mt-6">
                                <CourseCurriculum
                                    chapters={courseData.chapter ?? []}
                                /*    total_lectures={courseData.total_lectures}
                                        total_duration={`${courseData.total_hours} hours`} */
                                />
                            </TabsContent>
                            <TabsContent value="instructor" className="mt-6">
                                <InstructorInfo instructor={courseData.instructor} />
                            </TabsContent>
                            <TabsContent value="reviews" className="mt-6">
                                <FeedbackBox courseId={`${courseData.course_id}`} canFeedback={canLearn}/>
                            </TabsContent>
                        </CourseTabs>
                    </div>

                    <div className="p-1 border rounded rounded-t-xl">

                        <CourseSidebar
                            course_slug={courseData.slug || "No Slug Found!"}
                            course_id={courseData.course_id}
                            thumbnail={courseData.thumbnail || PLACEHOLDER_THUMBNAIL}
                            price={courseData.price || 0}
                            original_price={undefined}
                            sale_off={undefined}
                            includes={includesData}
                            onBuyNow={handleBuyNow}
                            isLoading={isPaying}
                            isEnrolled={canLearn}
                        />
                    </div>
                </div>


            </div>

            <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 shadow-lg z-50">
                <div className="flex items-center justify-between gap-4">
                    <div className="flex flex-col">
                        <span className="font-roboto-condensed-bold text-2xl">{formatPrice(courseData.price)}</span>
                    </div>
                    <Button className="bg-pink-600 cursor-pointer font-roboto-bold px-8 py-6">
                        Enroll Now
                    </Button>
                </div>
            </div>
        </div>
    );
}
