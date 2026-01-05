"use client";

import React, { useEffect, useState, useCallback } from 'react';
import { useAuth } from '@/app/context/AuthContext';
import { useRouter } from 'next/navigation';
import api from '@/app/lib/axios';
import { toast } from 'sonner';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Heart, Trash2, ShoppingCart } from 'lucide-react';
import Link from 'next/link';
import { formatPriceVND } from '@/utils/convert_price';
import { PLACEHOLDER_THUMBNAIL } from '@/const/urls';
import { useIsMobile } from '@/hooks/useIsMobile';

interface FavoriteCourse {
    favorite_id: string;
    course_id: string;
    createdAt: string;
    course: {
        course_id: string;
        title: string;
        thumbnail: string;
        price: number;
        sale_off?: number | null;
        status: string;
        slug: string;
        description: string;
        category: {
            category_id: string;
            category_name: string;
        };
        level: {
            level_id: string;
            level_name: string;
        };
        instructor: {
            instructor_id: string;
            user: {
                fullName: string;
                avatar: string;
            };
        };
    };
}

export default function MyFavoritePage() {
    const router = useRouter();
    const isMobile = useIsMobile();
    const { user, isLoggedIn, isLoading } = useAuth();
    const [favorites, setFavorites] = useState<FavoriteCourse[]>([]);
    const [loadingFavorites, setLoadingFavorites] = useState(true);
    const [removingId, setRemovingId] = useState<string | null>(null);

    const fetchFavorites = useCallback(async () => {
        try {
            setLoadingFavorites(true);
            const response = await api.get(`/favorites/${user?.id}`);
            setFavorites(response.data.data || []);
        } catch (error) {
            console.error('Error fetching favorites:', error);
            toast.error('Không thể tải danh sách yêu thích');
        } finally {
            setLoadingFavorites(false);
        }
    }, [user?.id]);

    useEffect(() => {
        if (!isLoading && !isLoggedIn) {
            router.push('/login');
            return;
        }

        if (user?.id) {
            fetchFavorites();
        }
    }, [user?.id, isLoggedIn, isLoading, router, fetchFavorites]);

    const handleRemoveFavorite = async (courseId: string) => {
        try {
            setRemovingId(courseId);
            await api.delete('/favorites/remove', {
                data: {
                    userId: user?.id,
                    courseId: courseId
                }
            });
            
            setFavorites(prev => prev.filter(fav => fav.course_id !== courseId));
            toast.success('Đã xóa khỏi danh sách yêu thích');
        } catch (error) {
            console.error('Error removing favorite:', error);
            toast.error('Không thể xóa khỏi danh sách yêu thích');
        } finally {
            setRemovingId(null);
        }
    };

    if (isLoading || loadingFavorites) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen  py-8">
            <div className="max-w-7xl mx-auto px-4 md:px-10">
                <div className="mb-8">
                    <div className="flex items-center gap-3 mb-2">
                        <Heart className="w-8 h-8 text-pink-600 fill-pink-600" />
                        <h1 className="font-roboto-condensed-bold text-3xl md:text-4xl">
                            Khóa học yêu thích
                        </h1>
                    </div>
                    <p className="font-roboto text-gray-600">
                        {favorites.length} khóa học trong danh sách
                    </p>
                </div>

                {favorites.length === 0 ? (
                    <div className="flex flex-col justify-center h-screen align-center rounded-lg shadow-sm p-12 text-center">
                        <Heart className="w-20 h-20 text-gray-300 mx-auto mb-4" />
                        <h2 className="font-rosario-bold text-2xl mb-2">
                            Chưa có khóa học yêu thích
                        </h2>
                        <p className="font-roboto text-gray-600 mb-6">
                            Hãy khám phá và thêm các khóa học bạn quan tâm vào danh sách yêu thích
                        </p>
                        <Button 
                            className="bg-pink-600 hover:bg-pink-700 cursor-pointer max-w-xl self-center"
                            onClick={() => router.push('/')}
                        >
                            Khám phá khóa học
                        </Button>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {favorites.map((favorite) => (
                            <div 
                                key={favorite.favorite_id}
                                className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow p-4 md:p-6"
                            >
                                <div className={`flex ${isMobile ? 'flex-col' : 'flex-row'} gap-6`}>
                                    <div className="shrink-0">
                                        <Link href={`/course-detail/${favorite.course.slug}`}>
                                            <div className={`relative ${isMobile ? 'w-full h-48' : 'w-64 h-40'} rounded-lg overflow-hidden cursor-pointer group`}>
                                                <Image
                                                    src={favorite.course.thumbnail || PLACEHOLDER_THUMBNAIL}
                                                    alt={favorite.course.title}
                                                    fill
                                                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                                                />
                                            </div>
                                        </Link>
                                    </div>

                                    {/* Content */}
                                    <div className="flex-1 flex flex-col justify-between">
                                        <div>
                                            <Link href={`/course-detail/${favorite.course.slug}`}>
                                                <h3 className="font-rosario-bold text-xl md:text-2xl mb-2 hover:text-pink-600 transition-colors cursor-pointer">
                                                    {favorite.course.title}
                                                </h3>
                                            </Link>
                                            
                                            <p className="font-roboto text-gray-600 mb-3 line-clamp-2">
                                                {favorite.course.description}
                                            </p>

                                            <div className="flex flex-wrap gap-3 mb-3">
                                                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-roboto bg-purple-100 text-purple-700">
                                                    {favorite.course.category.category_name}
                                                </span>
                                                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-roboto bg-blue-100 text-blue-700">
                                                    {favorite.course.level.level_name}
                                                </span>
                                            </div>

                                            <p className="font-roboto text-sm text-gray-500">
                                                Giảng viên: <span className="font-semibold">{favorite.course.instructor.user.fullName}</span>
                                            </p>
                                        </div>

                                        {/* Actions */}
                                        <div className={`flex ${isMobile ? 'flex-col' : 'flex-row'} items-center justify-between gap-4 mt-4`}>
                                            <div className="flex items-center gap-2">
                                                {(() => {
                                                    const saleOff = Number(favorite.course.sale_off);
                                                    const hasDiscount = !isNaN(saleOff) && saleOff > 0 && saleOff <= 100;
                                                    const discountedPrice = favorite.course.price - favorite.course.price * saleOff / 100;
                                                    if (hasDiscount) {
                                                        return (
                                                            <>
                                                                <span className="font-roboto-condensed-bold text-2xl md:text-3xl text-pink-600">
                                                                    {formatPriceVND(discountedPrice)}
                                                                </span>
                                                                <span className="font-roboto-condensed-italic text-gray-500 line-through text-lg md:text-xl ml-2">
                                                                    {formatPriceVND(Number(favorite.course.price))}
                                                                </span>
                                                                <span className="font-roboto-bold text-red-600 ml-2">{saleOff}% OFF</span>
                                                            </>
                                                        );
                                                    } else {
                                                        return (
                                                            <span className="font-roboto-condensed-bold text-2xl md:text-3xl text-pink-600">
                                                                {formatPriceVND(Number(favorite.course.price))}
                                                            </span>
                                                        );
                                                    }
                                                })()}
                                            </div>

                                            <div className="flex gap-2">
                                                <Button
                                                    variant="outline"
                                                    size="icon"
                                                    className="border-red-500 text-red-500 hover:bg-red-50"
                                                    onClick={() => handleRemoveFavorite(favorite.course_id)}
                                                    disabled={removingId === favorite.course_id}
                                                >
                                                    {removingId === favorite.course_id ? (
                                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-500"></div>
                                                    ) : (
                                                        <Trash2 className="w-5 h-5" />
                                                    )}
                                                </Button>

                                                <Button
                                                    className="bg-pink-600 hover:bg-pink-700"
                                                    onClick={() => router.push(`/course-detail/${favorite.course.slug}`)}
                                                >
                                                    <ShoppingCart className="w-4 h-4 mr-2" />
                                                    Xem chi tiết
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
