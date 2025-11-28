"use client"
import React from 'react'
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion"
import { useIsMobile } from '@/hooks/useIsMobile'
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"
import { Chapter, Lesson } from '@/type/course.type'
import { Button } from './ui/button'
import { PlayCircle } from 'lucide-react'

type ChapterBoxProps = {
    chapters: Chapter[];
    emptyState?: React.ReactNode | string;
    onLessonSelect?: (lesson: Lesson) => void;
    onQuizSelect?: (quiz: Chapter['quiz']) => void;
    currentLessonId?: string;
}

const ChapterBox: React.FC<ChapterBoxProps> = ({
    chapters = [],
    emptyState = "Chương này chưa có bài học nào",
    onLessonSelect,
    onQuizSelect,
    currentLessonId
}) => {
    const isMobile = useIsMobile();
    if (chapters.length === 0) {
        return (
            <div className="container">
                {typeof emptyState === 'string' ? <p>{emptyState}</p> : emptyState}
            </div>
        )
    }
    return (
        <ScrollArea className={`${isMobile ? 'h-screen w-full' : 'h-screen w-[500px]'}`}>
            <div className={`container ${isMobile ? `w-full` : `w-fit`}`}>
                <Accordion defaultValue='item-0' type='single' collapsible className={`${isMobile ? `w-full justify-items-center` : 'w-[470px]'} p-2 cursor-pointer flex flex-col gap-1 h-fit`}>
                    <ScrollArea className={`${isMobile ? 'w-full h-[calc(100vh-100px)] rounded-md' : 'w-[500px] h-[calc(100vh-100px)] rounded-md'}`}>
                        {chapters.map((chapter, index) => {
                            const totalLesson = chapter.lessons?.length || 0;
                            const countCompletedLesson = chapter.lessons?.filter(lesson => lesson.isCompleted).length || 0;
                            
                            return (
                                <AccordionItem key={chapter.chapter_id} value={`item-${index}`} className='border-[0.2] mb-1 rounded'>
                                    <AccordionTrigger className='cursor-pointer pl-4 pr-4'>
                                        <span className='font-semibold text-[16px]'>
                                            {chapter.chapter_title}
                                        </span>
                                        <span className='text-[13px] ml-auto font-roboto-condensed text-gray-500'>
                                            {countCompletedLesson}/{totalLesson} bài học
                                        </span>
                                    </AccordionTrigger>
                                    <AccordionContent className='px-2'>
                                        {/* Lessons */}
                                        {chapter.lessons && chapter.lessons.length > 0 && (
                                            <div className="space-y-1">
                                                {chapter.lessons.map((lesson) => (
                                                    <button
                                                        key={lesson.lesson_id}
                                                        onClick={() => onLessonSelect?.(lesson)}
                                                        className={`w-full text-left p-3 rounded-lg transition-colors ${
                                                            currentLessonId === lesson.lesson_id
                                                                ? 'bg-pink-100 border-pink-500 border'
                                                                : 'hover:bg-pink-100'
                                                        }`}>
                                                        <div className="flex items-center gap-3 cursor-pointer">
                                                            <PlayCircle 
                                                                size={20} 
                                                                className={currentLessonId === lesson.lesson_id ? 'text-pink-600' : 'text-pink-400'}
                                                            />
                                                            <div className="flex-1">
                                                                <p className={`font-medium ${currentLessonId === lesson.lesson_id ? 'text-pink-600' : 'text-pink-700'}`}>
                                                                    {lesson.title}
                                                                </p>
                                                                {lesson.duration && (
                                                                    <p className="text-sm text-pink-500">{lesson.duration}</p>
                                                                )}
                                                            </div>
                                                            {lesson.isCompleted && (
                                                                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                                            )}
                                                        </div>
                                                    </button>
                                                ))}
                                            </div>
                                        )}
                                        
                                        {/* Quiz */}
                                        {chapter.quiz && (
                                            <div className="mt-2  ">
                                                <Button
                                                    onClick={() => onQuizSelect?.(chapter.quiz)}
                                                    variant="outline"
                                                    className="w-full justify-start h-15 cursor-pointer"
                                                >
                                                    <PlayCircle size={20} className="mr-2 text-orange-500" />
                                                    {chapter.quiz.title || 'Bài kiểm tra'}
                                                </Button>
                                            </div>
                                        )}
                                    </AccordionContent>
                                </AccordionItem>
                            )
                        })}
                        <ScrollBar orientation='vertical'></ScrollBar>
                    </ScrollArea>
                </Accordion>
            </div>
            <ScrollBar orientation='vertical'></ScrollBar>
        </ScrollArea>
    )
}

export default ChapterBox
