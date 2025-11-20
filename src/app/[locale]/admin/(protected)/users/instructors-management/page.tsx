"use client";

import React, { useEffect, useState } from 'react';
import { z } from "zod";
import api from "@/app/lib/axios";
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
import { Spinner } from "@/components/ui/spinner";
import { 
  Search, 
  UserCheck, 
  UserX, 
  MoreHorizontal,
  Mail,
  Phone,
  RefreshCcw 
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

 enum VerifyStatus  {
  Active = "Active",
  Inactive = "Inactive",
  Suspended = "Suspended"
} 
export const UserSchema = z.object({
  user_id: z.string(),
  email: z.string().email(),
  fullName: z.string(),
  gender: z.enum(["MALE", "FEMALE", "OTHER"]),
  role: z.enum(["ADMIN", "INSTRUCTOR", "LEARNER"]),
  phone: z.union([z.string(), z.number()]).nullable(),
  avatar: z.string().url().nullable(),
  dateOfBirth: z.string().nullable(),
  address: z.string().nullable(),
  city: z.string().nullable(),
  country: z.string().nullable(),
  nation: z.string().nullable(),
  bio: z.string().nullable(),
  last_login: z.string().nullable(),
  isActive: z.boolean(),
});

export type User = z.infer<typeof UserSchema>;

export type Instructor = User & {
  totalCourses?: number;
  totalStudents?: number;
  rating?: number;
  instructor_id?: string;
  isVerified?: boolean;
  status: VerifyStatus;
};

export default function InstructorManagement() {
  const [instructors, setInstructors] = useState<Instructor[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterActive, setFilterActive] = useState<boolean | null>(null);

  useEffect(() => {
    fetchInstructors();
  }, []);

  const fetchInstructors = async () => {
    try {
      setIsLoading(true);
      const response = await api.get("/instructors");
      const rawData = response.data.data || [];
      
      // Map data instructor
      const mappedData: Instructor[] = rawData.map((item: {
        instructor_id: string;
        user_id: string;
        isVerified: boolean;
        status: string;
        user: {
          email: string;
          fullName: string;
          avatar: string | null;
        };
      }) => ({
        user_id: item.user_id.trim(),
        instructor_id: item.instructor_id.trim(),
        email: item.user.email.trim(),
        fullName: item.user.fullName,
        avatar: item.user.avatar,
        role: "INSTRUCTOR" as const,
        isActive: item.status === "Active",
        isVerified: item.isVerified,
        status: item.status as VerifyStatus, // cast string sang enum
        gender: "OTHER" as const,
        phone: null,
        dateOfBirth: null,
        address: null,
        city: null,
        country: null,
        nation: null,
        bio: null,
        last_login: null,
      }));
      setInstructors(mappedData);
    } catch (error) {
      console.error("Lỗi khi tải danh sách instructors:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleActive = async (userId: string, currentStatus: boolean) => {
    try {
      await api.patch(`/users/${userId}`, { isActive: !currentStatus });
      setInstructors(prev =>
        prev.map(inst =>
          inst.user_id === userId ? { ...inst, isActive: !currentStatus } : inst
        )
      );
    } catch (error) {
      console.error("Lỗi khi cập nhật trạng thái:", error);
    }
  };

  const filteredInstructors = instructors.filter((instructor) => {
    const matchSearch =
      instructor.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      instructor.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchActive = filterActive === null || instructor.isActive === filterActive;
    return matchSearch && matchActive;
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
          <p className="text-gray-500 mt-1">Tổng số: {instructors.length} giảng viên</p>
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
            Đã khóa
          </Button>
          <Button
            variant={"outline"}
            onClick={()=> fetchInstructors()}
            className='cursor-pointer hover:bg-gray-300'
          >
            <RefreshCcw></RefreshCcw> Reload
          </Button>
        </div>
      </div>

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Giảng viên</TableHead>
              <TableHead>Liên hệ</TableHead>
              <TableHead>Thống kê</TableHead>
              <TableHead>Trạng thái</TableHead>
              <TableHead>Kiểm duyệt</TableHead>
              <TableHead className="text-right">Hành động</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredInstructors.map((instructor) => (
              <TableRow key={instructor.user_id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarImage src={instructor.avatar || undefined} />
                      <AvatarFallback>
                        {instructor.fullName.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{instructor.fullName}</p>
                      <p className="text-sm text-gray-500">{instructor.bio || "Chưa có mô tả"}</p>
                    </div>
                  </div>
                </TableCell>

                <TableCell>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-sm">
                      <Mail className="h-3 w-3 text-gray-400" />
                      {instructor.email}
                    </div>
                    {instructor.phone && (
                      <div className="flex items-center gap-2 text-sm">
                        <Phone className="h-3 w-3 text-gray-400" />
                        {instructor.phone}
                      </div>
                    )}
                  </div>
                </TableCell>

                <TableCell>
                  <div className="text-sm space-y-1">
                    <p>Khóa học: {instructor.totalCourses || 0}</p>
                    <p>Học viên: {instructor.totalStudents || 0}</p>
                    {instructor.rating && <p>⭐ {instructor.rating.toFixed(1)}</p>}
                  </div>
                </TableCell>

                <TableCell>
                  <Badge className={instructor.isVerified ? 'bg-green-700 text-white' : 'bg-red-500 text-white'}>
                    {instructor.isVerified ? "Đã phê duyệt" : "Chưa phê duyệt"}
                  </Badge>
                </TableCell>

                <TableCell>
                  <Badge className={instructor.status == "Active" ? "bg-green-700 text-white" : instructor.status == "Inactive" ? "bg-blue-700 text-white" : "bg-red-700 text-white"} variant={instructor.status ? "default" : "destructive"}>
                    {instructor.status == VerifyStatus.Active ? "Đang hoạt động" 
                    : instructor.status == VerifyStatus.Inactive ? "Đang không hoạt động" 
                    : instructor.status == VerifyStatus.Suspended ? "Đã bị khoá" : "Không truy xuất được thông tin"}
                  </Badge>
                </TableCell>

                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>Xem chi tiết</DropdownMenuItem>
                      <DropdownMenuItem>Xem khóa học</DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() =>
                          handleToggleActive(instructor.user_id, instructor.isActive)
                        }
                      >
                        {instructor.isActive ? (
                          <div>
                            <UserX className="mr-2 h-4 w-4" />
                            Khóa tài khoản
                          </div>
                        ) : (
                          <div>
                            <UserCheck className="mr-2 h-4 w-4" />
                            Mở khóa
                          </div>
                        )}
                      </DropdownMenuItem>
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