'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import api from '@/app/lib/axios';
import { isAxiosError } from 'axios'; // [SỬA] Dùng isAxiosError
import { useAuth } from '@/app/context/AuthContext';
import { toast } from 'sonner';
import { Loader2, Plus, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
type Course = {
  course_id: string;
  title: string;
  thumbnail: string;
  status: 'Draft' | 'Pending' | 'Published' | 'Archived';
  _count: { chapter: number };
  updatedAt: string;
};

type FilterStatus = 'all' | 'Draft' | 'Pending' | 'Published'|'Archived';

export default function MyCoursesPage() {
  const [allCourses, setAllCourses] = useState<Course[]>([]);
  const [filter, setFilter] = useState<FilterStatus>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { user, isLoggedIn, isLoading: isAuthLoading } = useAuth();

  useEffect(() => {
    if (isAuthLoading) return;

    if (!isLoggedIn || user?.role !== "INSTRUCTOR" && user?.role !== "ADMIN") {
      toast.info('Bạn không có quyền truy cập trang này.');
      router.push(`/`); 
      return;
    }
    const fetchMyCourses = async () => {
      try {
        setIsLoading(true);

        const res = await api.get('/courses/instructor/my-courses');
        setAllCourses(res.data);
      } catch (err) {
        if (isAxiosError(err)) {
          setError(err.response?.data?.message || 'Không thể tải khóa học.');
        } else {
          setError('Lỗi không xác định. Vui lòng thử lại.');
        }
      } finally {
        setIsLoading(false);
      }
    };
    fetchMyCourses();
  }, [isAuthLoading, isLoggedIn, user, router]);

  const filteredCourses = useMemo(() => {
    if (filter === 'all') return allCourses;
    return allCourses.filter((course) => course.status === filter);
  }, [allCourses, filter]);

  const handleViewCourse = (courseId: string) => {
    router.push(`/instructor/course-detail/${courseId}`);
  };

  const handleEditCourse = (courseId: string) => {
    router.push(`/instructor/edit-course/${courseId}`);
  };

  const renderSkeletons = () =>
    Array.from({ length: 3 }).map((_, i) => (
      <Card key={i}>
        <CardHeader>
          <Skeleton className="h-40 w-full" />
        </CardHeader>
        <CardContent className="space-y-2">
          <Skeleton className="h-5 w-3/4" />
          <Skeleton className="h-4 w-1/4" />
          <Skeleton className="h-6 w-20" />
        </CardContent>
        <CardFooter className="gap-2">
          <Skeleton className="h-10 w-20" />
          <Skeleton className="h-10 w-20" />
        </CardFooter>
      </Card>
    ));
  if (isAuthLoading) {
    return (
        <div className="flex h-screen items-center justify-center">
            <Loader2 className="animate-spin text-primary" size={40} />
        </div>
    );
  }
  return (
    <div className="container mx-auto p-6 space-y-6">
      <Link href="/instructor">
        <Button variant="ghost" className="mb-4 cursor-pointer">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Quay lại khu vực giảng viên
        </Button>
      </Link>
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Khóa học của tôi</h1>
        <Link href="/instructor/create-course">
          <Button className="shadow-lg hover:shadow-xl transition-all cursor-pointer">
            <Plus className="mr-2 h-4 w-4" /> Tạo khóa học mới
          </Button>
        </Link>
      </div>

      <Tabs
        value={filter}
        onValueChange={(value) => setFilter(value as FilterStatus)}
      >
        <TabsList>
          <TabsTrigger value="all">Tất cả</TabsTrigger>
          <TabsTrigger value="Draft">Bản nháp</TabsTrigger>
          <TabsTrigger value="Pending">Chờ duyệt</TabsTrigger>
          <TabsTrigger value="Archived">Bị từ chối</TabsTrigger>
          <TabsTrigger value="Published">Đã xuất bản</TabsTrigger>
        </TabsList>
      </Tabs>

      {error && <p className="text-red-500">Lỗi: {error}</p>}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading
          ? renderSkeletons()
          : filteredCourses.length > 0
          ? filteredCourses.map((course) => (
              <CourseCard
                key={course.course_id}
                course={course}
                onView={handleViewCourse}
                onEdit={handleEditCourse}
              />
            ))
          : <p>Không tìm thấy khóa học nào.</p>}
      </div>
    </div>
  );
}

function CourseCard({
  course,
  onView,
  onEdit,
}: {
  course: Course;
  onView: (id: string) => void;
  onEdit: (id: string) => void;
}) {
  // Cho phép sửa khi là Draft hoặc Published
  let canEdit = course.status === 'Draft' || course.status === 'Published';

  // Nếu bị từ chối (Archived), chỉ cho phép sửa trong 3 ngày sau updatedAt
  if (course.status === 'Archived' && course.updatedAt) {
    const updatedAt = new Date(course.updatedAt);
    const now = new Date();
    const diffMs = now.getTime() - updatedAt.getTime();
    const diffDays = diffMs / (1000 * 60 * 60 * 24);
    if (diffDays > 3) {
      canEdit = false;
    } else {
      canEdit = true;
    }
  }
  
  const getStatusBadge = () => {
    switch (course.status) {
      case 'Published':
        return <Badge className="bg-green-500 hover:bg-green-600 text-white">Đã xuất bản</Badge>;
      case 'Pending':
        return <Badge className="bg-yellow-500 hover:bg-yellow-600 text-white">Chờ duyệt</Badge>;
      case 'Archived':
        return <Badge className="bg-red-500 hover:bg-red-600 text-white">Bị từ chối</Badge>;
      case 'Draft':
        return <Badge className="bg-gray-500 hover:bg-gray-600 text-white">Bản nháp</Badge>;
      default:
        return <Badge variant="secondary">{course.status}</Badge>;
    }
  };
  

  return (
    <Card>
      <CardHeader className="p-0">
        <div className="relative h-40 w-full">
          {course.thumbnail && (
            <Image 
              src={course.thumbnail} 
              alt="thumbnail" 
              fill 
              className="object-cover opacity-30"
            />
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-2 pt-4">
        <CardTitle className="text-lg truncate" title={course.title}>
          {course.title}
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Số chương: {course._count.chapter}
        </p>
        {getStatusBadge()}
      </CardContent>
      <CardFooter className="gap-2">
        <Button variant="outline" className="cursor-pointer" onClick={() => onView(course.course_id)}>
          Xem
        </Button>
        <Button
          className="cursor-pointer"
          onClick={() => onEdit(course.course_id)}
          disabled={!canEdit}
          title={
            canEdit
              ? 'Chỉnh sửa khóa học'
              : course.status === 'Archived'
                ? 'Chỉ có thể chỉnh sửa khóa học bị từ chối trong 3 ngày sau khi bị từ chối'
                : 'Chỉ có thể chỉnh sửa khóa học ở trạng thái bản nháp hoặc đã xuất bản'
          }
        >
          Sửa
        </Button>
      </CardFooter>
    </Card>
  );
}