"use client"
import React, { useState } from 'react'
import { Lesson } from './Lesson'
import ListLessonRaw from '@/Mock/MockData/ListLesson.json'

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

type LessonListProps = {
    items?: LessonRawData[]
    currentId?: string
    totalCount?: number
    emptyState?: React.ReactNode | string
}

const LessonList: React.FC<LessonListProps> = ({
    items = ListLessonRaw as LessonRawData[],
    currentId,
    totalCount,
    emptyState = "Không có bài học nào"
}) => {

    const [currentPlayingId, setCurrentPlayingId] = useState<string | undefined>(currentId)
    const [loadingId, setLoadingId] = useState<string | null>(null)

    const handlePlay = (id: string) => {
        console.log('▶️ Đang phát bài học:', id)
        setLoadingId(id)
        setTimeout(() => {
            setCurrentPlayingId(id)
            setLoadingId(null)
        }, 500)
    }

    const handleLockClick = (id: string) => {
        console.log('🔒 Lesson bị khóa:', id)
        alert('⚠️ Bài học này yêu cầu Premium!')
    }

    const handleOpen = (id: string) => {
        console.log('📂 Mở lesson:', id)
        // router.push(`/lessons/${id}`)
    }

    if (!items || items.length === 0) {
        return (
            <div className="container py-8 text-center text-gray-500">
                {typeof emptyState === 'string' ? <p>{emptyState}</p> : emptyState}
            </div>
        )
    }
    return (
        <div className="container py-4 flex flex-col px-5 w-fit ">

            <div className="flex justify-between">
                <div className="mb-4 flex justify-end">
                    <p className="text-sm text-gray-600">
                        {totalCount || items.length} bài học
                    </p>
                </div>
                <div className="rounded-lg">
                    <p className="text-sm text-gray-600">
                        Đã hoàn thành: {items.filter(l => l.is_completed).length}/{items.length}
                    </p>
                </div>
            </div>

            <div className="flex flex-col gap-3">
                {items.map((lesson) => (
                    <Lesson
                        key={lesson.lesson_id}

                        lesson_id={lesson.lesson_id}
                        title={lesson.title}
                        videoUrl={lesson.video_url}
                        duration={lesson.duration}
                        thumbnailUrl={lesson.thumbnail_url}
                        isCompleted={lesson.is_completed}
                        isLocked={lesson.is_locked}
                        progress={lesson.progress}
                        badge={lesson.badge}

                        onHightLight={currentPlayingId === lesson.lesson_id}
                        isLoading={loadingId === lesson.lesson_id}

                        onplay={handlePlay}
                        onOpen={handleOpen}
                        onLockClick={handleLockClick}
                    />
                ))}
            </div>


        </div>
    )
}

export default LessonList
