"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import api from "@/app/lib/axios";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "sonner";

// UI Components
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// Icons
import {
  Search,
  MoreHorizontal,
  BookOpen,
  Calendar,
  Plus,
  RefreshCw,
  Eye,
  Trash2,
  Tag
} from "lucide-react";

// --- Types ---
type CourseStatus = "Draft" | "Published" | "Pending" | "Archived";

interface Course {
  course_id: string;
  title: string;
  slug: string;
  thumbnail: string;
  price: number;
  sale_off: boolean;
  status: CourseStatus;
  createdAt: string;
  updatedAt: string;
  
  // Relations (Dữ liệu này cần backend include)
  instructor?: {
    user: {
      fullName: string;
      avatar: string | null;
    }
  };
  category?: {
    category_name: string;
  };
  _count?: {
    learnerCourses: number; // Số học viên
  }
}

export default function CoursePage() {
  const router = useRouter();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<CourseStatus | "ALL">("ALL");

  // --- Fetch Data ---
  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      // Đảm bảo API backend trả về đủ thông tin instructor và category
      const response = await api.get("/courses"); 
      const apiData = response.data;

      if (apiData.success && Array.isArray(apiData.data)) {
        setCourses(apiData.data);
        toast.success(`Đã tải ${apiData.data.length} khóa học`);
      } else if (Array.isArray(apiData)) {
        // Fallback nếu API trả về mảng trực tiếp
        setCourses(apiData);
      }
    } catch (error) {
      console.error("Lỗi tải khóa học:", error);
      toast.error("Không thể tải danh sách khóa học");
    } finally {
      setLoading(false);
    }
  };

  const reload = async (): Promise<void> => {
      fetchCourses();
   }
  // --- Helpers ---
  const formatCurrency = (price: number) => {
    return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(price);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("vi-VN", {
      day: "2-digit", month: "2-digit", year: "numeric"
    });
  };

  const getStatusBadge = (status: CourseStatus) => {
    switch (status) {
      case "Published":
        return <Badge className="bg-green-600 hover:bg-green-700">Published</Badge>;
      case "Pending":
        return <Badge className="bg-amber-500 hover:bg-amber-600">Pending</Badge>;
      case "Draft":
        return <Badge variant="secondary">Draft</Badge>;
      case "Archived":
        return <Badge variant="destructive">Archived</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  // --- Filter Logic ---
  const filteredCourses = courses.filter((course) => {
    const search = searchTerm.toLowerCase();
    const matchesSearch = 
      course.title.toLowerCase().includes(search) || 
      (course.instructor?.user.fullName || "").toLowerCase().includes(search);

    const matchesStatus = filterStatus === "ALL" || course.status === filterStatus;

    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Quản lý Khóa học</h1>
          <p className="text-gray-500 mt-1">Tổng số: {courses.length} khóa học trong hệ thống</p>
        </div>
        
        {/* Nút thêm khóa học */}
        <Button onClick={() => router.push("/admin/courses/create")} className="bg-blue-600 hover:bg-blue-700">
          <Plus className="mr-2 h-4 w-4" /> Thêm khóa học
        </Button>
      </div>

      {/* Toolbar: Search & Filters */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center ">
         <div className="relative flex-1 max-w-md">
               <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
               <Input
               placeholder="Tìm kiếm theo tên, email, số điện thoại..."
               value={searchTerm}
               onChange={(e) => setSearchTerm(e.target.value)}
               className="pl-10"
            />
         </div>

        {/* Filter Buttons */}
         <div className="flex gap-2 flex-wrap">
            <Button 
                variant={filterStatus === "ALL" ? "default" : "outline"} 
                onClick={() => setFilterStatus("ALL")}
                className="h-8"
            >
                Tất cả
            </Button>
            <Button 
                variant={filterStatus === "Published" ? "default" : "outline"} 
                onClick={() => setFilterStatus("Published")}
                className="h-8"
            >
                Đã duyệt
            </Button>
            <Button 
                variant={filterStatus === "Pending" ? "default" : "outline"} 
                onClick={() => setFilterStatus("Pending")}
                className="h-8"
            >
                Chờ duyệt
            </Button>
            <Button 
                variant={filterStatus === "Draft" ? "default" : "outline"} 
                onClick={() => setFilterStatus("Draft")}
                className="h-8"
            >
                Nháp
            </Button>
            <Button  
               variant={"outline"}
               onClick={reload} 
               className="cursor-pointer hover:bg-gray-300"
            >
               <RefreshCw/>Reload
            </Button>
         </div>
      </div>

      {/* Table */}
      <div className="border rounded-lg bg-white shadow-sm">
         <Table>
            <TableHeader>
               <TableRow>
               <TableHead>Thông tin khóa học</TableHead>
               <TableHead>Giảng viên</TableHead>
               <TableHead>Học phí</TableHead>
               <TableHead>Trạng thái</TableHead>
               <TableHead>Ngày tạo</TableHead>
               <TableHead className="text-right pr-4">Hành động</TableHead>
               </TableRow>
            </TableHeader>
            <TableBody>
               {filteredCourses.length > 0 ? (
               filteredCourses.map((course) => (
               <TableRow key={course.course_id}>
               <TableCell className="pl-4 py-3">
                           <div className="flex items-center gap-3">
                              <div className="h-14 w-24 bg-gray-100 rounded-md overflow-hidden relative border shrink-0">
                                 {course.thumbnail ? (
                                       <Image src={course.thumbnail} alt={course.title} fill className="object-cover" />
                                 ) : (
                                       <div className="w-full h-full flex items-center justify-center text-gray-400"><BookOpen className="h-6 w-6"/></div>
                                 )}
                              </div>
                              <div className="space-y-1 max-w-[250px]">
                                 <p className="font-semibold text-gray-900 line-clamp-1" title={course.title}>{course.title}</p>
                                 <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                       <span className="flex items-center gap-1 bg-slate-100 px-1.5 py-0.5 rounded">
                                          <Tag className="h-3 w-3" /> {course.category?.category_name || "Chưa phân loại"}
                                       </span>
                                       <span>{course._count?.learnerCourses || 0} học viên</span>
                                 </div>
                              </div>
                           </div>
               </TableCell>
               <TableCell>
                           {course.instructor ? (
                              <div className="flex items-center gap-2">
                                 <Avatar className="h-8 w-8">
                                       <AvatarImage src={course.instructor.user.avatar || undefined} />
                                       <AvatarFallback>{course.instructor.user.fullName.charAt(0)}</AvatarFallback>
                                 </Avatar>
                                 <span className="text-sm font-medium text-gray-700">{course.instructor.user.fullName}</span>
                              </div>
                           ) : (
                              <span className="text-sm text-gray-400 italic">Không xác định</span>
                           )}
               </TableCell>
               <TableCell>
                           <div className="flex flex-col">
                              <span className="font-medium text-green-600">{formatCurrency(course.price)}</span>
                              {course.sale_off && <span className="text-[10px] text-red-500 font-bold">GIẢM GIÁ</span>}
                           </div>
               </TableCell>
               <TableCell>
                           {getStatusBadge(course.status)}
               </TableCell>
               <TableCell>
                           <div className="flex items-center gap-2 text-sm text-gray-500">
                              <Calendar className="h-3 w-3" />
                              {formatDate(course.createdAt)}
                           </div>
               </TableCell>

               {/* Cột 6: Hành động */}
               <TableCell className="text-right pr-4">
                        <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <span className="sr-only">Open menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            {/* Xem chi tiết - Luôn hiện */}
                            <DropdownMenuItem 
                                onClick={() => router.push(`/admin/courses/${course.course_id}`)}
                                className="cursor-pointer"
                            >
                                <Eye className="mr-2 h-4 w-4" /> Xem chi tiết
                            </DropdownMenuItem>                           
                            <DropdownMenuItem className="text-red-600 cursor-pointer">
                                <Trash2 className="mr-2 h-4 w-4" /> Xóa khóa học
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                        </DropdownMenu>
               </TableCell>
            </TableRow>
            ))
            ) : (
            <TableRow>
                    <TableCell colSpan={6} className="h-32 text-center text-gray-500">
                    Không tìm thấy khóa học nào phù hợp.
                    </TableCell>
            </TableRow>
                  )}
            </TableBody>
         </Table>
      </div>   
    </div>
  );
}