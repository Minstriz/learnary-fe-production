"use client";

import React, { useEffect, useState, useCallback } from 'react';
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
  UserCog,
  ArrowUpDown,
  ArrowUp,
  ArrowDown
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import { Admin } from "@/type/administrator.type";
import { Spinner } from "@/components/ui/spinner";
import { ToasterConfirm } from "@/components/ToasterConfimer";
import CreateAdminForm from "@/components/CreateAdminForm";
import { EditAdminAccountForm } from "@/components/EditAdminAccountForm";
import { Badge } from "@/components/ui/badge";

type SortOrder = 'asc' | 'desc' | null;

export default function AdminAccountManagement() {
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [open, setOpen] = useState(false);
  const [sortOrder, setSortOrder] = useState<SortOrder>(null);
  const [editDialog, setEditDialog] = useState<{ open: boolean; admin: Admin | null }>({
    open: false,
    admin: null,
  });
  const fetchAdmins = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await api.get("/admins");
      const apiData = response.data;

      if (apiData.success && Array.isArray(apiData.data)) {
        setAdmins(apiData.data);

        toast.success(`Đã tải ${apiData.data.length} tài khoản admin`);
      } else if (Array.isArray(apiData)) {
        setAdmins(apiData);

        toast.success(`Đã tải ${apiData.length} tài khoản admin`);
      } else {
        throw new Error("Dữ liệu API không đúng định dạng");
      }
    } catch (error) {
      console.error("Lỗi khi tải danh sách admin:", error);
      if (isAxiosError(error)) {
        toast.error(error.response?.data?.message || "Lỗi khi tải danh sách admin");
      } else {
        toast.error("Lỗi không xác định");
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {

    fetchAdmins();
  }, [fetchAdmins]);


  const handleDeleteAdmin = async (adminId: string) => {
    ToasterConfirm({
      title: "Xóa tài khoản admin",
      description: "Hành động này không thể hoàn tác. Bạn chắc chắn muốn xóa tài khoản admin này?",
      confirmText: "Xóa tài khoản",
      cancelText: "Hủy",
      onConfirm: async () => {
        try {
          const res = await api.delete(`/admins/${adminId}`);
          if (!res.data.success) throw new Error(res.data.message);
          setAdmins(prev => prev.filter(a => a.admin_id !== adminId));
          toast.success("Đã xóa tài khoản admin thành công");
        } catch (err) {
          console.error(err);
          if (isAxiosError(err)) {
            toast.error(err.response?.data?.message || "Không thể xóa tài khoản admin");
          } else {
            toast.error("Không thể xóa tài khoản admin");
          }
        }
      },
    });
  };

  const toggleSort = () => {
    if (sortOrder === null) {
      setSortOrder('asc');
    } else if (sortOrder === 'asc') {
      setSortOrder('desc');
    } else {
      setSortOrder(null);
    }
  };

  const getSortIcon = () => {
    if (sortOrder === 'asc') return <ArrowUp className="h-4 w-4" />;
    if (sortOrder === 'desc') return <ArrowDown className="h-4 w-4" />;
    return <ArrowUpDown className="h-4 w-4" />;
  };

  const filteredAndSortedAdmins = React.useMemo(() => {
    let filtered = admins.filter((admin) => {
      const searchLower = searchTerm.toLowerCase();
      return (
        admin.user?.fullName?.toLowerCase().includes(searchLower) ||
        admin.user?.email?.toLowerCase().includes(searchLower) ||
        admin.adminRole?.role_name?.toLowerCase().includes(searchLower)
      );
    });

    if (sortOrder) {
      filtered = [...filtered].sort((a, b) => {
        const levelA = a.adminRole?.level ?? 999;
        const levelB = b.adminRole?.level ?? 999;
        return sortOrder === 'asc' ? levelA - levelB : levelB - levelA;
      });
    }

    return filtered;
  }, [admins, searchTerm, sortOrder]);

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
        <div className='flex flex-col gap-2 justify-center w-full'>
          <h1 className="text-3xl font-bold self-center font-roboto-bold">Quản lý tài khoản Admin</h1>
          <p className="text-blue-600 mt-1  font-roboto-condensed-bold">Tổng: {admins.length} tài khoản</p>
        </div>
      </div>

      <div className="flex gap-4 items-center flex-wrap">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Tìm kiếm theo tên, email hoặc vai trò..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={toggleSort}
            className='cursor-pointer hover:bg-gray-300 flex items-center gap-2'
          >
            {getSortIcon()}
            {sortOrder === 'asc' && 'Cấp thấp → cao'}
            {sortOrder === 'desc' && 'Cấp cao → thấp'}
            {sortOrder === null && 'Sắp xếp theo cấp'}
          </Button>

          <Button
            variant="outline"
            onClick={fetchAdmins}
            className='cursor-pointer hover:bg-gray-300'
          >
            <RefreshCcw className="mr-2 h-4 w-4" /> Reload
          </Button>

          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button className="cursor-pointer">
                <Plus className="mr-2 h-4 w-4" />
                Thêm tài khoản admin
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle className="flex justify-center pb-5">Tạo tài khoản admin mới</DialogTitle>
              </DialogHeader>
              <CreateAdminForm onSuccess={() => {
                fetchAdmins();
                setOpen(false);
              }} />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Người dùng</TableHead>
              <TableHead>Role hệ thống</TableHead>
              <TableHead>Vai trò quản trị</TableHead>
              <TableHead>Email</TableHead>
              <TableHead className="text-right">Hành động</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredAndSortedAdmins.map((admin) => (
              <TableRow key={admin.admin_id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-red-50 text-red-600 rounded-md">
                      <UserCog className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="font-medium font-roboto">{admin.user?.fullName || 'N/A'}</p>
                    </div>
                  </div>
                </TableCell>

                <TableCell>
                  <Badge variant="destructive">
                    {admin.user?.role || 'N/A'}
                  </Badge>
                </TableCell>

                <TableCell>
                  <div className="flex items-center gap-2">

                    <span className="font-medium">{admin.adminRole?.role_name || 'N/A'}</span>
                    {admin.adminRole?.level && (
                      <Badge variant="outline" className="text-xs">
                        Cấp {admin.adminRole.level}
                      </Badge>
                    )}
                  </div>
                </TableCell>

                <TableCell>
                  <p className="text-sm text-gray-600">{admin.user?.email || 'N/A'}</p>
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
                        onClick={() => navigator.clipboard.writeText(admin.admin_id)}
                      >
                        Copy Admin ID
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => navigator.clipboard.writeText(admin.user_id)}
                      >
                        Copy User ID
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => setEditDialog({ open: true, admin: admin })}
                      >
                        Sửa vai trò quản trị
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="text-red-600"
                        onClick={() => handleDeleteAdmin(admin.admin_id)}
                      >
                        Xóa tài khoản admin
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Edit Dialog */}
      <Dialog open={editDialog.open} onOpenChange={(open) => setEditDialog(s => ({ ...s, open }))}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Sửa vai trò quản trị</DialogTitle>
          </DialogHeader>
          {editDialog.admin && (
            <EditAdminAccountForm
              open={editDialog.open}
              onOpenChange={(open) => setEditDialog(s => ({ ...s, open }))}
              admin={editDialog.admin}
              onSuccess={() => {
                fetchAdmins();
                setEditDialog({ open: false, admin: null });
              }}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

