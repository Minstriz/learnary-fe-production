"use client"
import React, { useEffect, useRef, useState } from 'react'
import ChapterBox, { MockChapterData } from '@/components/ChapterBox'
import { useIsMobile } from '@/hooks/useIsMobile'
import "plyr/dist/plyr.css";
import ListLesson from '@/Mock/MockData/ListLesson.json';
import Video from "@/components/Video"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
/* import { SpinnerLoading } from '@/components/LoadingSpinner'; */

interface LessonProps {
  lesson_id: string,
  chapter_id: string,
  title: string,
  video_url: string,
  is_completed: boolean,
  duration: string,
  thumbnail_url: string,
  is_locked: boolean,
  progress: number,
  badge?: string,
  created_at: string,
  updated_at: string,
}

const CourseDetailPage = () => {
  const isMobile = useIsMobile();
  const playerRef = useRef<Plyr | null>(null);
  const [pageIsLoading, setPageIsLoading] = useState<boolean>(true);
  const lessons = ListLesson as LessonProps[];
  const currentLesson = lessons[0];

  const setupPlayer = async () => {
    if (!playerRef.current) {
      const Plyr = await import('plyr');
      playerRef.current = new Plyr.default("#player", {
        quality: {
          options: [360, 720, 1080, 2160],
          default: 1080,
        },
      });
    }
  }
  useEffect(() => {
    const timer = setTimeout(() => {
      setupPlayer().then(() => {
        setPageIsLoading(false)
      })
    }, 500)
    return () => {
      if (playerRef.current) {
        playerRef.current.destroy();
      }
      clearTimeout(timer);
    }
  }, []);

  return isMobile ? (
    <div className={`flex h-full ${isMobile ? 'w-full flex-col' : 'w-full'}`}>
      {!pageIsLoading ? (
        <div>
          <div className="flex flex-col">
            <div className="breadcrumb ml-5 pt-5">
              <Breadcrumb>
                <BreadcrumbList>
                  <BreadcrumbItem>
                    <BreadcrumbLink href="/">Home</BreadcrumbLink>
                  </BreadcrumbItem>
                  <BreadcrumbSeparator />
                  <BreadcrumbItem>
                    <BreadcrumbLink href="/">Khu vực học tập</BreadcrumbLink>
                  </BreadcrumbItem>
                  <BreadcrumbSeparator />
                  <BreadcrumbItem>
                    <BreadcrumbPage>Bài học đầu đời</BreadcrumbPage>
                  </BreadcrumbItem>
                </BreadcrumbList>
              </Breadcrumb>
            </div>
            <div className={`video grow h-fit text-center m-3 rounded border-3`}>
              <Video video_url={currentLesson.video_url}></Video>
            </div>
            <div className="tab mt-3">
              <Tabs defaultValue="account" className="w-full">
                <TabsList className='mb-2 ml-5'>
                  <TabsTrigger value="account" className='pl-5'>Ghi chú</TabsTrigger>
                  <TabsTrigger value="password" className='pl-5'>Ghi cô</TabsTrigger>
                </TabsList>
                <TabsContent value="account" className=' mb-10 pl-8'>Bạn chưa có ghi chú nào ở bài học này</TabsContent>
                <TabsContent value="password" className='pl-5 mb-10'>
                  <form action="" className='flex gap-5 justify-baseline flex-col'>
                    <Textarea placeholder='Thêm ghi chú của bạn vào đây...'></Textarea>
                    <Button className='cursor-pointer inline-block align-bottom'>Ghi chú</Button>
                  </form>
                </TabsContent>
              </Tabs>
            </div>
          </div>
          <div className='ChapterBox flex justify-center items-center w-full'>
            <ChapterBox chapters={MockChapterData} emptyState={'Chưa có bài học nào'}></ChapterBox>
          </div>
        </div>
      ) : (
        <div className='w-full h-full flex items-center justify-center'>
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
        </div>
      )}
    </div>
  ) : (
    <div className={`flex flex-col w-full h-screen pl-10 pr-20 pb-20 pt-5`}>
      {!pageIsLoading ? (
        <div className='flex flex-col'>
          <div className="breadcrumb ml-5 pb-5">
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbLink href="/">Home</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbLink href="/">Khu vực học tập</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage>Bài học đầu đời</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
          <div className={`chapter_video_frame flex ${isMobile ? 'w-full flex-col' : 'w-full gap-5'}`}>
            <ChapterBox chapters={MockChapterData} emptyState={'Chưa có bài học nào'}></ChapterBox>
            <div className="flex flex-col">
              <div className={`video w-full h-fit text-center m-3 rounded border-3`}>
                <Video video_url={currentLesson.video_url}></Video>
              </div>
              <div className="tab mt-5 ml-5">
                <Tabs defaultValue="account" className="w-full">
                  <TabsList>
                    <TabsTrigger value="account" className='pl-5'>Ghi chú</TabsTrigger>
                    <TabsTrigger value="password" className='pl-5'>Thêm ghi chú mới</TabsTrigger>
                  </TabsList>
                  <TabsContent value="account" className='pl-5 pt-3'>Bạn chưa có ghi chú nào ở bài học này</TabsContent>
                  <TabsContent value="password" className='pl-5'>
                    <form action="" className='flex gap-5 justify-baseline'>
                      <Textarea placeholder='Thêm ghi chú của bạn vào đây...'></Textarea>
                      <Button className='cursor-pointer inline-block align-bottom'>Ghi chú</Button>
                    </form>
                  </TabsContent>
                </Tabs>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /*     <div>
              <SpinnerLoading title='Đang tải trang web' rightContent='Bạn chờ tí nhé'/>
            </div> */
        <div className='w-full h-full flex items-center justify-center'>
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
        </div>
      )}
    </div>
  )
}

export default CourseDetailPage
