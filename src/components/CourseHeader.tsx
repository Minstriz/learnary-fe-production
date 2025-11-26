import React from 'react';
import { Star, Users, Clock, Globe } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface CourseHeaderProps {
  category_name: string;
  title: string;
  description: string;
  rating?: number;
  total_reviews?: number;
  total_students?: number;
  created_by?: string;
  last_updated?: string;
  available_language?: string;
  level_name: string;
}

export default function CourseHeader({
  category_name,
  title,
  description,
  rating,
  total_reviews,
  total_students,
  created_by,
  last_updated,
  available_language,
  level_name
}: CourseHeaderProps) {
  return (
    <div className="bg-gray-900 text-white py-8 px-4 md:px-10">
      <div className="max-w-7xl mx-auto">
        <Badge className="mb-3 bg-white text-gray-900 hover:bg-gray-100 cursor-default">
          {category_name}
        </Badge>
        <h1 className="font-rosario-bold text-3xl md:text-4xl mb-4">
          {title}
        </h1>
        <p className="font-roboto text-gray-200 text-lg mb-6 max-w-4xl">
          {description}
        </p>
        <div className="flex flex-wrap items-center gap-4 font-roboto text-sm">
          <div className="flex items-center gap-1">
            <span className="text-yellow-400 font-bold">{rating}</span>
            <div className="flex">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`w-4 h-4 ${star <= Math.floor(rating || 0) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-400'}`}
                />
              ))}
            </div>
            <span className="text-gray-300">({(total_reviews ?? 0).toLocaleString()} reviews)</span>
          </div>
          <div className="flex items-center gap-1 text-gray-300">
            <Users className="w-4 h-4" />
            <span>{(total_students ?? 0).toLocaleString()} students</span>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-4 mt-4 font-roboto text-sm text-gray-300">
          <div className="flex items-center gap-1">
            Created by <span className="text-purple-400">{created_by}</span>
          </div>
          <div className="flex items-center gap-1">
            <Clock className="w-4 h-4" />
            Last updated {last_updated}
          </div>
          <div className="flex items-center gap-1">
            <Globe className="w-4 h-4" />
            {available_language}
          </div>
          <Badge variant="outline" className="text-gray-300 border-gray-600">
            {level_name}
          </Badge>
        </div>
      </div>
    </div>
  );
}
