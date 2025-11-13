"use client";
import React from 'react';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useTranslations } from 'next-intl';    
interface CourseTabsProps {
  children: React.ReactNode;
}
const TabLinks = () => {
    const t = useTranslations("Course-Detail-Tab");
    return [
        {
            name: t("overview")
        },
        {
            name: t("curriculum")
        },
        {
            name: t("instructor")
        },
        {
            name: t("reviews")
        },
    ]
}
export default function CourseTabs({ children }: CourseTabsProps) {
    const links = TabLinks();

  return (
    <Tabs defaultValue="overview" className="w-full">
      <TabsList className="w-full justify-start border-b rounded bg-transparent p-0 h-auto">
        <TabsTrigger
          value="overview"
          className="font-roboto-condensed text-md cursor-pointer data-[state=active]:font-bold data-[state=active]:border-b-2 data-[state=active]:border-gray-500 rounded px-6 py-3"
        >
          {links[0].name}
        </TabsTrigger>
        <TabsTrigger
          value="curriculum"
          className="font-roboto-condensed text-md cursor-pointer data-[state=active]:font-bold data-[state=active]:border-b-2 data-[state=active]:border-gray-500 rounded px-6 py-3"
        >
          {links[1].name}
        </TabsTrigger>
        <TabsTrigger
          value="instructor"
          className="font-roboto-condensed text-md cursor-pointer data-[state=active]:font-bold data-[state=active]:border-b-2 data-[state=active]:border-gray-500 rounded px-6 py-3"
        >
          {links[2].name}
        </TabsTrigger>
        <TabsTrigger
          value="reviews"
          className="font-roboto-condensed text-md cursor-pointer data-[state=active]:font-bold data-[state=active]:border-b-2 data-[state=active]:border-gray-500 rounded px-6 py-3"
        >
          {links[3].name}
        </TabsTrigger>
      </TabsList>
      {children}
    </Tabs>
  );
}
