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
  Shield,
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
import { EditPermissionForm } from '@/components/EditPermissionForm';
import { ToasterConfirm } from "@/components/ToasterConfimer";
import { toast } from "sonner";
import { Spinner } from "@/components/ui/spinner";
import { Permission } from '@/type/administrator.type';
import { CreatePermissionForm } from '@/components/CreatePermissionForm';
import { PermissionDetailDialog } from '@/components/PermissionDetailDialog';

export default function PermissionsPage() {
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [open, setOpen] = useState(false);
  const [editDialog, setEditDialog] = useState<{ open: boolean; permission: Permission | null }>({ open: false, permission: null });
  const [detailDialog, setDetailDialog] = useState<{ open: boolean; permission: Permission | null }>({ open: false, permission: null });

  useEffect(() => {
    fetchPermission();
  }, []);

  const fetchPermission = async () => {
    try {
      setIsLoading(true);
      const response = await api.get("/permissions");
      const apiData = response.data;
      if (apiData.success && Array.isArray(apiData.data)) {
        setPermissions(apiData.data);
        toast.success(`Đã tải ${apiData.data.length} quyền`);
      } else if (Array.isArray(apiData)) {
        setPermissions(apiData);
        toast.success(`Đã tải ${apiData.length} quyền`);
      } else {
        throw new Error("Dữ liệu API không đúng định dạng");
      }
    } catch (error) {
      console.error("Lỗi khi tải danh sách quyền:", error);
      if (isAxiosError(error)) {
        toast.error(error.response?.data?.message || "Lỗi khi tải quyền");
      } else {
        toast.error("Lỗi không xác định");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeletePermission = async (permissionId: string) => {
    ToasterConfirm({
      title: "Xóa quyền",
      description: "Hành động này không thể hoàn tác. Bạn chắc chắn muốn xóa quyền này?",
      confirmText: "Xóa quyền",
      cancelText: "Hủy",
      onConfirm: async () => {
        try {
          const res = await api.delete(`/permissions/${permissionId}`);
          if (!res.data.success) throw new Error(res.data.message);
          setPermissions(prev => prev.filter(p => p.permission_id !== permissionId));
          toast.success("Đã xóa quyền thành công");
        } catch (err) {
          console.error(err);
          if (isAxiosError(err)) {
            toast.error(err.response?.data?.message || "Không thể xóa quyền");
          } else {
            toast.error("Không thể xóa quyền");
          }
        }
      },
    });
  };


  const filteredPermissions = permissions.filter((permission) =>
    permission.permission_name.toLowerCase().includes(searchTerm.toLowerCase()) 
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
        <div className='flex flex-col gap-2 w-full'>
          <h1 className="text-3xl font-bold font-roboto-bold self-center">Quyền truy cập hệ thống</h1>
          <p className="text-blue-600 mt-1  font-roboto-condensed-bold">Tổng số: {permissions.length} quyền</p>
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
          <Button variant="outline" onClick={fetchPermission} className='cursor-pointer hover:bg-gray-300 text-gray-800 hover:text-blue-600'>
            <RefreshCcw className="mr-2 h-4 w-4" /> Reload
          </Button>
          
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button className="cursor-pointer hover:text-white bg-white text-blue-600 hover:bg-blue-700 border border-blue-600">
                <Plus className="mr-2 h-4 w-4" />
                Thêm quyền
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle className="flex justify-center pb-5">Tạo quyền mới</DialogTitle>
              </DialogHeader>
              <CreatePermissionForm onSuccess={() => {
                fetchPermission();
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
              <TableHead>Quyền hạn</TableHead>
              <TableHead>Mô tả</TableHead>
              <TableHead className="text-right">Hành động</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredPermissions.map((permission) => (
              <TableRow key={permission.permission_id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-50 text-blue-600 rounded-md">
                      <Shield className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="font-medium font-roboto">{permission.permission_name}</p>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <div>
                      <p className="font-medium font-roboto">{permission.description}</p>
                    </div>
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
                      <DropdownMenuItem onClick={() => navigator.clipboard.writeText(permission.permission_id)}>
                        Copy ID
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setDetailDialog({ open: true, permission: permission })} >
                        Xem chi tiết
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setEditDialog({ open: true, permission: permission })} >
                        Chỉnh sửa
                      </DropdownMenuItem>
                      <DropdownMenuItem className="text-red-600" onClick={() => handleDeletePermission(permission.permission_id)}  >
                        Xóa quyền
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
            <DialogTitle>Sửa quyền</DialogTitle>
          </DialogHeader>
          {editDialog.permission && (
            <EditPermissionForm
              open={editDialog.open}
              onOpenChange={(open) => setEditDialog(s => ({ ...s, open }))}
              permission={editDialog.permission}
              onSuccess={() => {
                fetchPermission();
                setEditDialog({ open: false, permission: null });
              }}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Detail Dialog */}
      {detailDialog.permission && (
        <PermissionDetailDialog
          open={detailDialog.open}
          onOpenChange={(open) => setDetailDialog(s => ({ ...s, open }))}
          permission={detailDialog.permission}
        />
      )}
    </div>
  );
}