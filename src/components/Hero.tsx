"use client"
import React from 'react'
import Image from 'next/image'
import { BackgroundBeamsWithCollision } from '@/components/ui/background-hero'
import { useIsMobile } from "@/hooks/useIsMobile";
export default function Hero() {
    const isMobile = useIsMobile();
    return (
        <div className='w-full'>
            <BackgroundBeamsWithCollision className='h-fit'>
                {!isMobile && (
                    <>
                        <div className="w-full p-10 flex items-center gap-10 justify-between">
                            <div className='flex flex-col items-start gap-4 '>
                                <h1 className='font-rosario text-4xl font-rosario-bold'>Bắt đầu một khoá học, mở khoá vạn tương lai!</h1>
                                <div className="flex font-roboto gap-1 text-xl">
                                    <h3 className=''>Kiến thức chưa bao giờ là điều nhỏ nhặt, để trở thành</h3>
                                    <p className='font-roboto-bold  text-[#371D8C]'>một người khổng lồ!</p>
                                </div>
                            </div>

                            <div className="flex items-end justify-center gap-4 relative">
                                {/* Hình 1 (trái) */}
                                <div className="z-10">
                                    <Image
                                        src="/resource/hero/hero2.jpg"
                                        alt="Hero 2"
                                        width={250}
                                        height={400}
                                        className="rounded-lg shadow-lg"
                                        style={{ objectFit: 'contain' }}
                                    />
                                </div>
                                {/* Hình 2 (giữa, nổi lên trên) */}
                                <div className="z-20">
                                    <Image
                                        src="/resource/hero/hero1.jpg"
                                        alt="Hero 1"
                                        width={250}
                                        height={400}
                                        className="rounded-lg shadow-2xl"
                                        style={{ objectFit: 'contain' }}
                                    />
                                </div>
                                {/* Hình 3 (phải) */}
                                <div className="z-10">
                                    <Image
                                        src="/resource/hero/hero3.jpg"
                                        alt="Hero 3"
                                        width={250}
                                        height={400}
                                        className="rounded-lg shadow-lg"
                                        style={{ objectFit: 'contain' }}
                                    />
                                </div>
                            </div>
                        </div>
                    </>
                )}

                {isMobile && (
                    <>
                        <div className="flex-col mt-1">
                            <div className="relative flex items-center justify-center w-screen left-1/2 right-1/2 -translate-x-1/2" style={{ height: 360 }}>
                                {/* Ảnh */}
                                <div className="w-full h-full overflow-hidden shadow-2xl">
                                    <Image
                                        src="/resource/hero/hero1.jpg"
                                        alt="Hero 1"
                                        width={500}
                                        height={200}
                                        className="w-full h-full object-cover object-top"
                                        style={{ objectFit: 'cover', objectPosition: 'top' }}
                                    />
                                    {/* Overlay */}
                                    <div className="absolute inset-0 bg-white/60"></div>
                                    {/* Text và nút */}
                                    <div className="absolute inset-0 flex flex-col items-center justify-center p-4 pb-10 gap-2 w-full">
                                        <div className="max-w-[320px] w-full flex-col flex">
                                            <h1 className="font-rosario text-2xl font-rosario-bold text-center text-black leading-tight break-words">
                                                Bắt đầu một khoá học<br />Mở khoá vạn tương lai
                                            </h1>
                                            <button className="mt-3 px-4 py-2 bg-white/80 text-black rounded font-roboto-bold text-sm shadow w-full">
                                                Bắt đầu một khoá học
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </>
                )}

            </BackgroundBeamsWithCollision>
        </div>
    )
}
