"use client"
import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Quiz, Question, Answer } from '@/type/course.type';
import api from '@/app/lib/axios';
import { toast } from 'sonner';
import { AlertCircle, CheckCircle2, XCircle } from 'lucide-react';

type QuizDialogProps = {
  quiz: Quiz & { questions: Question[] };
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onComplete?: () => void;
};

const QuizDialog: React.FC<QuizDialogProps> = ({ quiz, open, onOpenChange, onComplete }) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [startTime, setStartTime] = useState<number>(Date.now());
  const [showResult, setShowResult] = useState(false);
  const [result, setResult] = useState<{ score: number; total: number } | null>(null);

  useEffect(() => {
    if (open) {
      setStartTime(Date.now());
      setCurrentQuestionIndex(0);
      setAnswers({});
      setShowResult(false);
      setResult(null);
    }
  }, [open]);

  const currentQuestion = quiz.questions[currentQuestionIndex];
  const totalQuestions = quiz.questions.length;
  const isLastQuestion = currentQuestionIndex === totalQuestions - 1;
  const allQuestionsAnswered = Object.keys(answers).length === totalQuestions;

  const handleAnswerChange = (questionId: string, optionId: string) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: optionId
    }));
  };

  const handleNext = () => {
    if (currentQuestionIndex < totalQuestions - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  const calculateDuration = (): string => {
    const duration = Math.floor((Date.now() - startTime) / 1000);
    const minutes = Math.floor(duration / 60);
    const seconds = duration % 60;
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  };

  const handleSubmit = async () => {
    if (!allQuestionsAnswered) {
      toast.error('Vui lòng trả lời tất cả các câu hỏi!');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        quiz_id: quiz.quiz_id,
        answers: Object.entries(answers).map(([question_id, option_id]) => ({
          question_id,
          option_id
        })),
        duration: calculateDuration()
      };

      const response = await api.post('/submissions/create', payload);
      
      // Calculate score
      const correctAnswers = response.data.answers?.filter((a: Answer) => a.is_correct).length || 0;
      setResult({
        score: correctAnswers,
        total: totalQuestions
      });
      setShowResult(true);
      
      toast.success('Nộp bài thành công!');
      
      if (onComplete) {
        onComplete();
      }
    } catch (error) {
      console.error('Error submitting quiz:', error);
      toast.error('Có lỗi xảy ra khi nộp bài!');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!showResult && Object.keys(answers).length > 0) {
      if (!confirm('Bạn chưa hoàn thành bài kiểm tra. Bạn có chắc muốn thoát?')) {
        return;
      }
    }
    onOpenChange(false);
  };

  const getScoreColor = (score: number, total: number) => {
    const percentage = (score / total) * 100;
    if (percentage >= 80) return 'text-green-600';
    if (percentage >= 50) return 'text-yellow-600';
    return 'text-red-600';
  };

  if (!currentQuestion) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">{quiz.title}</DialogTitle>
          <DialogDescription>
            {showResult ? (
              <div className="flex items-center gap-2 mt-2">
                {result && result.score / result.total >= 0.8 ? (
                  <CheckCircle2 className="text-green-600" />
                ) : (
                  <AlertCircle className="text-yellow-600" />
                )}
                <span>Kết quả bài kiểm tra của bạn</span>
              </div>
            ) : (
              `Câu hỏi ${currentQuestionIndex + 1}/${totalQuestions}`
            )}
          </DialogDescription>
        </DialogHeader>

        {showResult && result ? (
          <div className="py-8 text-center">
            <div className={`text-6xl font-bold mb-4 ${getScoreColor(result.score, result.total)}`}>
              {result.score}/{result.total}
            </div>
            <p className="text-lg text-gray-600 mb-2">
              Bạn đã trả lời đúng {result.score} trên {result.total} câu hỏi
            </p>
            <p className="text-sm text-gray-500">
              Tỷ lệ: {((result.score / result.total) * 100).toFixed(1)}%
            </p>
            
            <div className="mt-8 space-y-4">
              {quiz.questions.map((question, idx) => {
                const userAnswerId = answers[question.question_id];
                const correctOption = question.options?.find(opt => opt.is_correct);
                const userOption = question.options?.find(opt => opt.option_id === userAnswerId);
                const isCorrect = userAnswerId === correctOption?.option_id;

                return (
                  <div key={question.question_id} className="text-left border rounded-lg p-4">
                    <div className="flex items-start gap-2 mb-2">
                      {isCorrect ? (
                        <CheckCircle2 className="text-green-600 mt-1 shrink-0" size={20} />
                      ) : (
                        <XCircle className="text-red-600 mt-1 shrink-0" size={20} />
                      )}
                      <div className="flex-1">
                        <p className="font-semibold">Câu {idx + 1}: {question.title}</p>
                        <p className="text-sm text-gray-600 mt-1">
                          Câu trả lời của bạn: <span className={isCorrect ? 'text-green-600' : 'text-red-600'}>
                            {userOption?.option_content}
                          </span>
                        </p>
                        {!isCorrect && (
                          <p className="text-sm text-green-600 mt-1">
                            Đáp án đúng: {correctOption?.option_content}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div>
            <div className="py-6">
              <h3 className="text-lg font-semibold mb-4">{currentQuestion.title}</h3>
              <RadioGroup
                value={answers[currentQuestion.question_id] || ''}
                onValueChange={(value) => handleAnswerChange(currentQuestion.question_id, value)}
              >
                <div className="space-y-3">
                  {currentQuestion.options?.map((option) => (
                    <div key={option.option_id} className="flex items-center space-x-2 border rounded-lg p-3 hover:bg-gray-50 cursor-pointer">
                      <RadioGroupItem value={option.option_id} id={option.option_id} />
                      <Label htmlFor={option.option_id} className="flex-1 cursor-pointer">
                        {option.option_content}
                      </Label>
                    </div>
                  ))}
                </div>
              </RadioGroup>
            </div>

            <div className="flex gap-2 flex-wrap mb-4">
              {quiz.questions.map((q, idx) => (
                <button
                  key={q.question_id}
                  onClick={() => setCurrentQuestionIndex(idx)}
                  className={`w-8 h-8 rounded-full text-sm font-semibold transition-colors ${
                    idx === currentQuestionIndex
                      ? 'bg-blue-600 text-white'
                      : answers[q.question_id]
                      ? 'bg-green-200 text-green-800'
                      : 'bg-gray-200 text-gray-600'
                  }`}
                >
                  {idx + 1}
                </button>
              ))}
            </div>
          </div>
        )}

        <DialogFooter>
          {showResult ? (
            <Button onClick={handleClose} className="w-full">
              Đóng
            </Button>
          ) : (
            <div className="flex justify-between w-full gap-2">
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={handlePrevious}
                  disabled={currentQuestionIndex === 0}
                >
                  Câu trước
                </Button>
                <Button
                  variant="outline"
                  onClick={handleNext}
                  disabled={isLastQuestion}
                >
                  Câu sau
                </Button>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={handleClose}>
                  Hủy
                </Button>
                <Button
                  onClick={handleSubmit}
                  disabled={!allQuestionsAnswered || isSubmitting}
                >
                  {isSubmitting ? 'Đang nộp bài...' : 'Nộp bài'}
                </Button>
              </div>
            </div>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default QuizDialog;
