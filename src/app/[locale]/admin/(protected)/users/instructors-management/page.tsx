"use client";

import React, { useEffect, useState } from 'react';
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
  UserCheck, 
  UserX, 
  MoreHorizontal,
  Mail,
  Phone,
  Clock
} from "lucide-react";

// Enum trạng thái
enum VerifyStatus {
  Active = "Active",
  Inactive = "Inactive",
  Suspended = "Suspended",
  Pending = "Pending"
}

// Type chung cho bảng hiển thị
type CombinedInstructor = {
  id: string;           
  user_id: string;
  fullName: string;
  email: string;
  avatar: string | null;
  phone: string | null;
  bio: string | null;
  type: "INSTRUCTOR" | "APPLICANT"; // Phân loại
  status: VerifyStatus;
  isVerified: boolean;
  totalCourses?: number;
  totalStudents?: number;
  rating?: number;
};

// API response shapes
type InstructorApi = {
  instructor_id: string;
  user_id: string;
  user: {
    fullName: string;
    email: string;
    avatar?: string | null;
    phone?: string | null;
    bio?: string | null;
  };
  status?: string;
  isVerified?: boolean;
  totalCourses?: number;
  totalStudents?: number;
  rating?: number;
};

type QualificationRequestApi = {
  instructor_qualification_id?: string;
  user?: { user_id?: string; fullName?: string; email?: string; avatar?: string | null; phone?: string | null } | null;
  instructor?: { user?: { user_id?: string; fullName?: string; email?: string; avatar?: string | null; phone?: string | null }; user_id?: string } | null;
};

export default function InstructorManagement() {
  const [data, setData] = useState<CombinedInstructor[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterActive, setFilterActive] = useState<boolean | null>(null);
  const router = useRouter();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const [instructorsRes, requestsRes] = await Promise.all([
        api.get("/instructors"),
        api.get("/instructor-qualifications?status=Pending") // API lấy danh sách chờ duyệt
      ]);

      const instructorsRaw = instructorsRes.data.data || [];
      const requestsRaw = requestsRes.data.data || [];

      const instructors: CombinedInstructor[] = (instructorsRaw as InstructorApi[]).map((item) => ({
        id: item.instructor_id,
        user_id: item.user_id,
        fullName: item.user.fullName,
        email: item.user.email,
        avatar: item.user.avatar ?? null,
        phone: item.user.phone ?? null,
        bio: item.user.bio ?? null,
        type: "INSTRUCTOR",
        status: (item.status as VerifyStatus) || VerifyStatus.Pending,
        isVerified: !!item.isVerified,
        totalCourses: item.totalCourses,
        totalStudents: item.totalStudents,
        rating: item.rating
      }));
      const instructorUserIds = new Set(instructors.map(i => i.user_id));
      
      const applicants: CombinedInstructor[] = (requestsRaw as QualificationRequestApi[])
        .filter((req) => !instructorUserIds.has(req.instructor?.user_id || req.user?.user_id || ''))
        .map((req) => ({
          id: req.instructor_qualification_id || '',
          user_id: req.user?.user_id || req.instructor?.user?.user_id || '',
          fullName: req.user?.fullName || req.instructor?.user?.fullName || '',
          email: req.user?.email || req.instructor?.user?.email || '',
          avatar: req.user?.avatar || req.instructor?.user?.avatar || null,
          phone: req.user?.phone || req.instructor?.user?.phone || null,
          bio: "Đang chờ phê duyệt hồ sơ giảng viên",
          type: "APPLICANT",
          status: VerifyStatus.Pending,
          isVerified: false,
          totalCourses: 0,
          totalStudents: 0,
          rating: 0
        }));

      setData([...applicants, ...instructors]);

    } catch (error) {
      console.error("Lỗi khi tải dữ liệu:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleActive = async (userId: string, currentStatus: boolean) => {
    try {
      await api.patch(`/users/${userId}`, { isActive: !currentStatus });
      setData(prev =>
        prev.map(item =>
          item.user_id === userId ? { ...item, isActive: !currentStatus } : item
        )
      );
    } catch (error) {
      console.error("Lỗi khi cập nhật trạng thái:", error);
    }
  };

  const filteredData = data.filter((item) => {
    const fullName = (item.fullName || "").toLowerCase();
    const email = (item.email || "").toLowerCase();
    const search = searchTerm.toLowerCase();

    const matchSearch = 
      fullName.includes(search) || 
      email.includes(search);
    
    // Logic filter status giữ nguyên
    if (filterActive === null) return matchSearch; 
    if (filterActive === true) return matchSearch && item.status === VerifyStatus.Active;
    if (filterActive === false) return matchSearch && item.status !== VerifyStatus.Active;
    
    return matchSearch;
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
          <h1 className="text-3xl font-bold">Quản lý Giảng viên</h1>
          <p className="text-gray-500 mt-1">Tổng số: {data.length} (Bao gồm {data.filter(d => d.type === "APPLICANT").length} yêu cầu chờ duyệt)</p>
        </div>
      </div>

      <div className="flex gap-4 items-center">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Tìm kiếm theo tên hoặc email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex gap-2">
          <Button
            variant={filterActive === null ? "default" : "outline"}
            onClick={() => setFilterActive(null)}
            className='cursor-pointer hover:bg-gray-300'
          >
            Tất cả
          </Button>
          <Button
            variant={filterActive === true ? "default" : "outline"}
            onClick={() => setFilterActive(true)}
            className='cursor-pointer hover:bg-gray-300'
          >
            Đang hoạt động
          </Button>
          <Button
            variant={filterActive === false ? "default" : "outline"}
            onClick={() => setFilterActive(false)}
            className='cursor-pointer hover:bg-gray-300'
          >
            Khác / Chờ duyệt
          </Button>
          {/* <Button
            variant={"outline"}
            onClick={()=> fetchInstructors()}
            className='cursor-pointer hover:bg-gray-300'
          >
            <RefreshCcw></RefreshCcw> Reload
          </Button> */}
        </div>
      </div>

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Người dùng</TableHead>
              <TableHead>Liên hệ</TableHead>
              <TableHead>Thống kê</TableHead>
              <TableHead>Trạng thái</TableHead>
              <TableHead>Vai trò</TableHead>
              <TableHead className="text-right">Hành động</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredData.map((item) => (
              <TableRow key={item.id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarImage src={item.avatar || undefined} />
                      <AvatarFallback>
                        {item.fullName?.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{item.fullName}</p>
                      <p className="text-sm text-gray-500 truncate max-w-[200px]">{item.bio || "Chưa có mô tả"}</p>
                    </div>
                  </div>
                </TableCell>

                <TableCell>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-sm">
                      <Mail className="h-3 w-3 text-gray-400" />
                      {item.email}
                    </div>
                    {item.phone && (
                      <div className="flex items-center gap-2 text-sm">
                        <Phone className="h-3 w-3 text-gray-400" />
                        {item.phone}
                      </div>
                    )}
                  </div>
                </TableCell>

                <TableCell>
                  {item.type === "INSTRUCTOR" ? (
                    <div className="text-sm space-y-1">
                        <p>Khóa học: {item.totalCourses || 0}</p>
                        <p>Học viên: {item.totalStudents || 0}</p>
                        {item.rating && <p>⭐ {item.rating.toFixed(1)}</p>}
                    </div>
                  ) : (
                    <span className="text-sm text-gray-400 italic">Chưa có dữ liệu</span>
                  )}
                </TableCell>

                <TableCell>
                  <Badge 
                    className={
                        item.status === VerifyStatus.Active ? "bg-green-700" : 
                        item.status === VerifyStatus.Pending ? "bg-amber-500" : 
                        "bg-red-700"
                    }
                  >
                    {item.status === VerifyStatus.Active ? "Hoạt động" : 
                     item.status === VerifyStatus.Pending ? "Chờ duyệt" : 
                     item.status}
                  </Badge>
                </TableCell>

                <TableCell>
                    {item.type === "APPLICANT" ? (
                        <Badge variant="outline" className="border-amber-500 text-amber-600 flex w-fit items-center gap-1">
                            <Clock className="h-3 w-3" /> Ứng viên
                        </Badge>
                    ) : (
                        <Badge variant="outline" className="border-blue-500 text-blue-600">
                            Giảng viên
                        </Badge>
                    )}
                </TableCell>

                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    
                    <DropdownMenuContent align="end">
                      {/* LOGIC MENU CHÍNH Ở ĐÂY */}
                      {item.type === "APPLICANT" ? (
                        <DropdownMenuItem
                          onClick={() => router.push(`/admin/users/instructors-management/qualification/${item.id}`)} // item.id lúc này là Qualification ID
                          className="cursor-pointer font-medium text-amber-700"
                        >
                           Xem yêu cầu phê duyệt
                        </DropdownMenuItem>
                      ) : (
                        <>
                          <DropdownMenuItem 
                            onClick={() => router.push(`/admin/users/instructors-management/profile/${item.user_id}`)}
                            className="cursor-pointer"
                          >
                             Xem chi tiết
                          </DropdownMenuItem>
                          <DropdownMenuItem className="cursor-pointer">Xem khóa học</DropdownMenuItem>
                        </>
                      )}

                      {/* Chỉ cho phép Khóa/Mở khóa nếu đã là Giảng viên chính thức */}
                      {item.type === "INSTRUCTOR" && (
                          <DropdownMenuItem
                            onClick={() => handleToggleActive(item.user_id, item.status === VerifyStatus.Active)}
                          >
                            {item.status === VerifyStatus.Active ? (
                              <div className="flex items-center text-red-600">
                                <UserX className="mr-2 h-4 w-4" />
                                Khóa tài khoản
                              </div>
                            ) : (
                              <div className="flex items-center text-green-600">
                                <UserCheck className="mr-2 h-4 w-4" />
                                Mở khóa
                              </div>
                            )}
                          </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}