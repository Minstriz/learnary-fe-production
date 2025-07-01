"use client"
import React from 'react'
import { useIsMobile } from "@/hooks/useIsMobile";
import TopicCarosel from './TopicCarosel';
export default function ListTopic() {
    const isMobile = useIsMobile();
    return (
        <div>
            {!isMobile && (
                <div className="w-full p-10 rounded-lg bg-white mt-3 flex-col flex justify-center">
                    <div className="flex justify-between">
                        <div className="flex gap-2 items-end">
                            <p className='font-roboto-condensed-bold text-3xl'>Bắt đầu với chủ đề bạn</p> <p className='font-roboto-condensed-bold text-5xl text-[#FF4A5F]'>YÊU THÍCH</p>
                        </div>
                        <div>
                            <p className='font-roboto text-[#696969] text-xl w-[500]'>Chúng tôi đã chuẩn bị sẵn những chủ đề có thể sẽ phù hợp với bạn – chỉ chờ bạn bắt đầu hành trình của mình</p>
                        </div>
                    </div>
                    <TopicCarosel />
                    <p className="font-roboto text-[#696969] text-right hover:underline cursor-pointer">
                        Xem thêm chủ đề
                    </p>
                </div>
            )}

            {isMobile && (
                <div className="w-full p-5 rounded-lg bg-white">
                    <div className="flex flex-col justify-between gap-5">
                        <div className="flex gap-2 items-end">
                            <p className='font-roboto-condensed-bold text-3xl'>Bắt đầu với chủ đề bạn</p>
                            <p className='font-roboto-condensed-bold text-3xl text-[#FF4A5F]'>YÊU THÍCH</p>
                        </div>
                        <p className='font-roboto text-md w-[449]'>Chúng tôi đã chuẩn bị sẵn những chủ đề đúng với đam mê của bạn – chỉ chờ bạn bắt đầu hành trình của mình</p>
                    </div>
                    <TopicCarosel />
                    <p className="font-roboto text-[#696969] text-center hover:underline cursor-pointer">
                        Xem thêm chủ đề
                    </p>
                </div>
            )}
        </div>
    )
}
