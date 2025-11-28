"use client";
import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
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

export default function CourseDetailPage() {
    const params = useParams();
    const slug = params?.slug;
    const isMobile = useIsMobile();
    const [courseData, setCourseData] = useState<Course | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    useEffect(() => {
        const fetchCourseData = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const response = await api.get(`/courses/slug/${slug}`);
                if (response.data && response.status === 200) {
                    setCourseData(response.data);
                } else {
                    console.log('No data received, using mock data');
                    setError('Không thể lấy khoá học từ server, đang dùng data mẫu!');
                }
            } catch {
                console.log('Using mock data as fallback');
                setError('Không thể lấy khoá học từ server, đang dùng data mẫu!');
            } finally {
                setIsLoading(false);
            }
        };
        fetchCourseData();
    }, [slug]);

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
                total_reviews={0}
                total_students={0}
                /* created_by={courseData.created_by} */
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
                        </CourseTabs>
                    </div>

                    <div className="p-1 border rounded rounded-t-xl">
                        <CourseSidebar
                            course_slug={courseData.slug || "No Slug Found!"}
                            thumbnail={courseData.thumbnail || PLACEHOLDER_THUMBNAIL}
                            price={courseData.price || 0}
                            original_price={undefined}
                            sale_off={undefined}
                            includes={includesData}
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
