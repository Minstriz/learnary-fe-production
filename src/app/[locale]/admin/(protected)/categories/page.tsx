"use client";

import React, { useEffect, useState } from 'react';
import api from "@/app/lib/axios";
import { isAxiosError } from "axios";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Search, 
  MoreHorizontal,
  RefreshCcw,
  Plus,
  Calendar,
  Tag
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { CreateCategoryForm } from "@/components/CreateCategoryForm";
import { EditCategoryForm } from "@/components/EditCategoryForm";
import { ToasterConfirm } from "@/components/ToasterConfimer";
import { toast } from "sonner";
import { Spinner } from "@/components/ui/spinner";

type Category = {
  category_id: string,
  category_name: string,
  slug: string,
  createdAt: string,
  updatedAt: string,
}


export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [open, setOpen] = useState(false);
  const [editDialog, setEditDialog] = useState<{ open: boolean; category: Category | null }>({ open: false, category: null });

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setIsLoading(true);
      const response = await api.get("/categories");
      const apiData = response.data;
      if (apiData.success && Array.isArray(apiData.data)) {
        setCategories(apiData.data);
        toast.success(`Đã tải ${apiData.data.length} danh mục`);
      } else if (Array.isArray(apiData)) {
        setCategories(apiData);
        toast.success(`Đã tải ${apiData.length} danh mục`);
      } else {
        throw new Error("Dữ liệu API không đúng định dạng");
      }
    } catch (error) {
      console.error("Lỗi khi tải danh sách danh mục:", error);
      if (isAxiosError(error)) {
        toast.error(error.response?.data?.message || "Lỗi khi tải danh mục");
      } else {
        toast.error("Lỗi không xác định");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteCategory = async (categoryId: string) => {
    ToasterConfirm({
      title: "Xóa danh mục",
      description: "Hành động này không thể hoàn tác. Bạn chắc chắn muốn xóa danh mục này?",
      confirmText: "Xóa danh mục",
      cancelText: "Hủy",
      onConfirm: async () => {
        try {
          const res = await api.delete(`/categories/delete/${categoryId}`);
          if (!res.data.success) throw new Error(res.data.message);
          
          setCategories(prev => prev.filter(c => c.category_id !== categoryId));
          toast.success("Đã xóa danh mục thành công");
        } catch (err) {
          console.error(err);
          if (isAxiosError(err)) {
            toast.error(err.response?.data?.message || "Không thể xóa danh mục");
          } else {
            toast.error("Không thể xóa danh mục");
          }
        }
      },
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  };

  const filteredCategories = categories.filter((category) =>
    category.category_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    category.slug.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
        <div className='flex flex-col gap-2'>
          <h1 className="text-3xl font-bold">Quản lý danh mục</h1>
          <p className="text-gray-500 mt-1">Tổng số: {categories.length} danh mục</p>
        </div>
      </div>

      <div className="flex gap-4 items-center">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Tìm kiếm theo tên hoặc slug..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={fetchCategories}
            className='cursor-pointer hover:bg-gray-300'
          >
            <RefreshCcw className="mr-2 h-4 w-4" /> Reload
          </Button>
          
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button className="cursor-pointer">
                <Plus className="mr-2 h-4 w-4" />
                Thêm danh mục
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle className="flex justify-center pb-5">Tạo danh mục mới</DialogTitle>
              </DialogHeader>
              <CreateCategoryForm onSuccess={() => {
                fetchCategories();
                setOpen(false);
              }}/>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Tên danh mục</TableHead>
              <TableHead>Slug</TableHead>
              <TableHead>Ngày tạo</TableHead>
              <TableHead>Cập nhật lần cuối</TableHead>
              <TableHead className="text-right">Hành động</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredCategories.map((category) => (
              <TableRow key={category.category_id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-50 text-blue-600 rounded-md">
                      <Tag className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="font-medium">{category.category_name}</p>
                      <p className="text-sm text-gray-500">ID: {category.category_id.slice(0, 8)}...</p>
                    </div>
                  </div>
                </TableCell>

                <TableCell>
                  <code className="text-sm bg-gray-100 px-2 py-1 rounded">
                    {category.slug}
                  </code>
                </TableCell>

                <TableCell>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Calendar className="h-3 w-3 text-gray-400" />
                    {formatDate(category.createdAt)}
                  </div>
                </TableCell>

                <TableCell>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Calendar className="h-3 w-3 text-gray-400" />
                    {formatDate(category.updatedAt)}
                  </div>
                </TableCell>

                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onClick={() => navigator.clipboard.writeText(category.category_id)}
                      >
                        Copy ID
                      </DropdownMenuItem>
                      <DropdownMenuItem>Xem chi tiết</DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => setEditDialog({ open: true, category })}
                      >
                        Chỉnh sửa
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="text-red-600"
                        onClick={() => handleDeleteCategory(category.category_id)}
                      >
                        Xóa danh mục
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      {/* Dialog sửa danh mục */}
      <Dialog open={editDialog.open} onOpenChange={(open) => setEditDialog(s => ({ ...s, open }))}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Sửa danh mục</DialogTitle>
          </DialogHeader>
          {editDialog.category && (
            <EditCategoryForm
              open={editDialog.open}
              onOpenChange={(open) => setEditDialog(s => ({ ...s, open }))}
              category={editDialog.category}
              onSuccess={() => {
                fetchCategories();
                setEditDialog({ open: false, category: null });
              }}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}