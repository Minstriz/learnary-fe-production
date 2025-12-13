"use client";

import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BookOpen, Clock, User, ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Course } from "@/type/course.type";

interface CourseEnrolledCardProps {
    course: Course;
    enrolledAt?: string;
    progress?: number;
    isLocked?: boolean;
}

export default function CourseEnrolledCard({
    course,
    enrolledAt,
    progress = 0,
    isLocked = false,
}: CourseEnrolledCardProps) {
    const router = useRouter();
    const handleContinueLearning = () => {
        if (isLocked) return; // Không cho click nếu bị khóa
        router.push(`/course-learn/${course.slug}`);
    };

    return (
        <Card className="hover:shadow-lg transition-all duration-300 overflow-hidden group cursor-pointer">
            <div className="relative h-48 w-full overflow-hidden bg-gray-200">
                {course.thumbnail ? (
                    <Image
                        src={course.thumbnail}
                        alt={course.title || "Course thumbnail"}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center bg-linear-to-br from-blue-400 to-purple-500">
                        <BookOpen className="h-16 w-16 text-white" />
                    </div>
                )}

                <div className="absolute bottom-0 left-0 right-0 h-2 bg-gray-300">
                    <div
                        className="h-full bg-green-500 transition-all duration-300"
                        style={{ width: `${progress}%` }}
                    />
                </div>
            </div>

            <CardHeader>
                <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                        <CardTitle className="text-lg line-clamp-2 group-hover:text-blue-600 transition-colors">
                            {course.title}
                        </CardTitle>
                        {course.category && (
                            <Badge variant="outline" className="mt-2">
                                {course.category.category_name}
                            </Badge>
                        )}
                    </div>
                    {course.level && (
                        <Badge variant="secondary" className="shrink-0">
                            {course.level.level_name}
                        </Badge>
                    )}
                </div>

                {course.description && (
                    <CardDescription className="line-clamp-2 mt-2">
                        {course.description}
                    </CardDescription>
                )}
            </CardHeader>

            <CardContent className="space-y-4">
                {course.instructor?.user && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                        {course.instructor.user.avatar ? (
                            <Image
                                src={course.instructor.user.avatar}
                                alt="Instructor"
                                width={24}
                                height={24}
                                className="rounded-full"
                            />
                        ) : (

                            <User className="h-5 w-5" />
                        )}
                        <span className="truncate"> {course.instructor.user.fullName}</span>
                    </div>
                )}

                {enrolledAt && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Clock className="h-4 w-4" />
                        <span>Ghi danh: {new Date(enrolledAt).toLocaleDateString("vi-VN")}</span>
                    </div>
                )}

                <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Tiến độ học tập</span>
                    <span className="font-semibold text-blue-600">{progress}%</span>
                </div>
                <Button
                    onClick={handleContinueLearning}
                    disabled={isLocked}
                    className={`w-full group/btn transition-colors ${
                        isLocked 
                            ? 'bg-gray-300 text-gray-500 cursor-not-allowed border-gray-300' 
                            : 'hover:bg-pink-600 hover:text-white cursor-pointer bg-white text-pink-600 border border-pink-600'
                    }`}>
                    {isLocked ? "Đã khóa" : (progress > 0 ? "Tiếp tục học" : "Bắt đầu học")}
                    {!isLocked && <ArrowRight className="ml-2 h-4 w-4 group-hover/btn:translate-x-1 transition-transform" />}
                </Button>
            </CardContent>
        </Card>
    );
}
