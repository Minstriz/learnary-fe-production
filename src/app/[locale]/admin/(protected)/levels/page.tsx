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
  BarChart3
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
import { CreateLevelForm } from "@/components/CreateLevelForm";
import { EditLevelForm } from "@/components/EditLevelForm";
import { ToasterConfirm } from "@/components/ToasterConfimer";
import { toast } from "sonner";
import { Spinner } from "@/components/ui/spinner";
import { Badge } from "@/components/ui/badge";

type Level = {
  level_id: string,
  level_name: string,
  order_index: number,
  createdAt: string,
  updatedAt: string,
}

export default function LevelsPage() {
  const [levels, setLevels] = useState<Level[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [open, setOpen] = useState(false);
  const [editDialog, setEditDialog] = useState<{ open: boolean; level: Level | null }>({ open: false, level: null });

  useEffect(() => {
    fetchLevels();
  }, []);

  const fetchLevels = async () => {
    try {
      setIsLoading(true);
      const response = await api.get("/levels");
      const apiData = response.data;
      if (apiData.success && Array.isArray(apiData.data)) {
        const sortedData = apiData.data.sort((a: Level, b: Level) => a.order_index - b.order_index);
        setLevels(sortedData);
        toast.success(`Đã tải ${apiData.data.length} cấp độ`);
      } else if (Array.isArray(apiData)) {
        const sortedData = apiData.sort((a: Level, b: Level) => a.order_index - b.order_index);
        setLevels(sortedData);
        toast.success(`Đã tải ${apiData.length} cấp độ`);
      } else {
        throw new Error("Dữ liệu API không đúng định dạng");
      }
    } catch (error) {
      console.error("Lỗi khi tải danh sách cấp độ:", error);
      if (isAxiosError(error)) {
        toast.error(error.response?.data?.message || "Lỗi khi tải cấp độ");
      } else {
        toast.error("Lỗi không xác định");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteLevel = async (levelId: string) => {
    ToasterConfirm({
      title: "Xóa cấp độ",
      description: "Hành động này không thể hoàn tác. Bạn chắc chắn muốn xóa cấp độ này?",
      confirmText: "Xóa cấp độ",
      cancelText: "Hủy",
      onConfirm: async () => {
        try {
          const res = await api.delete(`/levels/${levelId}`);
          if (!res.data.success) throw new Error(res.data.message);
          
          setLevels(prev => prev.filter(l => l.level_id !== levelId));
          toast.success("Đã xóa cấp độ thành công");
        } catch (err) {
          console.error(err);
          if (isAxiosError(err)) {
            toast.error(err.response?.data?.message || "Không thể xóa cấp độ");
          } else {
            toast.error("Không thể xóa cấp độ");
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

  const filteredLevels = levels.filter((level) =>
    level.level_name.toLowerCase().includes(searchTerm.toLowerCase())
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
          <h1 className="text-3xl font-bold">Quản lý cấp độ</h1>
          <p className="text-gray-500 mt-1">Tổng số: {levels.length} cấp độ</p>
        </div>
      </div>

      <div className="flex gap-4 items-center">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Tìm kiếm theo tên cấp độ..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={fetchLevels}
            className='cursor-pointer hover:bg-gray-300'
          >
            <RefreshCcw className="mr-2 h-4 w-4" /> Reload
          </Button>
          
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button className="cursor-pointer">
                <Plus className="mr-2 h-4 w-4" />
                Thêm cấp độ
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle className="flex justify-center pb-5">Tạo cấp độ mới</DialogTitle>
              </DialogHeader>
              <CreateLevelForm onSuccess={() => {
                fetchLevels();
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
              <TableHead>Tên cấp độ</TableHead>
              <TableHead>Thứ tự</TableHead>
              <TableHead>Ngày tạo</TableHead>
              <TableHead>Cập nhật lần cuối</TableHead>
              <TableHead className="text-right">Hành động</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredLevels.map((level) => (
              <TableRow key={level.level_id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-purple-50 text-purple-600 rounded-md">
                      <BarChart3 className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="font-medium">{level.level_name}</p>
                      <p className="text-sm text-gray-500">ID: {level.level_id.slice(0, 8)}...</p>
                    </div>
                  </div>
                </TableCell>

                <TableCell>
                  <Badge variant="outline" className="font-mono">
                    {level.order_index}
                  </Badge>
                </TableCell>

                <TableCell>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Calendar className="h-3 w-3 text-gray-400" />
                    {formatDate(level.createdAt)}
                  </div>
                </TableCell>

                <TableCell>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Calendar className="h-3 w-3 text-gray-400" />
                    {formatDate(level.updatedAt)}
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
                        onClick={() => navigator.clipboard.writeText(level.level_id)}
                      >
                        Copy ID
                      </DropdownMenuItem>
                      <DropdownMenuItem>Xem chi tiết</DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => setEditDialog({ open: true, level })}
                      >
                        Chỉnh sửa
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="text-red-600"
                        onClick={() => handleDeleteLevel(level.level_id)}
                      >
                        Xóa cấp độ
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      {/* Dialog sửa cấp độ */}
      <Dialog open={editDialog.open} onOpenChange={(open) => setEditDialog(s => ({ ...s, open }))}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Sửa cấp độ</DialogTitle>
          </DialogHeader>
          {editDialog.level && (
            <EditLevelForm
              open={editDialog.open}
              onOpenChange={(open) => setEditDialog(s => ({ ...s, open }))}
              level={editDialog.level}
              onSuccess={() => {
                fetchLevels();
                setEditDialog({ open: false, level: null });
              }}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
