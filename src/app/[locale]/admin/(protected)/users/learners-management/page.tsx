"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/app/lib/axios";
import { Spinner } from "@/components/ui/spinner";
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
import {
  Search,
  MoreHorizontal,
  Mail,
  Phone,
  BookOpen,
  Calendar,
  UserCheck,
  UserX
} from "lucide-react";
import { toast } from "sonner";

interface LearnerResponse {
  learner_id: string;
  enrolledAt: string;
  user: {
    user_id: string;
    fullName: string;
    email: string;
    phone: string | null;
    avatar: string | null;
    isActive: boolean;
    last_login: string | null;
  };
  _count: {
    learner_courses: number;
  };
}

interface LearnerDisplay {
  user_id: string;
  learner_id: string;
  fullName: string;
  email: string;
  phone: string | null;
  avatar: string | null;
  isActive: boolean;
  courseCount: number;
  joinedDate: string;
}

export default function LearnerManagement() {
  const [learners, setLearners] = useState<LearnerDisplay[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterActive, setFilterActive] = useState<boolean | null>(null);
  const router = useRouter();

  useEffect(() => {
    fetchLearners();
  }, []);

  const fetchLearners = async () => {
    try {
      setIsLoading(true);
      const res = await api.get("/learners/with-user"); 
      
      if (res.data.success) {
        const rawData: LearnerResponse[] = res.data.data;
        const mappedData: LearnerDisplay[] = rawData.map((item) => ({
          user_id: item.user.user_id,
          learner_id: item.learner_id,
          fullName: item.user.fullName,
          email: item.user.email,
          phone: item.user.phone,
          avatar: item.user.avatar,
          isActive: item.user.isActive,
          courseCount: item._count.learner_courses,
          joinedDate: item.enrolledAt
        }));
        setLearners(mappedData);
      }
    } catch (error) {
      console.error("Lỗi tải danh sách học viên:", error);
      toast.error("Không thể tải danh sách học viên");
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleActive = async (userId: string, currentStatus: boolean) => {
    try {
      await api.patch(`/users/${userId}`, { isActive: !currentStatus });
      setLearners((prev) =>
        prev.map((l) =>
          l.user_id === userId ? { ...l, isActive: !currentStatus } : l
        )
      );
      toast.success(`Đã ${!currentStatus ? "mở khóa" : "khóa"} tài khoản thành công`);
    } catch (error) {
      console.error("Lỗi cập nhật trạng thái:", error);
      toast.error("Cập nhật trạng thái thất bại");
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric"
    });
  };

  const filteredLearners = learners.filter((learner) => {
    const search = searchTerm.toLowerCase();
    const name = (learner.fullName || "").toLowerCase();
    const email = (learner.email || "").toLowerCase();
    const phone = (learner.phone || "");
    const matchesSearch = name.includes(search) || email.includes(search) || phone.includes(search);
    if (filterActive === null) return matchesSearch;
    return matchesSearch && learner.isActive === filterActive;
  });

  if (isLoading) {
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
          <h1 className="text-3xl font-bold">Quản lý Học viên</h1>
          <p className="text-gray-500 mt-1">
            Tổng số: {learners.length} học viên
          </p>
        </div>
      </div>

      {/* Toolbar: Tìm kiếm & Lọc */}
      <div className="flex gap-4 items-center">
        <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
                placeholder="Tìm kiếm theo tên, email, số điện thoại..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
            />
        </div>
        <div className="flex gap-2">
            <Button
                variant={filterActive === null ? "default" : "outline"}
                onClick={() => setFilterActive(null)}
            >
                Tất cả
            </Button>
            <Button
                variant={filterActive === true ? "default" : "outline"}
                onClick={() => setFilterActive(true)}
            >
                Đang hoạt động
            </Button>
            <Button
                variant={filterActive === false ? "default" : "outline"}
                onClick={() => setFilterActive(false)}
            >
                Đã khóa
            </Button>
        </div>
      </div>

      {/* Table hiển thị dữ liệu */}
      <div className="border rounded-lg bg-white shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Học viên</TableHead>
              <TableHead>Liên hệ</TableHead>
              <TableHead>Học tập</TableHead>
              <TableHead>Ngày tham gia</TableHead>
              <TableHead>Trạng thái</TableHead>
              <TableHead className="text-right">Hành động</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredLearners.length > 0 ? (
              filteredLearners.map((learner) => (
                <TableRow key={learner.learner_id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarImage src={learner.avatar || undefined} />
                        <AvatarFallback className="bg-blue-100 text-blue-700 font-bold">
                          {learner.fullName?.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium text-gray-900">{learner.fullName}</p>
                        <p className="text-xs text-gray-500">User ID: {learner.user_id.slice(0, 8)}...</p>
                      </div>
                    </div>
                  </TableCell>

                  <TableCell>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Mail className="h-3 w-3" />
                        {learner.email}
                      </div>
                      {learner.phone && (
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Phone className="h-3 w-3" />
                          {learner.phone}
                        </div>
                      )}
                    </div>
                  </TableCell>

                  <TableCell>
                    <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="flex gap-1 items-center hover:bg-gray-200">
                            <BookOpen className="h-3 w-3" />
                            {learner.courseCount} khóa học
                        </Badge>
                    </div>
                  </TableCell>

                  <TableCell>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Calendar className="h-3 w-3" />
                        {formatDate(learner.joinedDate)}
                    </div>
                  </TableCell>

                  <TableCell>
                    <Badge
                      className={
                        learner.isActive
                          ? "bg-green-700 hover:bg-green-500"
                          : "bg-red-500 hover:bg-red-500"
                      }
                    >
                      {learner.isActive ? "Đang hoạt động" : "Đã khóa"}
                    </Badge>
                  </TableCell>

                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <span className="sr-only">Open menu</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() => router.push(`/admin/users/learners-management/profile/${learner.user_id}`)}
                          className="cursor-pointer"
                        >
                          Xem hồ sơ chi tiết
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => router.push(`/admin/users/learners-management/course/${learner.user_id}`)}
                          className="cursor-pointer"
                        >
                          Xem khóa học đã mua
                        </DropdownMenuItem>
                        
                        <DropdownMenuItem
                          onClick={() => handleToggleActive(learner.user_id, learner.isActive)}
                          className={learner.isActive ? "text-red-600 focus:text-red-600 cursor-pointer" : "text-green-600 focus:text-green-600 cursor-pointer"}
                        >
                           {learner.isActive ? (
                               <div className="flex items-center">
                                <UserX className="mr-2 h-4 w-4" /> Khóa tài khoản
                               </div>
                           ) : (
                               <div className="flex items-center">
                                <UserCheck className="mr-2 h-4 w-4" /> Mở khóa
                               </div>
                           )}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center text-gray-500">
                  Không tìm thấy học viên nào phù hợp.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}