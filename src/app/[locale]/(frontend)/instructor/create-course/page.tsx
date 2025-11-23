'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from "@/app/context/AuthContext";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
// import { Toaster } from "@/components/ui/sonner";
// import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import api from '@/app/lib/axios';
import { isAxiosError } from 'axios';
import { Loader2 } from 'lucide-react';

type ApiCategory = { category_id: string; category_name: string };
type ApiLevel = { level_id: string; level_name: string };
type CommonType = { id: string; name: string };

export default function CreateCoursePage() {
  const router = useRouter();
  const { user, isLoggedIn, isLoading: isAuthLoading } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [categories, setCategories] = useState<CommonType[]>([]);
  const [levels, setLevels] = useState<CommonType[]>([]);
  const [formData, setFormData] = useState({
    title: '', category_id: '', level_id: '', description: '',
    price: 0, requirement: '', first_chapter_name: ''
  });
  useEffect(() => {
    if (isAuthLoading) return;

    if (!isLoggedIn || user?.role !== "INSTRUCTOR") {
      alert('Bạn không có quyền truy cập trang này.');
      router.push(`/`); 
      return;
    }
    const initData = async () => {
      try {        
        const [catRes, lvlRes] = await Promise.all([api.get('/categories'), api.get('/levels')]);
        const catData = Array.isArray(catRes.data.data) ? catRes.data.data : (Array.isArray(catRes.data) ? catRes.data : []);
        const lvlData = Array.isArray(lvlRes.data.data) ? lvlRes.data.data : (Array.isArray(lvlRes.data) ? lvlRes.data : []);
        setCategories(catData.map((c: ApiCategory) => ({ id: c.category_id, name: c.category_name })));
        setLevels(lvlData.map((l: ApiLevel) => ({ id: l.level_id, name: l.level_name })));
      } catch (err) { 
        console.error("Error loading initial data:", err);
        if (isAxiosError(err)) { 
          console.error("Response status:", err.response?.status);
          console.error("Response data:", err.response?.data);
          setError(err.response?.data?.message || 'Không thể tải dữ liệu ban đầu'); 
        } 
        else { setError('Lỗi không xác định'); }}
      finally { setIsInitializing(false); }
    };
    initData();
  }, [isAuthLoading, isLoggedIn, user, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.category_id || !formData.level_id || !formData.first_chapter_name.trim()) {
      setError('Vui lòng điền đủ các trường bắt buộc (*)'); return;
    }
    setIsLoading(true);
    
    const payload = {
        title: formData.title, category_id: formData.category_id, level_id: formData.level_id,
        description: formData.description, price: formData.price, requirement: formData.requirement,
        thumbnail: '',
        chapter: [{ chapter_title: formData.first_chapter_name, order_index: 0, lessons: [], quiz: null }]
    };  

    try {
      const res = await api.post('/courses', payload);
      const courseId = res.data.data?.course_id || res.data.course_id;
      router.push(`/instructor/edit-course/${courseId}`);
    } catch (err) {
      if (isAxiosError(err)) setError(err.response?.data?.message || 'Tạo khóa học thất bại');
      else setError('Lỗi không xác định');
      setIsLoading(false);
    }
  };

  if (isInitializing) return <div className="flex h-screen items-center justify-center"><Loader2 className="animate-spin text-primary" size={40} /></div>;
  if (isAuthLoading || isInitializing) {
    return (
        <div className="flex h-screen items-center justify-center">
            <Loader2 className="animate-spin text-primary" size={40} />
        </div>
    );
  }
  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Bắt đầu tạo khóa học mới</h1>
      <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded-xl border shadow-sm">
        <div className="space-y-2">
            <Label>Tên khóa học <span className="text-red-500">*</span></Label>
            <Input value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} />
        </div>
        <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2"><Label>Danh mục <span className="text-red-500">*</span></Label>
                <Select onValueChange={(val) => setFormData({...formData, category_id: val})}>
                    <SelectTrigger><SelectValue placeholder="Chọn danh mục" /></SelectTrigger>
                    <SelectContent>{categories.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent>
                </Select>
            </div>
            <div className="space-y-2"><Label>Cấp độ <span className="text-red-500">*</span></Label>
                <Select onValueChange={(val) => setFormData({...formData, level_id: val})}>
                    <SelectTrigger><SelectValue placeholder="Chọn cấp độ" /></SelectTrigger>
                    <SelectContent>{levels.map(l => <SelectItem key={l.id} value={l.id}>{l.name}</SelectItem>)}</SelectContent>
                </Select>
            </div>
        </div>
        <div className="space-y-2">
            <Label>Tên chương đầu tiên <span className="text-red-500">*</span></Label>
            <Input value={formData.first_chapter_name} onChange={(e) => setFormData({...formData, first_chapter_name: e.target.value})} />
        </div>
        {error && <div className="p-3 bg-red-50 text-red-600 rounded-md text-sm">{error}</div>}
        <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Tạo bản nháp & Tiếp tục
        </Button>
      </form>
    </div>
  );
}