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
import { Loader2 } from 'lucide-react';
type Course = {
  course_id: string;
  title: string;
  thumbnail: string;
  status: 'Draft' | 'Pending' | 'Published' | 'Archived';
  _count: { chapter: number };
  updatedAt: string;
};

type FilterStatus = 'all' | 'Draft' | 'Pending' | 'Published';

export default function MyCoursesPage() {
  const [allCourses, setAllCourses] = useState<Course[]>([]);
  const [filter, setFilter] = useState<FilterStatus>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { user, isLoggedIn, isLoading: isAuthLoading } = useAuth();

  useEffect(() => {
    if (isAuthLoading) return;

    if (!isLoggedIn || user?.role !== "INSTRUCTOR") {
      alert('Bạn không có quyền truy cập trang này.');
      router.push(`/`); 
      return;
    }
    const fetchMyCourses = async () => {
      try {
        setIsLoading(true);

        const res = await api.get('/courses/instructor/my-courses');
        setAllCourses(res.data);
      } catch (err) {
        // [SỬA] Áp dụng pattern lỗi
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

  // [SỬA] Đưa code Skeleton trở lại
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
      <h1 className="text-2xl font-bold">Khóa học của tôi</h1>

      <Tabs
        value={filter}
        onValueChange={(value) => setFilter(value as FilterStatus)}
      >
        <TabsList>
          <TabsTrigger value="all">Tất cả</TabsTrigger>
          <TabsTrigger value="Draft">Bản nháp</TabsTrigger>
          <TabsTrigger value="Pending">Chờ duyệt</TabsTrigger>
          {/* [SỬA] Lỗi chính tả Pubished -> Published */}
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
  const isDraft = course.status === 'Draft';

  // [SỬA] Lỗi logic: Dùng 'course.status' thay vì 'status'
  let badgeVariant: 'default' | 'secondary' | 'destructive' | 'outline' =
    'secondary';
  if (course.status === 'Published') badgeVariant = 'default';
  if (course.status === 'Pending') badgeVariant = 'outline';
  if (course.status === 'Archived') badgeVariant = 'destructive';

  return (
    <Card>
      <CardHeader className="p-0">
        <div className="relative h-40 w-full">
          <Image
            src={course.thumbnail}
            alt={course.title}
            fill
            className="object-cover rounded-t-lg "
          />
        </div>
      </CardHeader>
      <CardContent className="space-y-2 pt-4">
        <CardTitle className="text-lg truncate" title={course.title}>
          {course.title}
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Số chương: {course._count.chapter}
        </p>
        <Badge variant={badgeVariant}>{course.status}</Badge>
      </CardContent>
      <CardFooter className="gap-2">
        <Button variant="outline" onClick={() => onView(course.course_id)}>
          Xem
        </Button>
        <Button
          onClick={() => onEdit(course.course_id)}
          disabled={!isDraft}
          title={
            isDraft
              ? 'Chỉnh sửa khóa học'
              : 'Chỉ có thể chỉnh sửa khóa học ở trạng thái bản nháp'
          }
        >
          Sửa
        </Button>
      </CardFooter>
    </Card>
  );
}