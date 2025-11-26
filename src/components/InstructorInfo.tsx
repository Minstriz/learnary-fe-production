import React from 'react';
import Image from 'next/image';
import { Star, Users, PlayCircle } from 'lucide-react';

import { InstructorWithData } from '@/type/course.type';

type InstructorInfoProps = {
  instructor?: InstructorWithData;
};

export default function InstructorInfo({ instructor }: InstructorInfoProps) {
  // Lấy thông tin user nếu có
  const user = instructor?.user;
  const avatar = user?.avatar && user.avatar.trim() !== ''? user.avatar: 'https://learnary-courses.s3.ap-southeast-2.amazonaws.com/thumbnail/2.jpg';
  const fullName = user?.fullName || 'Instructor';
  const bio = user?.bio || 'Chưa có mô tả.';

  const rating = 0;
  const totalReviews =  0;
  const totalStudents =  0;
  const totalCourses = 0;

  return (
    <div>
      <h2 className="font-roboto-condensed-bold text-2xl mb-6">Instructor</h2>
      <div className="flex flex-col md:flex-row gap-6">
        <div className="shrink-0">
          <Image
            src={avatar}
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
        </div>
      </div>
    </div>
  );
}
