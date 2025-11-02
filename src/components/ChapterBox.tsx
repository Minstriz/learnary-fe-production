"use client"
import React from 'react'
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion"
import LessonList from './LessonList'
import ChapterLesson from '@/Mock/MockData/ChapterLesson.json'
import { useIsMobile } from '@/hooks/useIsMobile'
import { ScrollArea , ScrollBar} from "@/components/ui/scroll-area"
export type LessonRawData = {
    lesson_id: string
    chapter_id: string
    title: string
    video_url: string
    is_completed: boolean
    duration: string
    thumbnail_url?: string
    is_locked?: boolean
    progress?: number
    badge?: string
    created_at: string
    updated_at: string
}
export type LessonData = {
    id: string
    chapterId: string
    title: string
    videoUrl: string
    isCompleted: boolean
    duration: string
    thumbnailUrl?: string
    isLocked?: boolean
    progress?: number
    badge?: string
    createdAt?: string
    updatedAt?: string
}

export const MockChapterData = ChapterLesson.course_001_chapters;
type ChapterBoxProps = {
    chapters: typeof MockChapterData,
    emptyState?: React.ReactNode | string
    //ReactNode là đại diện tất cả mọi thứ có thể render trong React
}


const ChapterBox: React.FC<ChapterBoxProps> = ({
    chapters = MockChapterData,
    emptyState = "Chương này chưa có bài học nào"
}) => {
    const isMobile = useIsMobile();
    if (chapters.length == 0) {
        return (
            <div className="container">
                {typeof emptyState === 'string' ? <p>{emptyState}</p> : emptyState}
            </div>
        )
    }
    return (
        <ScrollArea className='h-screen w-[500px]'>
            <div className={`container ${isMobile ? `w-full` : `w-fit`}`}>
                <Accordion type='single' collapsible className={`${isMobile ? `w-full justify-items-center` : 'w-[470px]'} p-2 cursor-pointer flex flex-col gap-1 h-fit`}>
                    <ScrollArea className='w-[500px] h-[calc(100vh-100px)] rounded-md'>
                        {chapters.map((chapters, index) => {
                            const totalLesson = chapters.lessons.length;
                            const countCompletedLesson = chapters.lessons.filter(lessons => lessons.is_completed).length;
                            return (
                                <AccordionItem key={chapters.chapter_id} value={`item-${index}`} className='border-[0.2] mb-1 rounded'>
                                    <AccordionTrigger className='cursor-pointer pl-4 pr-4 '>
                                        <span className='font-semibold text-[16px]'>
                                            {chapters.chapter_title}
                                        </span>
                                        <span className='text-[13px] ml-auto font-roboto-condensed text-gray-500 '>
                                            {countCompletedLesson}/{totalLesson} bài học
                                        </span>
                                    </AccordionTrigger>
                                    <AccordionContent className=''>
                                        <LessonList></LessonList>
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