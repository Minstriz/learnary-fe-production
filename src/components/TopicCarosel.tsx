"use client";

import React, { useState, useEffect } from "react";
import { Carousel, Card } from "@/components/ui/apple-cards-carousel";
import Image from "next/image";
import api from "@/app/lib/axios";
import { Category } from "@/type/course.type";

export default function TopicCarosel() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await api.get("/categories")
        const data = response.data.data;
        setCategories(data);
      } catch (error) {
        console.error("Error fetching categories:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchCategories();
  }, []);

  if (loading) {
    return (
      <div className="w-full h-full py-5 flex items-center justify-center">
        <p>Đang tải...</p>
      </div>
    );
  }

  const data = categories.map((category) => ({
    category: category.category_name || "Không có tên",
    title: category.category_name || "Không có tên",
    src: `/images/background/partern_background.jpg`,
    content: <DummyContent />,
  }));

  const cards = data.map((card, index) => (
    <Card key={card.category + index} card={card} index={index} />
  ));

  return (
    <div className="w-full h-full py-5 ">
      <Carousel items={cards}/>
    </div>
  );
}

const DummyContent = () => {
  return (
    <>
      {[...new Array(3).fill(1)].map((_, index) => {
        return (
          <div
            key={"dummy-content" + index}
            className="bg-[#F5F5F7] dark:bg-neutral-800 p-8 md:p-14 rounded-3xl mb-4 "
          >
            <p className="text-neutral-600 dark:text-neutral-400 text-base md:text-2xl font-sans max-w-3xl mx-auto">
              <span className="font-bold text-neutral-700 dark:text-neutral-200">
                The first rule of Apple club is that you boast about Apple club.
              </span>{" "}
              Keep a journal, quickly jot down a grocery list, and take amazing
              class notes. Want to convert those notes to text? No problem.
              Langotiya jeetu ka mara hua yaar is ready to capture every
              thought.
            </p>
            <Image
              src="https://assets.aceternity.com/macbook.png"
              alt="Macbook mockup from Aceternity UI"
              height={400}
              width={500}
              className="md:w-1/2 md:h-1/2 h-full w-full mx-auto object-contain"
            />
          </div>
        );
      })}
    </>
  );
};
