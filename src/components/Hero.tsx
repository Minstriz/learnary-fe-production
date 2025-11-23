"use client"
import React from 'react'
import Image from 'next/image'
import { BackgroundBeamsWithCollision } from '@/components/ui/background-hero'
import { useIsMobile } from "@/hooks/useIsMobile";
// import { Button } from './ui/button';
export default function Hero() {
    const isMobile = useIsMobile();
    return (
        <div className={`${isMobile ? 'w-full h-full overflow-hidden' : 'w-full h-screen overflow-hidden flex items-center'}`}>
            <BackgroundBeamsWithCollision className={`${isMobile ? 'w-full h-full bg-white' : 'w-full h-full bg-white'}`}>
                {!isMobile && (
                    <>
                        <div className="w-full px-10 py-6 flex items-center gap-8 justify-center flex-col h-full">
                            <div className="flex items-center justify-center gap-5 relative">
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

                            <div className='flex flex-col items-center gap-4 '>
                                <h1 className='font-rosario text-4xl font-rosario-bold'>Bắt đầu một khoá học, mở khoá vạn tương lai!</h1>
                                <div className="flex font-roboto-condensed gap-1 text-xl">
                                    <h3 className=''>Kiến thức chưa bao giờ là điều nhỏ nhặt, để trở thành</h3>
                                    <p className='font-roboto-bold  text-[#371D8C]'>một người khổng lồ!</p>
                                </div>
                            </div>


                        </div>
                    </>
                )}

                {isMobile && (
                    <div className="w-full h-full flex items-center justify-center">
                        <div className="relative w-full h-full">
                            <Image
                                src="/resource/hero/hero1.jpg"
                                alt="Hero 1"
                                fill
                                className="object-cover object-top"
                                priority
                            />

                            {/* Overlay */}
                            <div className="absolute inset-0 bg-white/60"></div>

                            {/* Content */}
                            <div className="absolute inset-0 flex flex-col items-center justify-center p-6 gap-6">
                                <div className="max-w-[90%] sm:max-w-[320px] w-full flex flex-col gap-4">
                                    <h1 className="font-rosario text-2xl font-rosario-bold text-center text-black leading-tight">
                                        Bắt đầu một khoá học<br />Mở khoá vạn tương lai
                                    </h1>
                                    <p className="font-roboto text-sm text-center text-gray-700">
                                        Kiến thức chưa bao giờ là điều nhỏ nhặt
                                    </p>
                                </div>
                                
                            {/*     <div className="flex flex-col gap-3 w-full max-w-[280px]">
                                    <Button 
                                        variant={'outline'}
                                        className='cursor-pointer'
                                    >
                                        Khám phá khóa học
                                    </Button>
                                    <Button 
                                        variant="outline" 
                                        className='cursor-pointer'
                                    >
                                        Trở thành giảng viên
                                    </Button>
                                </div> */}
                            </div>
                        </div>
                    </div>
                )}
            </BackgroundBeamsWithCollision>
        </div>
    )
}
