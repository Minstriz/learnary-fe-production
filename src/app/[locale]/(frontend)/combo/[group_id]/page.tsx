"use client";
import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { TabsContent } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import CourseTabsCombo from '@/components/CourseTabCombo';
import api from '@/app/lib/axios';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb';
import { useIsMobile } from '@/hooks/useIsMobile';
import { Group } from '@/type/course.type';
import { PLACEHOLDER_THUMBNAIL } from '@/const/urls';
import { useAuth } from '@/app/context/AuthContext';
import { isAxiosError } from 'axios';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { Package, Star, Clock } from 'lucide-react';
import Image from 'next/image';
import { formatPriceVND } from '@/utils/convert_price';

export default function ComboDetailPage() {
    const params = useParams();
    const router = useRouter();
    const group_id = params?.group_id as string;
    const isMobile = useIsMobile();
    const { user, isLoggedIn } = useAuth();
    const [comboData, setComboData] = useState<Group | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isPaying, setIsPaying] = useState(false);

    useEffect(() => {
        const fetchComboData = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const response = await api.get(`/groups/${group_id}`);
                if (response.data && response.status === 200) {
                    setComboData(response.data);
                } else {
                    setError('Không thể lấy thông tin combo từ server!');
                }
            } catch (err) {
                console.error('Error fetching combo:', err);
                setError('Không thể lấy thông tin combo từ server!');
            } finally {
                setIsLoading(false);
            }
        };
        if (group_id) {
            fetchComboData();
        }
    }, [group_id]);

    const handleBuyNow = async () => {
        if (!isLoggedIn || !user?.id) {
            toast.error("Vui lòng đăng nhập để mua combo!");
            router.push('/login');
            return;
        }

        if (!comboData?.group_id) {
            toast.error("Không tìm thấy thông tin combo");
            return;
        }

        try {
            setIsPaying(true);
            console.log("Đang tạo link thanh toán cho combo...");
            
            const response = await api.post('/payment/create-combo-link', {
                userId: user.id,
                groupId: comboData.group_id
            });

            const { checkoutUrl } = response.data;
            
            if (checkoutUrl) {
                sessionStorage.setItem('payment_combo_id', comboData.group_id);
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

    // Tính toán giá
    const calculateOriginalPrice = (): number => {
        if (!comboData?.hasCourseGroup || comboData.hasCourseGroup.length === 0) return 0;
        return comboData.hasCourseGroup.reduce((sum, cg) => {
            const price = Number(cg.belongToCourse.price) || 0;
            return sum + price;
        }, 0);
    };

    const calculateDiscountedPrice = (): number => {
        const originalPrice = calculateOriginalPrice();
        return Math.round(originalPrice * (1 - (comboData?.discount || 0) / 100));
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
            </div>
        );
    }

    if (!comboData) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <p className="font-roboto text-gray-600">Không tìm thấy combo</p>
            </div>
        );
    }

    const originalPrice = calculateOriginalPrice();
    const discountedPrice = calculateDiscountedPrice();
    const courseCount = comboData.hasCourseGroup?.length || 0;
    const savings = originalPrice - discountedPrice;

    return (
        <div className="min-h-screen bg-white">
            {/* Header Section */}
            <div className="bg-linear-to-r from-purple-900 to-purple-700 text-white py-8 px-4 md:px-10">
                <div className="max-w-7xl mx-auto">
                    <Badge className="mb-3 bg-purple-600 text-white hover:bg-purple-500 cursor-default">
                        <Package className="w-3 h-3 mr-1" />
                        {comboData.type === "Combo" ? "COMBO" : "NHÓM"}
                    </Badge>
                    <h1 className="font-rosario-bold text-3xl md:text-4xl mb-4">
                        {comboData.name}
                    </h1>
                    <p className="font-roboto text-purple-100 text-lg mb-6 max-w-4xl">
                        {comboData.description || "Gói combo tiết kiệm cho bạn"}
                    </p>
                    <div className="flex flex-wrap items-center gap-4 font-roboto text-sm">
                        <div className="flex items-center gap-2 text-purple-100">
                            <Package className="w-5 h-5" />
                            <span className="font-semibold">{courseCount} khóa học</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Badge className="bg-red-500 text-white">
                                Giảm {comboData.discount}%
                            </Badge>
                        </div>
                        <div className="flex items-center gap-2 text-green-300">
                            <span className="font-semibold">Tiết kiệm: {formatPriceVND(savings)}</span>
                        </div>
                    </div>
                </div>
            </div>

            {error && (
                <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mx-4 md:mx-10 mt-6">
                    <p className="font-roboto text-yellow-700">{error}</p>
                </div>
            )}

            <div className={`${isMobile ? 'breadcrumb ml-5 pt-5' : 'breadcrumb ml-15 pt-5'}`}>
                <Breadcrumb>
                    <BreadcrumbList>
                        <BreadcrumbItem>
                            <BreadcrumbLink href="/">Home</BreadcrumbLink>
                        </BreadcrumbItem>
                        <BreadcrumbSeparator />
                        <BreadcrumbItem>
                            <BreadcrumbLink href="/combos">Combos</BreadcrumbLink>
                        </BreadcrumbItem>
                        <BreadcrumbSeparator />
                        <BreadcrumbItem>
                            <BreadcrumbPage>{comboData.name}</BreadcrumbPage>
                        </BreadcrumbItem>
                    </BreadcrumbList>
                </Breadcrumb>
            </div>

            <div className="max-w-7xl mx-auto px-4 md:px-10 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Content */}
                    <div className="lg:col-span-2">
                        <CourseTabsCombo>
                            <TabsContent value="overview" className="mt-6">
                                <div className="space-y-6">
                                    <div>
                                        <h2 className="font-rosario-bold text-2xl mb-4">
                                            Thông tin combo
                                        </h2>
                                        <div className="bg-purple-50 border-l-4 border-purple-600 p-4 rounded">
                                            <p className="font-roboto text-gray-700">
                                                {comboData.description || "Gói combo tiết kiệm bao gồm nhiều khóa học chất lượng"}
                                            </p>
                                        </div>
                                    </div>

                                    <div>
                                        <h3 className="font-rosario-bold text-xl mb-3">
                                            Ưu đãi đặc biệt
                                        </h3>
                                        <ul className="space-y-2">
                                            <li className="flex items-start gap-2 font-roboto">
                                                <span className="text-green-600">✓</span>
                                                <span>Tiết kiệm <strong className="text-green-600">{formatPriceVND(savings)}</strong> so với mua lẻ</span>
                                            </li>
                                            <li className="flex items-start gap-2 font-roboto">
                                                <span className="text-green-600">✓</span>
                                                <span>Giảm giá <strong className="text-red-600">{comboData.discount}%</strong> cho toàn bộ combo</span>
                                            </li>
                                            <li className="flex items-start gap-2 font-roboto">
                                                <span className="text-green-600">✓</span>
                                                <span>Truy cập trọn đời tất cả {courseCount} khóa học</span>
                                            </li>
                                        </ul>
                                    </div>
                                </div>
                            </TabsContent>

                            <TabsContent value="curriculum-combo" className="mt-6">
                                <div>
                                    <h2 className="font-rosario-bold text-2xl mb-4">
                                        Các khóa học trong combo ({courseCount})
                                    </h2>
                                    <div className="space-y-4">
                                        {comboData.hasCourseGroup?.map((cg, index) => (
                                            <div key={cg.course_id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                                                <div className="flex gap-4">
                                                    <div className="shrink-0">
                                                        <div className="relative w-32 h-20 rounded overflow-hidden">
                                                            <Image
                                                                src={cg.belongToCourse.thumbnail || PLACEHOLDER_THUMBNAIL}
                                                                alt={cg.belongToCourse.title || "Course thumbnail"}
                                                                fill
                                                                className="object-cover"
                                                            />
                                                        </div>
                                                    </div>
                                                    <div className="flex-1">
                                                        <div className="flex items-start justify-between">
                                                            <div>
                                                                <Badge variant="outline" className="text-xs mb-2">
                                                                    Khóa học {index + 1}
                                                                </Badge>
                                                                <h3 className="font-roboto-condensed-bold text-lg mb-1">
                                                                    {cg.belongToCourse.title}
                                                                </h3>
                                                            </div>
                                                            <div className="text-right">
                                                                <p className="font-roboto text-sm text-gray-500 line-through">
                                                                    {formatPriceVND(Number(cg.belongToCourse.price))}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </TabsContent>

                            <TabsContent value="instructor" className="mt-6">
                                <div className="bg-gray-50 p-6 rounded-lg">
                                    <h2 className="font-rosario-bold text-2xl mb-4">
                                        Về combo này
                                    </h2>
                                    <p className="font-roboto text-gray-600">
                                        Combo này bao gồm {courseCount} khóa học được tuyển chọn kỹ lưỡng, 
                                        giúp bạn học tập hiệu quả và tiết kiệm chi phí. Tất cả khóa học 
                                        đều được giảng dạy bởi các giảng viên chuyên nghiệp với nhiều năm kinh nghiệm.
                                    </p>
                                </div>
                            </TabsContent>
                        </CourseTabsCombo>
                    </div>

                    {/* Sidebar */}
                    <div className="p-1 border rounded rounded-t-xl">
                        <div className="sticky top-4 border-gray-200 bg-white shadow-lg">
                            <div className="relative aspect-video w-full overflow-hidden">
                                <Image
                                    src={comboData.hasCourseGroup?.[0]?.belongToCourse?.thumbnail || PLACEHOLDER_THUMBNAIL}
                                    alt={comboData.name || "Combo thumbnail"}
                                    fill
                                    className="object-cover rounded-t-xl"
                                />
                                <div className="absolute top-4 right-4">
                                    <Badge className="bg-red-500 text-white text-lg px-3 py-1">
                                        -{comboData.discount}%
                                    </Badge>
                                </div>
                            </div>

                            <div className="p-6">
                                <div className="mb-4">
                                    <div className="flex flex-col items-center gap-2">
                                        <span className="font-roboto text-sm text-gray-500 line-through">
                                            {formatPriceVND(originalPrice)}
                                        </span>
                                        <span className="font-roboto-condensed-bold text-4xl text-red-500">
                                            {formatPriceVND(discountedPrice)}
                                        </span>
                                        <span className="font-roboto text-sm text-green-600">
                                            Tiết kiệm {formatPriceVND(savings)}
                                        </span>
                                    </div>
                                </div>

                                <Button 
                                    className="w-full mb-3 bg-purple-600 hover:bg-purple-700 text-white font-roboto-bold py-6 text-lg cursor-pointer"
                                    onClick={handleBuyNow}
                                    disabled={isPaying}
                                >
                                    {isPaying ? "Đang xử lý..." : "Mua ngay"}
                                </Button>

                                <div className="border-t pt-4 mt-4">
                                    <h3 className="font-roboto-bold mb-3">Combo bao gồm:</h3>
                                    <ul className="space-y-2 font-roboto text-sm">
                                        <li className="flex items-center gap-2">
                                            <Package className="w-4 h-4 text-purple-600" />
                                            <span>{courseCount} khóa học chất lượng</span>
                                        </li>
                                        <li className="flex items-center gap-2">
                                            <Clock className="w-4 h-4 text-purple-600" />
                                            <span>Truy cập trọn đời</span>
                                        </li>
                                        <li className="flex items-center gap-2">
                                            <Star className="w-4 h-4 text-purple-600" />
                                            <span>Chứng chỉ hoàn thành</span>
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Mobile Bottom Bar */}
            <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 shadow-lg z-50">
                <div className="flex items-center justify-between gap-4">
                    <div className="flex flex-col">
                        <span className="font-roboto text-xs text-gray-500 line-through">
                            {formatPriceVND(originalPrice)}
                        </span>
                        <span className="font-roboto-condensed-bold text-2xl text-red-500">
                            {formatPriceVND(discountedPrice)}
                        </span>
                    </div>
                    <Button 
                        className="bg-purple-600 hover:bg-purple-700 cursor-pointer font-roboto-bold px-8 py-6"
                        onClick={handleBuyNow}
                        disabled={isPaying}
                    >
                        {isPaying ? "Đang xử lý..." : "Mua ngay"}
                    </Button>
                </div>
            </div>
        </div>
    );
}
