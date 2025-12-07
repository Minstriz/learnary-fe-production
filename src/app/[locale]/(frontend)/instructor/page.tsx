'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer 
} from 'recharts';
import { 
  DollarSign, Users, BookOpen, Star, ArrowUpRight, Plus, Loader2 
} from 'lucide-react';
import { useAuth } from "@/app/context/AuthContext";
import { useRouter } from "next/navigation";

// UI Components
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from 'sonner';

// API Helper (Giả sử bạn sẽ có API thống kê sau này)
// import api from '@/app/lib/axios';

// --- MOCK DATA (Dữ liệu giả lập để hiển thị biểu đồ) ---
const revenueData = [
  { name: 'T1', total: 1500000 },
  { name: 'T2', total: 2300000 },
  { name: 'T3', total: 3200000 },
  { name: 'T4', total: 4500000 },
  { name: 'T5', total: 3800000 },
  { name: 'T6', total: 5200000 },
  { name: 'T7', total: 6100000 },
];

const recentSales = [
  { id: 1, user: 'Nguyễn Văn A', course: 'ReactJS Nâng Cao', amount: 599000, email: 'a@example.com', avatar: '' },
  { id: 2, user: 'Trần Thị B', course: 'NodeJS Cơ Bản', amount: 399000, email: 'b@example.com', avatar: '' },
  { id: 3, user: 'Lê Văn C', course: 'Fullstack Next.js', amount: 899000, email: 'c@example.com', avatar: '' },
  { id: 4, user: 'Phạm Thị D', course: 'ReactJS Nâng Cao', amount: 599000, email: 'd@example.com', avatar: '' },
  { id: 5, user: 'Hoàng Văn E', course: 'Docker cho Dev', amount: 299000, email: 'e@example.com', avatar: '' },
];

export default function InstructorDashboard() {
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalStudents: 0,
    totalCourses: 0,
    averageRating: 0,
  });
  const { user, isLoggedIn, isLoading: isAuthLoading } = useAuth();
  const router = useRouter();


  // Giả lập fetch dữ liệu
  useEffect(() => {
    if (isAuthLoading) return;

    if (!isLoggedIn || user?.role !== "INSTRUCTOR") {
      toast.error('Bạn không có quyền truy cập trang này.');
      router.push(`/`); 
      return;
    }
    const fetchData = async () => {
      // Trong thực tế, bạn sẽ gọi: await api.get('/instructor/stats');
      setTimeout(() => {
        setStats({
          totalRevenue: 24500000,
          totalStudents: 1234,
          totalCourses: 8,
          averageRating: 4.8,
        });
        setIsLoading(false);
      }, 1000);
    };
    fetchData();
  }, [isAuthLoading, isLoggedIn, user, router]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
  };

  if (isLoading) {
    return <DashboardSkeleton />;
  }

  if (isAuthLoading ) {
    return (
        <div className="flex h-screen items-center justify-center">
            <Loader2 className="animate-spin text-primary" size={40} />
        </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/50 p-8 space-y-8">
      {/* --- HEADER --- */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Tổng quan</h1>
          <p className="text-muted-foreground mt-1">Chào mừng trở lại! Đây là tình hình hoạt động các khóa học của bạn.</p>
        </div>
        <div className="flex gap-3">
          <Link href="/instructor/wallet">
            <Button variant="outline">Quản lý ví</Button>
          </Link>
          <Link href="/instructor/my-courses">
            <Button variant="outline">Quản lý khóa học</Button>
          </Link>
          <Link href="/instructor/create-course">
            <Button className="shadow-lg hover:shadow-xl transition-all">
              <Plus className="mr-2 h-4 w-4" /> Tạo khóa học mới
            </Button>
          </Link>
        </div>
      </div>

      {/* --- STATS CARDS (KPIs) --- */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard 
          title="Tổng doanh thu" 
          value={formatCurrency(stats.totalRevenue)} 
          icon={DollarSign} 
          trend="+20.1% so với tháng trước"
        />
        <StatsCard 
          title="Học viên" 
          value={`+${stats.totalStudents}`} 
          icon={Users} 
          trend="+180 học viên mới"
        />
        <StatsCard 
          title="Khóa học" 
          value={stats.totalCourses.toString()} 
          icon={BookOpen} 
          trend="2 khóa đang chờ duyệt"
        />
        <StatsCard 
          title="Đánh giá trung bình" 
          value={`${stats.averageRating}/5.0`} 
          icon={Star} 
          trend="Dựa trên 450 đánh giá"
        />
      </div>

      {/* --- CHARTS & LISTS --- */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        
        {/* BIỂU ĐỒ DOANH THU (Chiếm 4 cột) */}
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Biểu đồ doanh thu</CardTitle>
            <CardDescription>Doanh thu trong 7 tháng gần nhất</CardDescription>
          </CardHeader>
          <CardContent className="pl-2">
            <div className="h-[350px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={revenueData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                  <XAxis 
                    dataKey="name" 
                    stroke="#888888" 
                    fontSize={12} 
                    tickLine={false} 
                    axisLine={false} 
                  />
                  <YAxis 
                    stroke="#888888" 
                    fontSize={12} 
                    tickLine={false} 
                    axisLine={false}
                    tickFormatter={(value) => `${value / 1000000}M`} 
                  />
                  <Tooltip 
                    cursor={{ fill: '#f4f4f5' }}
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                    formatter={(value: number) => [formatCurrency(value), 'Doanh thu']}
                  />
                  <Bar dataKey="total" fill="#0f172a" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* DANH SÁCH ĐĂNG KÝ GẦN ĐÂY (Chiếm 3 cột) */}
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Đăng ký gần đây</CardTitle>
            <CardDescription>
              Bạn có {recentSales.length} lượt đăng ký mới trong hôm nay.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-8">
              {recentSales.map((sale) => (
                <div key={sale.id} className="flex items-center">
                  <Avatar className="h-9 w-9">
                    <AvatarImage src={sale.avatar} alt="Avatar" />
                    <AvatarFallback>{sale.user.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div className="ml-4 space-y-1">
                    <p className="text-sm font-medium leading-none">{sale.user}</p>
                    <p className="text-xs text-muted-foreground line-clamp-1">
                      Đăng ký: {sale.course}
                    </p>
                  </div>
                  <div className="ml-auto font-medium text-sm text-green-600">
                    +{formatCurrency(sale.amount)}
                  </div>
                </div>
              ))}
            </div>
            <Button variant="ghost" className="w-full mt-4 text-sm text-muted-foreground hover:text-primary">
              Xem tất cả giao dịch <ArrowUpRight className="ml-1 h-4 w-4" />
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// --- Component con: Card Thống kê ---
function StatsCard({ title, value, icon: Icon, trend }: { title: string, value: string, icon: React.ComponentType<{ className?: string }>, trend: string }) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p className="text-xs text-muted-foreground mt-1">
          {trend}
        </p>
      </CardContent>
    </Card>
  );
}

// --- Component Skeleton khi tải ---
function DashboardSkeleton() {
  return (
    <div className="p-8 space-y-8">
      <div className="flex justify-between">
        <Skeleton className="h-10 w-1/3" />
        <Skeleton className="h-10 w-40" />
      </div>
      <div className="grid gap-4 md:grid-cols-4">
        {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-32 rounded-xl" />)}
      </div>
      <div className="grid gap-4 md:grid-cols-7">
        <Skeleton className="col-span-4 h-[400px] rounded-xl" />
        <Skeleton className="col-span-3 h-[400px] rounded-xl" />
      </div>
    </div>
  );
}