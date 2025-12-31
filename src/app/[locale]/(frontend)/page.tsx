"use client";
import { useState, useEffect } from "react";
import Hero from "@/components/Hero";
import ListTopic from "@/components/ListTopic";
import CourseListWithFilters from "@/components/CourseListWithFilters";
import { useIsMobile } from "@/hooks/useIsMobile";
/* import { useAuth } from "@/app/context/AuthContext"; */
export default function HomePage() {
  const [isLoading, setIsLoading] = useState(true);
  const isMobile = useIsMobile()
/*   const user = useAuth() */
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 500);
    
    return () => clearTimeout(timer);
  }, []);
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600"></div>
      </div>
    );
  }
  
  return (
    <div className="w-full min-h-screen">
      <section className={`${isMobile ? 'min-h-[200px]' : 'min-h-screen'}`}>
        <Hero />
      </section>
      <section className="min-h-screen shadow-2xl pb-20">
        <ListTopic />
        <div className="mt-8">
          <h2 className="text-3xl font-roboto-condensed-bold text-center ">
            Khám phá các khóa học hàng đầu
          </h2>
          <CourseListWithFilters />
        </div>
      </section>
    </div>
  );
}
