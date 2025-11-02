import React from 'react'
import { SquarePlay, Lock,Check, Loader2 } from "lucide-react"

type LessonProps = {
    lesson_id: string
    title: string
    videoUrl: string
    duration?: string | number
    thumbnailUrl?: string
    isCompleted?: boolean
    isLocked?: boolean
    progress?: number
    badge?: string

    onHightLight?: boolean 
    isLoading?: boolean

    onplay: (id: string) => void
    onToggleComplete?: (id: string, next: boolean) => void
    onOpen?: (id: string) => void
    onLockClick?: (id: string) => void
}

export const Lesson: React.FC<LessonProps> = ({
    lesson_id,
    title,
    /* videoUrl, */
    duration, 
    /* thumbnailUrl, */
    isCompleted = false,
    isLocked = false,
    /* progress = 0, */
    badge,
    onHightLight = false,
    isLoading = false,
    onplay,
    /* onToggleComplete, */
    onOpen,
    onLockClick
}) => {

    const handleClick = () => {
        if (isLocked && onLockClick) {
            onLockClick(lesson_id)
            return 
        }
        
        if (onOpen) {
            onOpen(lesson_id)
        }
        
        onplay(lesson_id)
    }

    return (
        <div className="container">
            <div 
                onClick={handleClick} 
                className={`
                    flex group w-full md:w-[400px] border-b border-gray-300 
                    min-h-[50px] justify-start gap-3 py-2 px-3 items-center 
                    hover:shadow-md transition rounded-sm hover:bg-gray-800
                    
                    ${onHightLight ? 'bg-gray-800 rounded-lg' : ''}
                    ${isLocked ? 'opacity-60 cursor-not-allowed' : 'hover:cursor-pointer'}
                    ${isCompleted ? '' : ''}
                `}
            >
                <div className="icon w-[30px] h-[30px] flex justify-center items-center">
                    {isLoading ? (
                        <Loader2 className={`animate-spin ${onHightLight ? 'text-white' : 'text-white'}`} size={24} />
                    ) 
                    : isLocked ? (
                        <Lock className={` ${onHightLight ? 'text-white' : 'text-black'} group-hover:text-white`} size={20} />
                    ) 
                    : isCompleted ? (
                        <Check className={` ${onHightLight ? 'text-white' : 'text-black'} group-hover:text-white`} size={20} />
                    ) 
                    : (
                        <SquarePlay className={` ${onHightLight ? 'text-white' : 'text-black'} group-hover:text-white`} size={24} />
                    )}
                </div>

                <div className="flex-1 flex flex-col">
                    <p className={`
                        text-base font-medium
                        ${onHightLight ? 'text-white font-semibold' : 'text-gray-800'}
                        group-hover:text-white 
                    `}>
                        {title}
                    </p>
                    
                    {duration && (
                        <span className="text-xs text-gray-500 mt-1 group-hover:text-white">
                            ⏱️ {duration}
                        </span>
                    )}
                </div>

                {badge && (
                    <span className="text-xs px-2 py-1 bg-yellow-100 text-yellow-700 rounded-full">
                        {badge}
                    </span>
                )}
            </div>
        </div>
    )
}
