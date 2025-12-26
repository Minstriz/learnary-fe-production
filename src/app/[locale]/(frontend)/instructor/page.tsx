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

// API Helper
import api from '@/app/lib/axios';

// Type definitions
interface RevenueData {
  name: string;
  total: number;
}

interface Enrollment {
  id: string;
  user: string;
  email: string;
  avatar: string;
  course: string;
  amount: number;
  enrolledAt: string;
}

export default function InstructorDashboard() {
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalStudents: 0,
    totalCourses: 0,
    publishedCourses: 0,
    averageRating: 0,
    revenueGrowth: 0,
  });
  const [revenueData, setRevenueData] = useState<RevenueData[]>([]);
  const [recentEnrollments, setRecentEnrollments] = useState<Enrollment[]>([]);
  const { user, isLoggedIn, isLoading: isAuthLoading } = useAuth();
  const router = useRouter();

  // Fetch dữ liệu thật từ API
  useEffect(() => {
    if (isAuthLoading) return;

    if (!isLoggedIn || user?.role !== "INSTRUCTOR") {
      toast.error('Bạn không có quyền truy cập trang này.');
      router.push(`/`); 
      return;
    }

    const fetchData = async () => {
      try {
        setIsLoading(true);
        const userId = user?.id;

        // Gọi 3 API song song
        const [overviewRes, revenueRes, enrollmentsRes] = await Promise.all([
          api.get(`/instructor/stats/overview/${userId}`),
          api.get(`/instructor/stats/revenue/${userId}`),
          api.get(`/instructor/stats/enrollments/${userId}?limit=5`),
        ]);

        setStats(overviewRes.data.data);

        // Xử lý revenueData để luôn đủ 12 tháng gần nhất
        const rawRevenue: RevenueData[] = revenueRes.data.data || [];
        console.log('Raw Revenue Data:', rawRevenue);
        const months: Record<string, number> = {};
        for (let i = 11; i >= 0; i--) {
          const d = new Date();
          d.setMonth(d.getMonth() - i);
          const key = `${d.getMonth() + 1}/${d.getFullYear()}`;
          months[key] = 0;
        }
        rawRevenue.forEach((item) => {
          const monthFromApi = item.name.replace('T', ''); 
          const matchingKey = Object.keys(months).find(key => key.startsWith(`${monthFromApi}/`));
          if (matchingKey) {
            months[matchingKey] += item.total;
          }
        });
        const fullRevenueData: RevenueData[] = Object.entries(months).map(([name, total]) => ({ name, total }));
        setRevenueData(fullRevenueData);

        setRecentEnrollments(enrollmentsRes.data.data);
      } catch (error) {
        console.error('Error fetching instructor stats:', error);
        toast.error('Không thể tải dữ liệu thống kê');
      } finally {
        setIsLoading(false);
      }
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
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Tổng quan</h1>
          <p className="text-muted-foreground mt-1">Chào mừng trở lại! Đây là tình hình hoạt động các khóa học của bạn.</p>
        </div>
        <div className="flex gap-3">
          <Link href="/instructor/wallet">
            <Button variant="outline" className="cursor-pointer">Ví giảng viên</Button>
          </Link>
          <Link href="/instructor/my-courses">
            <Button variant="outline" className="cursor-pointer">Khóa học của bạn</Button>
          </Link>
          <Link href="/instructor/my-combo">
            <Button variant="outline" className="cursor-pointer">Combo khóa học</Button>
          </Link>
          <Link href="/instructor/create-course">
            <Button className="shadow-lg hover:shadow-xl transition-all cursor-pointer bg-pink-600 hover:bg-pink-700 hover:text-white">
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
          note={stats.revenueGrowth >= 0 
            ? `+${stats.revenueGrowth}% so với tháng trước` 
            : `${stats.revenueGrowth}% so với tháng trước`}
        />
        <StatsCard 
          title="Học viên" 
          value={`${stats.totalStudents}`} 
          icon={Users}
        />
        <StatsCard 
          title="Khóa học" 
          value={stats.totalCourses.toString()} 
          icon={BookOpen}
          note={`Bạn đã có ${stats.publishedCourses} khóa học public`}
        />
        <StatsCard 
          title="Đánh giá trung bình" 
          value={stats.averageRating > 0 ? `${stats.averageRating}/5.0` : 'Chưa có'} 
          icon={Star}
        />
      </div>

      {/* --- CHARTS & LISTS --- */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        
        {/* BIỂU ĐỒ DOANH THU (Chiếm 4 cột) */}
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Biểu đồ doanh thu</CardTitle>
            <CardDescription>Doanh thu trong 12 tháng gần nhất</CardDescription>
          </CardHeader>
          <CardContent className="pl-2">
            <div className="h-[350px] w-full">
              {revenueData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={revenueData} barCategoryGap="20%">
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
                      tickFormatter={(value) => {
                        if (value === 0) return '0đ';
                        if (value >= 1000000) return `${(value / 1000000).toFixed(1)}tr`;
                        if (value >= 1000) return `${(value / 1000).toFixed(0)}k`;
                        return `${value}đ`;
                      }} 
                    />
                    <Tooltip 
                      cursor={{ fill: '#f4f4f5' }}
                      contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                      formatter={(value: number) => [formatCurrency(value), 'Doanh thu']}
                    />
                    <Bar 
                      dataKey="total" 
                      fill="#FF1493" 
                      radius={[4, 4, 0, 0]}
                      maxBarSize={60}
                    />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full text-muted-foreground">
                  Chưa có dữ liệu doanh thu
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* DANH SÁCH ĐĂNG KÝ GẦN ĐÂY (Chiếm 3 cột) */}
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Đăng ký gần đây</CardTitle>
            <CardDescription>
              Bạn có {recentEnrollments.length} lượt đăng ký mới.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-8">
              {recentEnrollments.map((enrollment) => (
                <div key={enrollment.id} className="flex items-center">
                  <Avatar className="h-9 w-9">
                    <AvatarImage src={enrollment.avatar} alt="Avatar" />
                    <AvatarFallback>{enrollment.user.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div className="ml-4 space-y-1">
                    <p className="text-sm font-medium leading-none">{enrollment.user}</p>
                    <p className="text-xs text-muted-foreground line-clamp-1">
                      Đăng ký: {enrollment.course}
                    </p>
                  </div>
                  <div className="ml-auto font-medium text-sm text-green-600">
                    +{formatCurrency(enrollment.amount)}
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
function StatsCard({ title, value, icon: Icon, note }: { title: string, value: string, icon: React.ComponentType<{ className?: string }>, note?: string }) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground ">
          {title}
        </CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-pink-600">{value}</div>
        {note && (
          <p className="text-xs text-muted-foreground mt-1">
            {note}
          </p>
        )}
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