'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { Star, Users, PlayCircle, MessageCircle } from 'lucide-react';
import { InstructorWithData } from '@/type/user.type';
import { useAuth } from '@/app/context/AuthContext';
import { useRouter } from 'next/navigation';
import { Button } from './ui/button';
import { toast } from 'sonner';
import api from '@/app/lib/axios';

type InstructorInfoProps = {
  instructor?: InstructorWithData;
};

export default function InstructorInfo({ instructor }: InstructorInfoProps) {
  const { user: currentUser, isLoggedIn } = useAuth();
  const router = useRouter();
  const [isLoadingChat, setIsLoadingChat] = useState(false);
  const user = instructor?.user;
  const avatar = user?.avatar && user.avatar.trim() !== '' ? user.avatar : '';
  const fullName = user?.fullName || 'Instructor';
  const bio = user?.bio || 'Chưa có mô tả.';

  const rating = 0;
  const totalReviews = 0;
  const totalStudents = 0;
  const totalCourses = 0;

  const handleStartChat = async () => {
    if (!isLoggedIn) {
      toast.error('Vui lòng đăng nhập để chat');
      return;
    }

    if (!instructor?.user?.user_id) {
      toast.error('Không tìm thấy thông tin instructor');
      return;
    }

    if (currentUser?.id === instructor.user.user_id) {
      toast.error('Bạn không thể chat với chính mình');
      return;
    }

    setIsLoadingChat(true);
    try {
      const response = await api.post('/conversations', {
        otherUserId: instructor.user.user_id
      });
      const conversationId = response.data.data.conversation_id;
      router.push(`/chat?conversation=${conversationId}`);
      toast.success('Đang chuyển đến trang chat...');
    } catch (error) {
      console.error('Error starting chat:', error);
      toast.error("Lỗi khi mở đoạn chat");
    } finally {
      setIsLoadingChat(false);
    }
  };

  return (
    <div>
      <h2 className="font-roboto-condensed-bold text-2xl mb-6">Instructor</h2>
      <div className="flex flex-col md:flex-row gap-6">
        <div className="shrink-0">
          <Image
            src={avatar || "/images/temp/Profile-PNG-Photo.png"}
            alt="avatar instructor"
            width={120}
            height={120}
            className="rounded-full object-cover"
          />
        </div>
        <div className="flex-1">
          <h3 className="font-rosario-bold text-xl mb-1">{fullName}</h3>
          <p className="font-roboto text-gray-600 mb-4">{user?.email || ''}</p>
          <div className="flex flex-wrap gap-4 mb-4 font-roboto text-sm">
            <div className="flex items-center gap-1">
              <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
              <span className="font-bold">{rating}</span>
              <span className="text-gray-600">Instructor rating</span>
            </div>
            <div className="flex items-center gap-1 text-gray-700">
              <span className="font-bold">{totalReviews.toLocaleString()}</span>
              <span className="text-gray-600">Reviews</span>
            </div>
            <div className="flex items-center gap-1 text-gray-700">
              <Users className="w-4 h-4" />
              <span className="font-bold">{totalStudents.toLocaleString()}</span>
              <span className="text-gray-600">Students</span>
            </div>
            <div className="flex items-center gap-1 text-gray-700">
              <PlayCircle className="w-4 h-4" />
              <span className="font-bold">{totalCourses}</span>
              <span className="text-gray-600">Courses</span>
            </div>
          </div>
          <p className="font-roboto text-gray-700 leading-relaxed mb-4">
            {bio}
          </p>
          <Button
            onClick={handleStartChat}
            disabled={isLoadingChat}
            className="flex items-center gap-2"
          >
            <MessageCircle className="w-4 h-4" />
            {isLoadingChat ? 'Đang xử lý...' : 'Chat với Instructor'}
          </Button>
        </div>
      </div>
    </div>
  );
}
