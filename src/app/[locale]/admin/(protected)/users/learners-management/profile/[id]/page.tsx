  "use client";

  import React, { useEffect, useState } from "react";
  import { useParams, useRouter } from "next/navigation";
  import Image from "next/image";
  import api from "@/app/lib/axios";
  import { toast } from "sonner";
  import { 
    ArrowLeft, Mail, Phone, MapPin, Calendar, 
    UserCheck, UserX, BookOpen, History, ShieldCheck 
  } from "lucide-react";
  import { Button } from "@/components/ui/button";
  import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
  import { Badge } from "@/components/ui/badge";
  import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
  import { Separator } from "@/components/ui/separator";
  import { Progress } from "@/components/ui/progress";
  import { Skeleton } from "@/components/ui/skeleton";
  import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
  import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow
  } from "@/components/ui/table";

  // Định nghĩa Interface khớp với dữ liệu trả về từ Backend "getUserDetailForAdmin"
  interface UserDetail {
    user_id: string;
    fullName: string;
    email: string;
    phone: string | null;
    avatar: string | null;
    address: string | null;
    bio: string | null;
    isActive: boolean;
    role: string;
    createdAt: string;
    wallet?: {
      balance: string;
    };

    learner?: {
      learner_courses: Array<{
        course_id: string;
        progress: string;
        status: "Enrolled" | "Completed" | "Cancelled";
        enrolledAt: string;
        course: {
          title: string;
          thumbnail: string;
          price: string;
        };
      }>;
    };

    // Lịch sử giao dịch
    transactions: Array<{
      transaction_id: string;
      amount: string;
      transaction_type: string;
      status: string;
      createdAt: string;
    }>;
  }

  export default function UserDetailPage() {
    const params = useParams();
    const router = useRouter();
    const id = params?.id as string;
    const [user, setUser] = useState<UserDetail | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
      const fetchUserDetail = async () => {
        try {
          setLoading(true);
          const res = await api.get(`/users/${id}/detail`); 
          
          if (res.data.data) {
            setUser(res.data.data);
          }
        } catch (error) {
          console.error(error);
          toast.error("Không thể tải thông tin người dùng");
        } finally {
          setLoading(false);
        }
      };

      if (id) fetchUserDetail();
    }, [id]);

    const handleToggleActive = async () => {
      if (!user) return;
      try {
        const newStatus = !user.isActive;
        await api.patch(`/users/${user.user_id}`, { isActive: newStatus });
        
        setUser({ ...user, isActive: newStatus });
        toast.success(`Đã ${newStatus ? "mở khóa" : "khóa"} tài khoản`);
      } catch (error) {
        console.error(error);
        toast.error("Cập nhật thất bại");
      }
    };

    const formatCurrency = (amount: string | number) => {
      return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(Number(amount));
    };

    const formatDate = (dateString: string) => {
      if (!dateString) return "N/A";
      return new Date(dateString).toLocaleDateString("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric"
      });
    };

    const formatDateTime = (dateString: string) => {
      if (!dateString) return "N/A";
      return new Date(dateString).toLocaleString("vi-VN", {
        hour: "2-digit",
        minute: "2-digit",
        day: "2-digit",
        month: "2-digit",
        year: "numeric"
      });
    };

    if (loading) {
      return (
        <div className="p-8 space-y-6 container mx-auto max-w-6xl">
          <div className="flex justify-between">
              <Skeleton className="h-10 w-32" />
              <Skeleton className="h-10 w-32" />
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Skeleton className="h-[400px] w-full lg:col-span-1" />
              <Skeleton className="h-[400px] w-full lg:col-span-2" />
          </div>
        </div>
      );
    }

    if (!user) {
      return <div className="p-8 text-center">Không tìm thấy người dùng</div>;
    }

    return (
      <div className="container mx-auto p-6 max-w-6xl space-y-6">
        
        {/* 1. Header & Navigation */}
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => router.back()}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold flex items-center gap-2">
                {user.fullName}
                {user.role === "ADMIN" && <ShieldCheck className="text-blue-600 h-5 w-5" />}
              </h1>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span className="font-mono text-xs">ID: {user.user_id}</span>
                <span>•</span>
                <Badge variant={user.isActive ? "default" : "destructive"} className={user.isActive ? "bg-green-600 hover:bg-green-600" : ""}>
                  {user.isActive ? "Đang hoạt động" : "Đã khóa"}
                </Badge>
              </div>
            </div>
          </div>
          
          {/* Action Button */}
          <Button 
            variant={user.isActive ? "destructive" : "default"}
            onClick={handleToggleActive}
            className={!user.isActive ? "bg-green-600 hover:bg-green-700" : ""}
          >
            {user.isActive ? (
              <><UserX className="mr-2 h-4 w-4"/> Khóa tài khoản</>
            ) : (
              <><UserCheck className="mr-2 h-4 w-4"/> Mở khóa</>
            )}
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Cột trái: Thông tin cá nhân & Ví */}
          <div className="space-y-6">
            <Card>
              <CardHeader className="text-center pb-2">
                <div className="mx-auto w-32 h-32 relative mb-4">
                  <Avatar className="w-32 h-32 border-4 border-white shadow-lg">
                    <AvatarImage src={user.avatar || undefined} className="object-cover" />
                    <AvatarFallback className="text-4xl font-bold bg-slate-100 text-slate-500">
                      {user.fullName?.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </div>
                <CardTitle>{user.fullName}</CardTitle>
                <CardDescription>{user.bio || "Chưa cập nhật giới thiệu"}</CardDescription>
              </CardHeader>
              
              <CardContent className="space-y-4 pt-2">
                <Separator />
                <div className="space-y-3">
                  <div className="flex items-center gap-3 text-sm">
                      <Mail className="h-4 w-4 text-gray-500 shrink-0" />
                      <span className="truncate" title={user.email}>{user.email}</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                      <Phone className="h-4 w-4 text-gray-500 shrink-0" />
                      <span>{user.phone || "Chưa cập nhật SĐT"}</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                      <MapPin className="h-4 w-4 text-gray-500 shrink-0" />
                      <span className="truncate">{user.address || "Chưa cập nhật địa chỉ"}</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                      <Calendar className="h-4 w-4 text-gray-500 shrink-0" />
                      <span>Tham gia: {formatDate(user.createdAt)}</span>
                  </div>
                </div>
                
                {/* Wallet Info */}
                {/* <div className="bg-slate-50 p-4 rounded-lg border flex items-center justify-between mt-4">
                  <div className="flex items-center gap-2">
                    <Wallet className="h-5 w-5 text-blue-600" />
                    <span className="font-medium text-gray-700">Số dư ví</span>
                  </div>
                  <span className="font-bold text-lg text-blue-700">
                    {user.wallet ? formatCurrency(user.wallet.balance) : "0 ₫"}
                  </span>
                </div> */}
              </CardContent>
            </Card>
          </div>

          {/* Cột phải: Tabs (Khóa học & Giao dịch) */}
          <div className="lg:col-span-2">
            <Tabs defaultValue="courses" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-4">
                <TabsTrigger value="courses" className="flex gap-2">
                  <BookOpen className="h-4 w-4" /> Khóa học đang tham gia
                </TabsTrigger>
                <TabsTrigger value="transactions" className="flex gap-2">
                  <History className="h-4 w-4" /> Lịch sử giao dịch
                </TabsTrigger>
              </TabsList>

              {/* Danh sách Khóa học */}
              <TabsContent value="courses">
                <Card>
                  <CardHeader>
                    <CardTitle>Tiến độ học tập</CardTitle>
                    <CardDescription>
                      Học viên đang tham gia {user.learner?.learner_courses?.length || 0} khóa học.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6 max-h-[500px] overflow-y-auto pr-2">
                    {user.learner?.learner_courses && user.learner.learner_courses.length > 0 ? (
                      user.learner.learner_courses.map((lc, index) => (
                        <div key={index} className="flex items-start sm:items-center gap-4 p-3 hover:bg-slate-50 rounded-lg transition-colors border border-transparent hover:border-slate-100">
                          {/* Thumbnail */}
                          <div className="h-16 w-24 relative rounded-md overflow-hidden bg-gray-200 shrink-0 border">
                            {lc.course.thumbnail ? (
                              <Image src={lc.course.thumbnail} alt={lc.course.title} fill className="object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-gray-400">
                                  <BookOpen className="h-6 w-6"/>
                              </div>
                            )}
                          </div>
                          
                          {/* Info */}
                          <div className="flex-1 min-w-0 space-y-1">
                            <h4 className="font-medium text-sm sm:text-base line-clamp-1" title={lc.course.title}>
                              {lc.course.title}
                            </h4>
                            <div className="flex items-center gap-2">
                              <Progress value={Number(lc.progress)} className="h-2 w-24 bg-slate-200" />
                              <span className="text-xs text-muted-foreground font-medium">{Number(lc.progress).toFixed(0)}%</span>
                            </div>
                            <p className="text-xs text-muted-foreground">
                              Đăng ký: {formatDate(lc.enrolledAt)}
                            </p>
                          </div>

                          {/* Status Badge */}
                          <Badge 
                              variant={lc.status === "Completed" ? "default" : "secondary"} 
                              className={`shrink-0 ${lc.status === "Completed" ? "bg-green-600 hover:bg-green-600" : ""}`}
                          >
                            {lc.status === "Completed" ? "Hoàn thành" : lc.status === "Cancelled" ? "Đã hủy" : "Đang học"}
                          </Badge>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-12 text-muted-foreground bg-slate-50 rounded-lg border border-dashed">
                          <BookOpen className="h-10 w-10 mx-auto text-slate-300 mb-2" />
                          Học viên chưa đăng ký khóa học nào.
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Lịch sử Giao dịch */}
              <TabsContent value="transactions">
                <Card>
                  <CardHeader>
                    <CardTitle>Giao dịch gần đây</CardTitle>
                    <CardDescription>5 giao dịch mới nhất của học viên.</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Mã GD</TableHead>
                          <TableHead>Loại</TableHead>
                          <TableHead>Số tiền</TableHead>
                          <TableHead>Trạng thái</TableHead>
                          <TableHead className="text-right">Thời gian</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {user.transactions && user.transactions.length > 0 ? (
                          user.transactions.map((tx) => (
                            <TableRow key={tx.transaction_id}>
                              <TableCell className="font-mono text-xs font-medium text-gray-500">
                                  {tx.transaction_id.slice(0, 8)}...
                              </TableCell>
                              <TableCell>
                                {tx.transaction_type === "Deposit" ? "Nạp tiền" : 
                                tx.transaction_type === "Withdraw" ? "Rút tiền" : "Thanh toán khóa học"}
                              </TableCell>
                              <TableCell className={`font-medium ${tx.transaction_type === 'Deposit' ? 'text-green-600' : tx.transaction_type === 'Pay' ? 'text-red-600' : ''}`}>
                                {tx.transaction_type === 'Deposit' ? '+' : '-'}{formatCurrency(tx.amount)}
                              </TableCell>
                              <TableCell>
                                <Badge 
                                  variant="outline" 
                                  className={
                                      tx.status === "Success" ? "border-green-500 text-green-600 bg-green-50" : 
                                      tx.status === "Pending" ? "border-amber-500 text-amber-600 bg-amber-50" : 
                                      "border-red-500 text-red-600 bg-red-50"
                                  }
                                >
                                  {tx.status}
                                </Badge>
                              </TableCell>
                              <TableCell className="text-right text-muted-foreground text-xs">
                                {formatDateTime(tx.createdAt)}
                              </TableCell>
                            </TableRow>
                          ))
                        ) : (
                          <TableRow>
                            <TableCell colSpan={5} className="h-32 text-center text-muted-foreground">
                              <History className="h-8 w-8 mx-auto text-slate-300 mb-2" />
                              Chưa có lịch sử giao dịch nào.
                            </TableCell>
                          </TableRow>
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