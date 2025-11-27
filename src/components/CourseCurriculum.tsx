"use client";
import React, { useState } from 'react';
import { ChevronDown, ChevronUp, PlayCircle, FileCheck, BookOpenCheck } from 'lucide-react';
import { useIsMobile } from '@/hooks/useIsMobile';
import { Chapter, Lesson } from '@/type/course.type';

interface CourseCurriculumProps {
  chapters: Chapter[];
  total_duration?: string;
}

export default function CourseCurriculum({ chapters }: CourseCurriculumProps) {
  const [expandedChapters, setExpandedChapters] = useState<string[]>([chapters[0]?.chapter_id]);
  const isMobile = useIsMobile();

    /* chapters.reduce(...): chạy qua từng phần tử trong mảng chapters.​
  Tham số đầu của callback là sum (accumulator) – giá trị đang được cộng dồn qua mỗi vòng lặp.​
  Tham số thứ hai là chapter – phần tử chapter hiện tại trong mảng.​
  sum + (chapter.lessons?.length || 0):
  Lấy số lessons trong chapter hiện tại (chapter.lessons?.length), nếu không có thì dùng 0.
  Cộng vào sum để tạo ra tổng mới.
  }, 0);: 0 là giá trị khởi đầu của sum (accumulator). */
  const countTotalLessons = () => {
    return chapters.reduce((sum, chapter) => {
      return sum + (chapter.lessons?.length || 0);
    }, 0)
  }
  const total_lessons = countTotalLessons();
//  nếu chương đó đang được mở -> đóng, nếu nó đang đóng -> mở, có thể mở nhiều chương cùng lúc.
  const toggleChapter = (chapterId: string) => {
    if (expandedChapters.includes(chapterId)) {
      setExpandedChapters(expandedChapters.filter((id) => id !== chapterId)); /* filter sẽ tạo ra mảng mới, mảng mà đã loại bỏ chapterId. */
    } else {
      setExpandedChapters([...expandedChapters, chapterId]);
    }
  };

  const formatDuration = (duration: string | number | undefined) => {
    const minutes = typeof duration === 'string' ? parseInt(duration) : duration ?? 0;
    if (minutes < 60) {
      return `${minutes}m`;
    }
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  };

  return (
    <div>
      <div className={`${isMobile ? 'flex flex-col mb-6 ' : 'flex justify-between items-center mb-6'}`}>
        <h2 className="font-roboto-condensed-bold text-2xl">Nội dung khoá học</h2>
        <span className="font-roboto-bold text-pink-600">
          {chapters.length} chapters • {total_lessons} lessons {/* • {total_duration} total length */}
        </span>
      </div>

      <div className="space-y-2">
        {chapters.map((chapter) => {
          const isExpanded = expandedChapters.includes(chapter.chapter_id);
          const chapterLessons: Lesson[] = chapter.lessons ?? [];
          const totalChapterDuration = chapterLessons.reduce((sum, lesson) => {
            const duration = typeof lesson.duration === 'string' ? parseInt(lesson.duration) : lesson.duration ?? 0;
            return sum + duration;
          }, 0);

          return (
            <div key={chapter.chapter_id} className="border border-gray-200 rounded-t-2xl">
              <button
                onClick={() => toggleChapter(chapter.chapter_id)}
                className="w-full flex items-center cursor-pointer justify-between p-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-center gap-3">
                  {isExpanded ? (
                    <ChevronUp className="w-5 h-5 text-gray-600" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-gray-600" />
                  )}
                  <span className="font-roboto-bold text-left">{chapter.chapter_title ?? ""}</span>
                </div>
                <span className="font-roboto text-sm text-gray-600">
                  {chapterLessons.length} lessons • {formatDuration(totalChapterDuration)}
                </span>
              </button>

              {isExpanded && (
                <div className="border-t border-gray-200 bg-gray-50 ">
                  {chapterLessons.map((lesson) => (
                    <div key={lesson.lesson_id} className="flex items-center cursor-pointer hover:bg-black  justify-between p-4 border-b border-gray-200 group last:border-b-0">
                      <div className="flex items-center gap-3 ">
                        {lesson.isCompleted ? (
                          <FileCheck className="w-5 h-5 text-green-600" />
                        ) : (
                          <PlayCircle className="w-5 h-5 text-gray-600 group-hover:text-white" />
                        )}
                        <span className="font-roboto text-gray-700 group-hover:text-white">{lesson.title ?? ""}</span>
                      </div>
                      <span className="font-roboto text-sm text-gray-600 group-hover:text-white">
                        {formatDuration(lesson.duration)}
                      </span>
                    </div>
                  ))}
                  {chapter.quiz ? (
                    <div className='Quiz w-full h-12 bg-white border-pink-600 border rounded-b-2xl  flex items-center pl-4 justify-items-center gap-3 cursor-pointer group hover:bg-pink-600'>
                    <BookOpenCheck className='text-pink-600  group-hover:text-white' size={20}></BookOpenCheck>
                    <span className='text-pink-600 font font-roboto-condednsed group-hover:text-white'>
                      {chapter.quiz?.title ?? "Chương này không có bài kiểm tra cuối chương"}
                    </span>
                  </div>
                  ) : (
                    <div className='Quiz w-full h-12 bg-gray-300  flex items-center pl-4 justify-items-center gap-3 cursor-not-allowed'>
                      <BookOpenCheck className='text-gray-500 group-hover:text-white' size={20}></BookOpenCheck>
                      <span className='text-gray-500 font font-roboto-condednsed group-hover:text-white'>
                        {"Chương này không có bài kiểm tra cuối chương"}
                      </span>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
