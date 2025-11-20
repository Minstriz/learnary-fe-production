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

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const _UserSchema = z.object({
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

type User = z.infer<typeof _UserSchema>;

type Learner = User & {
  totalCourses?: number;
  learner_id?: string;
  status: VerifyStatus;
};

export default function LearnerManagement() {
  const [learners, setLearners] = useState<Learner[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterActive, setFilterActive] = useState<boolean | null>(null);

  useEffect(() => {
    fetchLearners();
  }, []);

  const fetchLearners = async () => {
    try {
      setIsLoading(true);
      const response = await api.get("/learners");
      const rawData = response.data.data || [];
      
      // Map data learner
      const mappedData: Learner[] = rawData.map((item: {
        learner_id: string;
        user_id: string;
        status: string;
        user: {
          email: string;
          fullName: string;
          avatar: string | null;
        };
            }) => ({
        user_id: item.user_id.trim(),
        learner_id: item.learner_id.trim(),
        email: item.user.email.trim(),
        fullName: item.user.fullName,
        avatar: item.user.avatar,
        role: "LEARNER" as const,
        isActive: item.status === "Active",
        status: item.status as VerifyStatus,
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
      setLearners(mappedData);
    } catch (error) {
      console.error("Lỗi khi tải danh sách learners:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleActive = async (userId: string, currentStatus: boolean) => {
    try {
      await api.patch(`/users/${userId}`, { isActive: !currentStatus });
      setLearners(prev =>
        prev.map(learner =>
          learner.user_id === userId ? { ...learner, isActive: !currentStatus } : learner
        )
      );
    } catch (error) {
      console.error("Lỗi khi cập nhật trạng thái:", error);
    }
  };

  const filteredLearners = learners.filter((learner) => {
    const matchSearch =
      learner.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      learner.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchActive = filterActive === null || learner.isActive === filterActive;
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
          <h1 className="text-3xl font-bold">Quản lý Học viên</h1>
          <p className="text-gray-500 mt-1">Tổng số: {learners.length} học viên</p>
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
            onClick={()=> fetchLearners()}
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
              <TableHead>Học viên</TableHead>
              <TableHead>Liên hệ</TableHead>
              <TableHead>Thống kê</TableHead>
              <TableHead>Trạng thái</TableHead>
              <TableHead className="text-right">Hành động</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredLearners.map((learner) => (
              <TableRow key={learner.user_id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarImage src={learner.avatar || undefined} />
                      <AvatarFallback>
                        {learner.fullName.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{learner.fullName}</p>
                      <p className="text-sm text-gray-500">{learner.bio || "Chưa có mô tả"}</p>
                    </div>
                  </div>
                </TableCell>

                <TableCell>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-sm">
                      <Mail className="h-3 w-3 text-gray-400" />
                      {learner.email}
                    </div>
                    {learner.phone && (
                      <div className="flex items-center gap-2 text-sm">
                        <Phone className="h-3 w-3 text-gray-400" />
                        {learner.phone}
                      </div>
                    )}
                  </div>
                </TableCell>

                <TableCell>
                  <div className="text-sm space-y-1">
                    <p>Khóa học: {learner.totalCourses || 0}</p>
                  </div>
                </TableCell>

                <TableCell>
                  <Badge className={learner.status == "Active" ? "bg-green-700 text-white" : learner.status == "Inactive" ? "bg-blue-700 text-white" : "bg-red-700 text-white"} variant={learner.status ? "default" : "destructive"}>
                    {learner.status == VerifyStatus.Active ? "Đang hoạt động" 
                    : learner.status == VerifyStatus.Inactive ? "Đang không hoạt động" 
                    : learner.status == VerifyStatus.Suspended ? "Đã bị khoá" : "Không truy xuất được thông tin"}
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
                          handleToggleActive(learner.user_id, learner.isActive)
                        }
                      >
                        {learner.isActive ? (
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