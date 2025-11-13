import React from 'react';
import Image from 'next/image';
import { Star, Users, PlayCircle } from 'lucide-react';

interface InstructorInfoProps {
  instructor: {
    instructor_id: string;
    full_name: string;
    avatar: string;
    bio: string;
    instructor_title?: string;
    title?: string;
    rating: number;
    total_reviews: number;
    total_students: number;
    total_courses: number;
    specializations: string[] | Array<{ specialization_name: string }>;
  };
}

export default function InstructorInfo({ instructor }: InstructorInfoProps) {
  const instructorTitle = instructor.instructor_title || instructor.title || 'Instructor';
  const specializations = Array.isArray(instructor.specializations) && instructor.specializations.length > 0
    ? (typeof instructor.specializations[0] === 'string'
        ? instructor.specializations as string[]
        : (instructor.specializations as Array<{ specialization_name: string }>).map(s => s.specialization_name))
    : [];

  return (
    <div>
      <h2 className="font-roboto-condensed-bold text-2xl mb-6">Instructor</h2>
      
      <div className="flex flex-col md:flex-row gap-6">
        <div className="shrink-0">
          <Image
            src={instructor.avatar && instructor.avatar.trim() !== "" 
              ? instructor.avatar 
              : "https://learnary-courses.s3.ap-southeast-2.amazonaws.com/thumbnail/2.jpg"
            }
            alt="avatar instructor"
            width={120}
            height={120}
            className="rounded-full object-cover"
          />
        </div>

        <div className="flex-1">
          <h3 className="font-rosario-bold text-xl mb-1">{instructor.full_name}</h3>
          <p className="font-roboto text-gray-600 mb-4">{instructorTitle}</p>

          <div className="flex flex-wrap gap-4 mb-4 font-roboto text-sm">
            <div className="flex items-center gap-1">
              <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
              <span className="font-bold">{instructor.rating}</span>
              <span className="text-gray-600">Instructor rating</span>
            </div>
            <div className="flex items-center gap-1 text-gray-700">
              <span className="font-bold">{instructor.total_reviews.toLocaleString()}</span>
              <span className="text-gray-600">Reviews</span>
            </div>
            <div className="flex items-center gap-1 text-gray-700">
              <Users className="w-4 h-4" />
              <span className="font-bold">{instructor.total_students.toLocaleString()}</span>
              <span className="text-gray-600">Students</span>
            </div>
            <div className="flex items-center gap-1 text-gray-700">
              <PlayCircle className="w-4 h-4" />
              <span className="font-bold">{instructor.total_courses}</span>
              <span className="text-gray-600">Courses</span>
            </div>
          </div>

          <p className="font-roboto text-gray-700 leading-relaxed mb-4">
            {instructor.bio}
          </p>

          <div className="flex flex-wrap gap-2">
            {specializations.map((spec, index) => (
              <span
                key={index}
                className="px-3 py-1 bg-gray-100 text-gray-800 font-roboto text-sm rounded"
              >
                {spec}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
