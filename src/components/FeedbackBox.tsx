import React, { useEffect, useState } from 'react'
import { FeedBack } from '@/type/course.type'
import { Card, CardContent } from "@/components/ui/card"
import { Star } from "lucide-react"
import { formatDate } from '@/utils/datetime'
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import api from '@/app/lib/axios'
import { toast } from 'sonner'
import { isAxiosError } from 'axios'
type FeedbackBoxProps = {
    canFeedback?: boolean
    courseId: string
    onFeedbackSubmitted?: () => void
}

export default function FeedbackBox({ canFeedback, courseId, onFeedbackSubmitted }: FeedbackBoxProps) {
    const [rating, setRating] = useState(0);
    const [hoverRating, setHoverRating] = useState(0);
    const [comment, setComment] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [feedbacks, setFeedbacks] = useState<FeedBack[]>([]);

    useEffect(() => {
        const fetchFeedbacks = async () => {
            try {
                const feedbacksRes = await api.get(`/feedbacks/${courseId}`, {
                    headers: {
                        Authorization: '' 
                    }
                })
                if(feedbacksRes && feedbacksRes.data) {
                    setFeedbacks(Array.isArray(feedbacksRes.data.data) ? feedbacksRes.data.data : [])
                }
            } catch (error) {
                console.error('Error fetching feedbacks:', error);
                setFeedbacks([]);
            }
        }
        fetchFeedbacks()
    }, [courseId])
    const handleSubmit = async () => {
        if (rating === 0) {
            toast.error('Vui lòng chọn số sao đánh giá!');
            return;
        }
        if (!comment.trim()) {
            toast.error('Vui lòng nhập nội dung đánh giá!');
            return;
        }
        setIsSubmitting(true);
        try {
            await api.post('/feedbacks', {
                course_id: courseId,
                rating,
                comment
            });
            toast.success('Gửi đánh giá thành công!');
            setRating(0);
            setComment('');

            const feedbacksRes = await api.get(`/feedbacks/${courseId}`);
            if(feedbacksRes) {
                setFeedbacks(feedbacksRes.data.data);
            } else {
                setFeedbacks([])
            }
            if (onFeedbackSubmitted) {
                onFeedbackSubmitted();
            }
        } catch (error) {
            console.error('Error submitting feedback:', error);
            if (isAxiosError(error) && error.response?.status === 409) {
                toast.warning(error.response?.data?.message || 'Bạn đã đánh giá khóa học này rồi');
            } else if (isAxiosError(error) && error.response?.data?.message) {
                toast.error(error.response.data.message);
            } else {
                toast.error('Không thể gửi đánh giá. Vui lòng thử lại!');
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="space-y-6">
            <h3 className="text-xl font-bold">Đánh giá từ học viên</h3>
            {canFeedback && (
                <Card className="border-2 border-blue-200 bg-blue-50/30">
                    <CardContent className="p-6 space-y-4">
                        <div>
                            <Label className="text-base font-semibold mb-2 block">
                                Đánh giá của bạn
                            </Label>
                            <div className="flex gap-2 items-center">
                                {Array.from({ length: 5 }).map((_, index) => {
                                    const starValue = index + 1;
                                    const isFilled = starValue <= (hoverRating || rating);
                                    return (
                                        <Star
                                            key={index}
                                            className={`h-8 w-8 cursor-pointer transition-all ${isFilled ? 'fill-yellow-400 text-yellow-400' : 'fill-gray-200 text-gray-300 hover:fill-yellow-200 hover:text-yellow-300'}`}
                                            onClick={() => setRating(starValue)}
                                            onMouseEnter={() => setHoverRating(starValue)}
                                            onMouseLeave={() => setHoverRating(0)}
                                        />
                                    );
                                })}
                                {rating > 0 && (
                                    <span className="text-sm text-gray-600 ml-2">
                                        {rating}/5 sao
                                    </span>
                                )}
                            </div>
                        </div>

                        <div>
                            <Label htmlFor="comment" className="text-base font-semibold mb-2 block">
                                Nhận xét của bạn
                            </Label>
                            <Textarea
                                id="comment"
                                placeholder="Chia sẻ trải nghiệm của bạn về khóa học..."
                                value={comment}
                                onChange={(e) => setComment(e.target.value)}
                                rows={4}
                                maxLength={500}
                                className="resize-none"
                            />
                            <p className="text-xs text-gray-500 mt-1 text-right">
                                {comment.length}/500 ký tự
                            </p>
                        </div>

                        <Button onClick={handleSubmit} disabled={isSubmitting || rating === 0 || !comment.trim()} className="w-full border border-pink-600 bg-white text-pink-600 hover:bg-pink-600 hover:text-white cursor-pointer">
                            {isSubmitting ? 'Đang gửi...' : 'Gửi đánh giá'}
                        </Button>
                    </CardContent>
                </Card>
            )}

            {feedbacks.length === 0 ? (
                <div className="text-center py-10 text-gray-500">
                    <p>Chưa có đánh giá nào cho khóa học này.</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {feedbacks.map((feedback, index) => (
                        <FeedbackItem key={feedback.feedback_id || `feedback-${index}`} {...feedback} />
                    ))}
                </div>
            )}
        </div>
    )
}

function FeedbackItem({
    user,
    rating,
    comment,
    createdAt,
}: FeedBack) {
    return (
        <Card className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
                <div className="space-y-3">
                    <div className="flex items-center justify-between">
                        <h4 className="font-semibold text-gray-900">{user.fullName}</h4>
                        <span className="text-sm text-gray-500">{formatDate(createdAt)}</span>
                    </div>
                    <div className="flex gap-1">
                        {Array.from({ length: 5 }).map((_, index) => {
                            const isFilled = index < rating;
                            return (
                                <Star key={index}  className={`h-4 w-4 ${isFilled ? 'fill-yellow-400 text-yellow-400' : 'fill-gray-200 text-gray-200' }`} />
                            );
                        })}
                    </div>
                    <p className="text-gray-700 leading-relaxed">{comment}</p>
                </div>
            </CardContent>
        </Card>
    )
}