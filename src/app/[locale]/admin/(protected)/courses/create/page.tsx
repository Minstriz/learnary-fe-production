"use client";
import React from "react";
import { CreateCourseForm } from "@/components/CreateCoursesForm";
function CreateCoursePage() {
  return <div>
    <div className="container w-full p-2 rounded-sm h-auto">
      <CreateCourseForm></CreateCourseForm>
    </div>
  </div>;
}

export default CreateCoursePage;
