"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import api from "@/app/lib/axios";
import type { AxiosError } from 'axios';
import { toast } from "sonner";

// Icons
import { 
  ArrowLeft, Mail, Phone, MapPin, Calendar, 
  UserCheck, UserX, Wallet, BookOpen, Award, GraduationCap, History, Users 
} from "lucide-react";

// UI Components
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
// import { Progress } from "@/components/ui/progress";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from "@/components/ui/table";

// --- 1. Interface khớp với Backend ---
interface InstructorDetail {
  user_id: string;
  fullName: string;
  email: string;
  phone: string | null;
  avatar: string | null;
  address: string | null;
  bio: string | null;
  isActive: boolean;
  createdAt: string;
  wallet?: { balance: string };
  
  // Instructor có thể null nếu user chưa được duyệt
  instructor: {
    instructor_id: string;
    isVerified: boolean;
    instructorSpecialization?: {
      specialization: { specialization_name: string };
    };
    instructor_qualifications: Array<{
      title: string;
      type: string;
      issue_place: string;
      issue_date: string;
    }>;
    courses: Array<{
      course_id: string;
      title: string;
      thumbnail: string;
      price: string;
      status: "Draft" | "Published" | "Pending";
      createdAt: string;
      _count: { learnerCourses: number };
    }>;
  } | null; 

  transactions: Array<{
    transaction_id: string;
    amount: string;
    transaction_type: string;
    status: string;
    createdAt: string;
  }>;
}

export default function InstructorDetailPage() {
  const params = useParams();
  const router = useRouter();
  
  // ✅ QUAN TRỌNG: Lấy ID từ URL (id của giảng viên cần xem)
  const id = params?.id as string; 

  const [data, setData] = useState<InstructorDetail | null>(null);
  const [loading, setLoading] = useState(true);

  // --- 2. Fetch Data ---
  useEffect(() => {
    const fetchDetail = async () => {
      try {
        setLoading(true);
        // Gọi API Backend: nhớ không có chữ /admin ở đầu
        const res = await api.get(`/users/${id}/instructor-detail`);
        
        if (res.data.success) {
          setData(res.data.data);
        }
      } catch (error) {
        console.error("Lỗi tải chi tiết:", error);
        const axiosErr = error as AxiosError<{ error?: string }>;
        const msg = axiosErr?.response?.data?.error || "Không thể tải dữ liệu";
        toast.error(msg);
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchDetail();
  }, [id]);

  // --- 3. Actions ---
  const handleToggleActive = async () => {
    if (!data) return;
    try {
      const newStatus = !data.isActive;
      await api.patch(`/users/${data.user_id}`, { isActive: newStatus });
      setData({ ...data, isActive: newStatus });
      toast.success(`Đã ${newStatus ? "mở khóa" : "khóa"} tài khoản`);
    } catch (error) {
      console.error("Lỗi cập nhật trạng thái:", error);
      toast.error("Cập nhật thất bại");
    }
  };

  // --- 4. Helpers ---
  const formatCurrency = (amount: string | number | undefined) => 
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(Number(amount || 0));
  
  const formatDate = (d: string) => {
    if (!d) return "N/A";
    return new Date(d).toLocaleDateString("vi-VN", {
      day: '2-digit', month: '2-digit', year: 'numeric'
    });
  };

  // --- 5. Render Logic ---
  if (loading) return (
    <div className="p-8 space-y-4 container mx-auto max-w-7xl">
        <div className="flex justify-between">
            <Skeleton className="h-10 w-32" />
            <Skeleton className="h-10 w-32" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Skeleton className="h-[400px] lg:col-span-1" />
            <Skeleton className="h-[400px] lg:col-span-2" />
        </div>
    </div>
  );

  if (!data) return <div className="p-12 text-center text-gray-500">Không tìm thấy dữ liệu người dùng</div>;

  // Nếu User tồn tại nhưng chưa phải là Giảng viên
  if (!data.instructor) return (
    <div className="p-12 text-center flex flex-col items-center gap-4">
        <UserX className="h-12 w-12 text-red-400" />
        <h2 className="text-xl font-bold text-gray-900">Dữ liệu không hợp lệ</h2>
        <p className="text-gray-500">Người dùng này chưa được cấp quyền Giảng viên.</p>
        <Button variant="outline" onClick={() => router.back()}>Quay lại</Button>
    </div>
  );

  return (
    <div className="container mx-auto p-6 max-w-7xl space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              {data.fullName}
              {data.instructor.isVerified && <CheckCircleIcon />}
            </h1>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Badge variant="outline" className="text-blue-600 border-blue-200">Giảng viên</Badge>
              <span>•</span>
              <span className="font-mono text-xs">ID: {data.user_id.slice(0,8)}...</span>
            </div>
          </div>
        </div>
        <Button 
          variant={data.isActive ? "destructive" : "default"}
          onClick={handleToggleActive}
          className={!data.isActive ? "bg-green-600 hover:bg-green-700" : ""}
        >
          {data.isActive ? <><UserX className="mr-2 h-4 w-4"/> Khóa tài khoản</> : <><UserCheck className="mr-2 h-4 w-4"/> Mở khóa</>}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* CỘT TRÁI: THÔNG TIN */}
        <div className="space-y-6">
          <Card>
            <CardHeader className="text-center pb-2">
              <div className="mx-auto w-32 h-32 relative mb-4">
                <Avatar className="w-32 h-32 border-4 border-white shadow-lg">
                  <AvatarImage src={data.avatar || undefined} className="object-cover" />
                  <AvatarFallback className="text-4xl font-bold bg-blue-100 text-blue-600">
                    {data.fullName?.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              </div>
              <CardTitle>{data.fullName}</CardTitle>
              <p className="text-sm text-muted-foreground font-medium mt-1">
                {data.instructor.instructorSpecialization?.specialization.specialization_name || "Chưa cập nhật chuyên môn"}
              </p>
            </CardHeader>
            
            <CardContent className="space-y-4 pt-2">
              <Separator />
              <div className="space-y-3 text-sm">
                <div className="flex items-center gap-3">
                    <Mail className="h-4 w-4 text-gray-500 shrink-0" />
                    <span className="truncate" title={data.email}>{data.email}</span>
                </div>
                <div className="flex items-center gap-3">
                    <Phone className="h-4 w-4 text-gray-500 shrink-0" />
                    <span>{data.phone || "Chưa cập nhật"}</span>
                </div>
                <div className="flex items-center gap-3">
                    <MapPin className="h-4 w-4 text-gray-500 shrink-0" />
                    <span className="truncate">{data.address || "Chưa cập nhật"}</span>
                </div>
                <div className="flex items-center gap-3">
                    <Calendar className="h-4 w-4 text-gray-500 shrink-0" />
                    <span>Gia nhập: {formatDate(data.createdAt)}</span>
                </div>
              </div>

              {/* Wallet */}
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 flex items-center justify-between mt-4">
                <div className="flex items-center gap-2">
                  <Wallet className="h-5 w-5 text-blue-600" />
                  <span className="font-medium text-blue-900">Doanh thu ví</span>
                </div>
                <span className="font-bold text-lg text-blue-700">
                  {data.wallet ? formatCurrency(data.wallet.balance) : "0 ₫"}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Bằng cấp */}
          <Card>
            <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                    <Award className="h-4 w-4"/> Bằng cấp chuyên môn
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                {data.instructor.instructor_qualifications && data.instructor.instructor_qualifications.length > 0 ? (
                    data.instructor.instructor_qualifications.map((q, i) => (
                        <div key={i} className="flex items-start gap-3 text-sm pb-3 border-b last:border-0 last:pb-0">
                            <div className="bg-yellow-100 p-2 rounded-md text-yellow-700 shrink-0">
                                <GraduationCap className="h-4 w-4" />
                            </div>
                            <div>
                                <p className="font-semibold text-gray-800">{q.title}</p>
                                <p className="text-gray-500 text-xs">{q.issue_place} • {formatDate(q.issue_date)}</p>
                            </div>
                        </div>
                    ))
                ) : (
                    <p className="text-sm text-gray-500 italic text-center py-2">Chưa cập nhật bằng cấp</p>
                )}
            </CardContent>
          </Card>
        </div>

        {/* CỘT PHẢI: TAB HOẠT ĐỘNG */}
        <div className="lg:col-span-2">
          <Tabs defaultValue="courses" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-4">
              <TabsTrigger value="courses" className="flex gap-2"><BookOpen className="h-4 w-4"/> Khóa học giảng dạy</TabsTrigger>
              <TabsTrigger value="transactions" className="flex gap-2"><History className="h-4 w-4"/> Lịch sử giao dịch</TabsTrigger>
            </TabsList>

            {/* Tab Courses */}
            <TabsContent value="courses">
              <Card>
                <CardHeader>
                  <CardTitle>Danh sách khóa học ({data.instructor.courses.length})</CardTitle>
                  <CardDescription>Các khóa học giảng viên đang quản lý.</CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Khóa học</TableHead>
                        <TableHead>Học viên</TableHead>
                        <TableHead>Giá</TableHead>
                        <TableHead>Trạng thái</TableHead>
                        <TableHead className="text-right">Ngày tạo</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {data.instructor.courses.length > 0 ? (
                        data.instructor.courses.map((course) => (
                          <TableRow key={course.course_id}>
                            <TableCell>
                                <div className="flex items-center gap-3">
                                    <div className="h-10 w-16 bg-gray-100 rounded overflow-hidden relative border shrink-0">
                                        {course.thumbnail ? (
                                            <Image src={course.thumbnail} alt="" fill className="object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-gray-400"><BookOpen className="h-4 w-4"/></div>
                                        )}
                                    </div>
                                    <span className="font-medium line-clamp-1 max-w-[150px]" title={course.title}>{course.title}</span>
                                </div>
                            </TableCell>
                            <TableCell>
                                <div className="flex items-center gap-1 text-gray-600">
                                    <Users className="h-3 w-3" /> {course._count.learnerCourses}
                                </div>
                            </TableCell>
                            <TableCell className="font-medium text-green-600">{formatCurrency(course.price)}</TableCell>
                            <TableCell>
                                <Badge variant={course.status === "Published" ? "default" : "secondary"}>
                                    {course.status === "Published" ? "Công khai" : "Nháp/Chờ"}
                                </Badge>
                            </TableCell>
                            <TableCell className="text-right text-xs text-gray-500">{formatDate(course.createdAt)}</TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow><TableCell colSpan={5} className="text-center h-24 text-gray-500">Chưa tạo khóa học nào.</TableCell></TableRow>
                      )}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Tab Transactions */}
            <TabsContent value="transactions">
              <Card>
                <CardHeader>
                  <CardTitle>Giao dịch gần đây</CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Mã GD</TableHead>
                        <TableHead>Loại</TableHead>
                        <TableHead>Số tiền</TableHead>
                        <TableHead>Trạng thái</TableHead>
                        <TableHead className="text-right">Ngày</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {data.transactions.length > 0 ? (
                        data.transactions.map((tx) => (
                          <TableRow key={tx.transaction_id}>
                            <TableCell className="font-mono text-xs text-gray-500">{tx.transaction_id.slice(0,8)}...</TableCell>
                            <TableCell>{tx.transaction_type}</TableCell>
                            <TableCell className={tx.transaction_type === "Deposit" ? "text-green-600 font-medium" : "text-red-600 font-medium"}>
                                {tx.transaction_type === "Deposit" ? "+" : "-"}{formatCurrency(tx.amount)}
                            </TableCell>
                            <TableCell>
                                <Badge variant="outline" className={tx.status === "Success" ? "text-green-600 border-green-200 bg-green-50" : ""}>{tx.status}</Badge>
                            </TableCell>
                            <TableCell className="text-right text-xs text-gray-500">{formatDate(tx.createdAt)}</TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow><TableCell colSpan={5} className="text-center h-24 text-gray-500">Chưa có giao dịch nào.</TableCell></TableRow>
                      )}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}

// Icon nhỏ
function CheckCircleIcon() {
    return <div className="bg-blue-100 text-blue-600 rounded-full p-0.5"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg></div>
}