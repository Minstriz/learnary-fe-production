"use client";
import { useState, useEffect } from "react";
import Hero from "@/components/Hero";
import ListTopic from "@/components/ListTopic";
import ListCourseCard from "@/components/ListCourseCard";

export default function HomePage() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return ( 
    <div className="w-full h-screen overflow-y-auto snap-y snap-mandatory scroll-smooth scrollbar-hide">
      <section className="h-screen snap-start">
        <Hero />
      </section>
      <section className="min-h-screen snap-start shadow-2xl">
        <ListTopic />
        <ListCourseCard />
      </section>
    </div>
  );
}
