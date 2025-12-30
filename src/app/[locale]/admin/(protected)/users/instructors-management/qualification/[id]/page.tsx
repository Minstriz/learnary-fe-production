"use client";
 // Đường dẫn tới file context của bạn
import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import api from "@/app/lib/axios";
import type { AxiosError } from 'axios';
import { toast } from "sonner";
import { 
  ArrowLeft, CheckCircle2, XCircle, Calendar, 
  MapPin, FileText, User, Mail, Award 
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";

interface QualificationDetail {
  instructor_qualification_id: string;
  type: "Degree" | "Certificate";
  title: string;
  issue_date: string;
  expire_date?: string | null;
  issue_place: string;
  status: "Pending" | "Approved" | "Rejected";
  isVerified: boolean;
  qualification_images: string[];
  createdAt: string;
  specialization: {
    specialization_name: string;
  };
  user: {
    fullName: string;
    email: string;
    avatar?: string;
  };
  instructor?: {
    user: {
      fullName: string;
      email: string;
      avatar?: string;
    };
  } | null;
}

export default function InstructorQualificationPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;
  const [data, setData] = useState<QualificationDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [isApproveOpen, setIsApproveOpen] = useState(false);
  const [isRejectOpen, setIsRejectOpen] = useState(false);

  const formatDate = (dateString: string) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const formatDateTime = (dateString: string) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleString('vi-VN', {
      hour: '2-digit',
      minute: '2-digit',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  useEffect(() => {
    if (!id) return;
    const fetchData = async () => {
      try {
        const res = await api.get(`/instructor-qualifications/${id}`);
        if (res.data.success) {
          setData(res.data.data);
        }
      } catch (error) {
        console.error(error);
        toast.error("Không thể tải thông tin yêu cầu");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const handleApprove = async () => {
    try {
      setProcessing(true);
      await api.patch(`/instructor-qualifications/${id}/approve`); 
      toast.success("Đã phê duyệt yêu cầu thành công!");
      setIsApproveOpen(false); 
      router.push("/admin/users/instructors-management"); 
    } catch (error) {
      const axiosErr = error as AxiosError<{ message?: string }>;
      toast.error(axiosErr?.response?.data?.message || "Phê duyệt thất bại");
    } finally {
      setProcessing(false);
    }
};

  const handleReject = async () => {
    try {
      setProcessing(true);
      await api.patch(`/instructor-qualifications/${id}/reject`);
      toast.success("Đã từ chối yêu cầu.");
      setIsRejectOpen(false); 
      router.push("/admin/users/instructors-management");
    } catch (error) {
      const axiosErr = error as AxiosError<{ message?: string }>;
      toast.error(axiosErr?.response?.data?.message || "Thao tác thất bại");
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8 space-y-4">
        <Skeleton className="h-10 w-1/3" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!data) {
    return <div className="p-8 text-center">Không tìm thấy dữ liệu</div>;
  }

  const applicant = data.user || data.instructor?.user || {
    fullName: "Người dùng không xác định",
    email: "",
    avatar: null
  };

  return (
    <div className="container mx-auto p-6 max-w-5xl space-y-6">
      {/* Header Navigation */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Chi tiết yêu cầu xét duyệt</h1>
          <p className="text-muted-foreground text-sm">ID: {data.instructor_qualification_id}</p>
        </div>
        <div className="ml-auto">
          <Badge 
            variant={data.status === "Pending" ? "outline" : data.status === "Approved" ? "default" : "destructive"} 
            className="text-base px-4 py-1"
          >
            {data.status === "Pending" ? "Chờ phê duyệt" : data.status === "Approved" ? "Đã duyệt" : "Đã từ chối"}
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Cột trái: Thông tin chi tiết */}
        <div className="lg:col-span-2 space-y-6">
          
          {/*Thông tin Bằng cấp */}
          <Card>
            <CardHeader className="bg-slate-50">
              <CardTitle className="flex items-center gap-2 text-blue-700">
                <Award className="h-5 w-5" />
                Thông tin chuyên môn
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-muted-foreground">Tiêu đề</label>
                  <p className="font-semibold">{data.title}</p>
                </div>
                <div>
                  <label className="text-sm text-muted-foreground">Chuyên ngành</label>
                  <p className="font-medium text-purple-600">{data.specialization.specialization_name}</p>
                </div>
                <div>
                  <label className="text-sm text-muted-foreground">Nơi cấp</label>
                  <div className="flex gap-2">
                    <MapPin className="h-4 w-4 text-gray-400" />
                    <span>{data.issue_place}</span>
                  </div>
                </div>
                <div>
                  <label className="text-sm text-muted-foreground">Ngày cấp</label>
                  <div className="flex gap-2">
                    <Calendar className="h-4 w-4 text-gray-400" />
                    <span>{formatDate(data.issue_date)}</span>
                  </div>
                </div>
                {data.expire_date && (
                  <div>
                    <label className="text-sm text-muted-foreground">Ngày hết hạn</label>
                    <div className="flex gap-2">
                      <Calendar className="h-4 w-4 text-gray-400" />
                      <span>{formatDate(data.expire_date)}</span>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Ảnh minh chứng */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Minh chứng ({data.qualification_images.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {data.qualification_images.map((img, index) => (
                  <div key={index} className="group relative aspect-4/3 border rounded-lg overflow-hidden bg-gray-100 cursor-pointer">
                    <Image 
                      src={img} 
                      alt="Minh chứng" 
                      fill 
                      className="object-cover hover:scale-105 transition-transform" 
                      onClick={() => window.open(img, "_blank")} 
                    />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Cột phải: Thông tin user & Hành động */}
        <div className="space-y-6">
          
          {/* Thông tin ứng viên */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Thông tin ứng viên
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-full bg-gray-200 relative overflow-hidden">
                  {applicant.avatar && (
                    <Image 
                      src={applicant.avatar} 
                      alt="Avatar" 
                      fill 
                      className="object-cover" 
                    />
                  )}
                </div>
                <div>
                  <p className="font-bold">{applicant.fullName}</p>
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Mail className="h-3 w-3" />
                    {applicant.email}
                  </div>
                </div>
              </div>
              <Separator />
              <div className="text-sm">
                 <p className="text-muted-foreground">Ngày gửi yêu cầu:</p>
                 <p>{formatDateTime(data.createdAt)}</p>
              </div>
            </CardContent>
          </Card>

          {/* Hành động (Dialogs) */}
          {data.status === "Pending" && (
            <Card className="border-2 border-blue-100 shadow-md">
              <CardHeader>
                <CardTitle>Phê duyệt hồ sơ</CardTitle>
                <CardDescription>Vui lòng kiểm tra kỹ thông tin trước khi quyết định.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                
                {/* Dialog Phê duyệt */}
                <Dialog open={isApproveOpen} onOpenChange={setIsApproveOpen}>
                  <DialogTrigger asChild>
                    <Button className="w-full bg-green-600 hover:bg-green-700" size="lg" disabled={processing}>
                      <CheckCircle2 className="mr-2 h-5 w-5" />
                      Phê duyệt Giảng viên
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Xác nhận phê duyệt?</DialogTitle>
                      <DialogDescription>
                        Hành động này sẽ nâng cấp tài khoản <b>{applicant.fullName}</b> thành Giảng viên.
                      </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setIsApproveOpen(false)} disabled={processing}>
                        Hủy bỏ
                      </Button>
                      <Button onClick={handleApprove} className="bg-green-600 hover:bg-green-700" disabled={processing}>
                        {processing ? "Đang xử lý..." : "Xác nhận Phê duyệt"}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>

                {/* Dialog Từ chối */}
                <Dialog open={isRejectOpen} onOpenChange={setIsRejectOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline" className="w-full border-red-200 text-red-600 hover:bg-red-50" disabled={processing}>
                      <XCircle className="mr-2 h-5 w-5" />
                      Từ chối hồ sơ
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle className="text-red-600">Từ chối hồ sơ này?</DialogTitle>
                      <DialogDescription>
                        Hồ sơ sẽ bị đánh dấu là <b>Từ chối</b> và các ảnh minh chứng sẽ bị xóa. Hành động này không thể hoàn tác.
                      </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setIsRejectOpen(false)} disabled={processing}>
                        Hủy bỏ
                      </Button>
                      <Button onClick={handleReject} variant="destructive" disabled={processing}>
                        {processing ? "Đang xử lý..." : "Xác nhận Từ chối"}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>

              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}