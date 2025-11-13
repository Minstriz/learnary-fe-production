import React from 'react';
import Image from 'next/image';
import { Star } from 'lucide-react';

interface Review {
  review_id: string;
  user_name: string;
  user_avatar: string;
  rating: number;
  comment: string;
  helpful_count: number;
  created_at: string;
}

interface ReviewsListProps {
  rating: number;
  total_reviews: number;
  rating_distribution: {
    "5_star": number;
    "4_star": number;
    "3_star": number;
    "2_star": number;
    "1_star": number;
  };
  reviews: Review[];
}

export default function ReviewsList({ rating, rating_distribution, reviews }: ReviewsListProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long' });
  };

  return (
    <div>
      <h2 className="font-roboto-condensed-bold text-2xl mb-6">Student Reviews</h2>

      <div className="grid md:grid-cols-2 gap-8 mb-8">
        <div className="flex items-center gap-6">
          <div className="text-center">
            <div className="text-5xl font-roboto-condensed-bold mb-2">{rating}</div>
            <div className="flex justify-center mb-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`w-5 h-5 ${star <= Math.floor(rating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
                />
              ))}
            </div>
            <div className="font-roboto text-sm text-gray-600">Course Rating</div>
          </div>
        </div>

        <div className="space-y-2">
          {[5, 4, 3, 2, 1].map((star) => {
            const key = `${star}_star` as keyof typeof rating_distribution;
            const percentage = rating_distribution[key];
            return (
              <div key={star} className="flex items-center gap-3">
                <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-yellow-400"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
                <div className="flex items-center gap-1 text-sm font-roboto">
                  <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                  <span>{star}</span>
                </div>
                <span className="font-roboto text-sm text-gray-600">{percentage}%</span>
              </div>
            );
          })}
        </div>
      </div>

      <div className="space-y-6">
        {reviews.map((review) => (
          <div key={review.review_id} className="border-b border-gray-200 pb-6 last:border-b-0">
            <div className="flex items-start gap-4">
              <Image
                src={review.user_avatar}
                alt={review.user_name}
                width={48}
                height={48}
                className="rounded-full object-cover"
              />
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-roboto-bold">{review.user_name}</h4>
                  <span className="font-roboto text-sm text-gray-600">{formatDate(review.created_at)}</span>
                </div>
                <div className="flex items-center gap-1 mb-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`w-4 h-4 ${star <= review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
                    />
                  ))}
                </div>
                <p className="font-roboto text-gray-700 leading-relaxed mb-2">{review.comment}</p>
                <button className="font-roboto text-sm text-gray-600 hover:text-gray-900">
                  Helpful ({review.helpful_count})
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
