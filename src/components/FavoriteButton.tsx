"use client";

import React, { useState, useEffect } from 'react';
import { Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/app/context/AuthContext';
import { toast } from 'sonner';
import api from '@/app/lib/axios';
import { useRouter } from 'next/navigation';
import { isAxiosError } from 'axios';

interface FavoriteButtonProps {
    courseId: string;
    size?: 'sm' | 'md' | 'lg';
    variant?: 'icon' | 'button';
    className?: string;
}

export default function FavoriteButton({ 
    courseId, 
    size = 'md',
    variant = 'icon',
    className = ''
}: FavoriteButtonProps) {
    const router = useRouter();
    const { user, isLoggedIn } = useAuth();
    const [isFavorite, setIsFavorite] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isChecking, setIsChecking] = useState(true);

    // Kiểm tra khóa học có trong yêu thích không
    useEffect(() => {
        const checkFavorite = async () => {
            if (!user?.id || !courseId) {
                setIsChecking(false);
                return;
            }

            try {
                const response = await api.get(`/favorites/check/${user.id}/${courseId}`);
                setIsFavorite(response.data.isFavorite || false);
            } catch (error) {
                console.error('Error checking favorite:', error);
            } finally {
                setIsChecking(false);
            }
        };

        checkFavorite();
    }, [user?.id, courseId]);

    const handleToggleFavorite = async (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        if (!isLoggedIn || !user?.id) {
            toast.error('Vui lòng đăng nhập để thêm vào yêu thích');
            router.push('/login');
            return;
        }

        setIsLoading(true);

        try {
            if (isFavorite) {
                // Xóa khỏi yêu thích
                await api.delete('/favorites/remove', {
                    data: {
                        userId: user.id,
                        courseId: courseId
                    }
                });
                setIsFavorite(false);
                toast.success('Đã xóa khỏi danh sách yêu thích');
            } else {
                // Thêm vào yêu thích
                await api.post('/favorites/add', {
                    userId: user.id,
                    courseId: courseId
                });
                setIsFavorite(true);
                toast.success('Đã thêm vào danh sách yêu thích');
            }
        } catch (error) {
            console.error('Error toggling favorite:', error);
            let errorMessage = 'Có lỗi xảy ra';
            if (isAxiosError(error)) {
                errorMessage = error.response?.data?.error || error.response?.data?.message || errorMessage;
            }
            toast.error(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    const iconSizes = {
        sm: 'w-4 h-4',
        md: 'w-5 h-5',
        lg: 'w-9 h-9'
    };

    if (variant === 'icon') {
        return (
            <Button
                size="icon"
                variant="outline"
                className={`group border-pink-600 border-2 bg-white cursor-pointer hover:border-pink-600 hover:bg-pink-600 ${className}`}
                onClick={handleToggleFavorite}
                disabled={isLoading || isChecking}
                title={isFavorite ? 'Xóa khỏi yêu thích' : 'Thêm vào yêu thích'}
            >
                {isLoading ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-pink-600"></div>
                ) : (
                    <Heart 
                        className={`${iconSizes[size]} transition-colors ${
                            isFavorite 
                                ? 'text-pink-600 fill-pink-600 group-hover:text-white group-hover:fill-white' 
                                : 'text-pink-600 group-hover:text-white'
                        }`}
                    />
                )}
            </Button>
        );
    }

    return (
        <Button
            variant="outline"
            className={`border-pink-600 text-pink-600 hover:bg-pink-600 hover:text-white ${className}`}
            onClick={handleToggleFavorite}
            disabled={isLoading || isChecking}
        >
            {isLoading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-pink-600 mr-2"></div>
            ) : (
                <Heart 
                    className={`${iconSizes[size]} ${isFavorite ? 'fill-pink-600' : ''}`}
                />
            )}
            {isFavorite ? 'Đã yêu thích' : 'Yêu thích'}
        </Button>
    );
}
