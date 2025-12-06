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
  ShieldUser,
  Wrench
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
import { AdminRoleWithPermissions } from "@/type/administrator.type";
import { CreateAdminRoleForm } from "@/components/CreateAdminRoleForm";
import { EditAdminRoleForm } from "@/components/EditAdminRoleForm";
import { AdminRoleDetailDialog } from "@/components/AdminRoleDetailDialog";
import { Spinner } from "@/components/ui/spinner";
import { ToasterConfirm } from "@/components/ToasterConfimer";
import { Badge } from '@/components/ui/badge';

const getUniqueResourcesFromRole = (role: AdminRoleWithPermissions): string[] => {
  if (!role.permissions || role.permissions.length === 0) {
    return [];
  }
  
  const resourceNames = role.permissions.flatMap((p) =>
    p.permission.resources?.map((r) => r.resource?.resource_name) || []
  );
  
  return Array.from(new Set(resourceNames)).filter(Boolean) as string[];
};

export default function AdminRolePage() {
  const [adminRoles, setAdminRoles] = useState<AdminRoleWithPermissions[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [open, setOpen] = useState(false);
  const [editDialog, setEditDialog] = useState<{ open: boolean; adminRole: AdminRoleWithPermissions | null }>({ open: false, adminRole: null });
  const [detailDialog, setDetailDialog] = useState<{ open: boolean; adminRole: AdminRoleWithPermissions | null }>({ open: false, adminRole: null });

  useEffect(() => {
    fetchAdminRoles();
  }, []);

  const fetchAdminRoles = async () => {
    try {
      setIsLoading(true);
      const response = await api.get("/admin-roles");
      const apiData = response.data;
      if (apiData.success && Array.isArray(apiData.data)) {
        setAdminRoles(apiData.data);
        toast.success(`Đã tải ${apiData.data.length} vai trò`);
      } else if (Array.isArray(apiData)) {
        setAdminRoles(apiData);
        toast.success(`Đã tải ${apiData.length} vai trò`);
      } else {
        throw new Error("Dữ liệu API không đúng định dạng");
      }
    } catch (error) {
      console.error("Lỗi khi tải danh sách vai trò:", error);
      if (isAxiosError(error)) {
        toast.error(error.response?.data?.message || "Lỗi khi tải vai trò");
      } else {
        toast.error("Lỗi không xác định");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteAdminRole = async (adminRoleId: string) => {
    ToasterConfirm({
      title: "Xóa vai trò",
      description: "Hành động này không thể hoàn tác. Bạn chắc chắn muốn xóa vai trò này?",
      confirmText: "Xóa vai trò",
      cancelText: "Hủy",
      onConfirm: async () => {
        try {
          const res = await api.delete(`/admin-roles/${adminRoleId}`);
          if (!res.data.success) throw new Error(res.data.message);
          setAdminRoles(prev => prev.filter(r => r.admin_role_id !== adminRoleId));
          toast.success("Đã xóa vai trò thành công");
        } catch (err) {
          console.error(err);
          if (isAxiosError(err)) {
            toast.error(err.response?.data?.message || "Không thể xóa vai trò");
          } else {
            toast.error("Không thể xóa vai trò");
          }
        }
      },
    });
  };

  const filteredAdminRoles = adminRoles.filter((role) =>
    role.role_name.toLowerCase().includes(searchTerm.toLowerCase()),
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
          <h1 className="text-3xl font-bold self-center font-roboto-bold">Vai trò cấp bậc quản trị</h1>
          <p className="text-blue-600 mt-1  font-roboto-condensed-bold">Tổng: {adminRoles.length} vai trò</p>
        </div>
      </div>

      <div className="flex gap-4 items-center">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Tìm kiếm theo tên vai trò..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={fetchAdminRoles}
            className='cursor-pointer hover:bg-gray-300 text-gray-800 hover:text-blue-600'
          >
            <RefreshCcw className="mr-2 h-4 w-4" /> Reload
          </Button>

          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button className="cursor-pointer hover:text-white bg-white text-blue-600 hover:bg-blue-700 border border-blue-600">
                <Plus className="mr-2 h-4 w-4" />
                Thêm vai trò
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle className="flex justify-end pb-5 pr-10">Tạo vai trò mới</DialogTitle>
              </DialogHeader>
              <CreateAdminRoleForm onSuccess={() => {
                fetchAdminRoles();
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
              <TableHead>Vai trò</TableHead>
              <TableHead> Quyền </TableHead>
              <TableHead> Tài nguyên quản lý </TableHead>
              <TableHead className='flex items-center gap-2'>
                <div className="p-2 bg-purple-50 text-purple-600 rounded-md">
                  <Wrench className="h-4 w-4" />
                </div>
                Cấp bậc
              </TableHead>
              <TableHead className="text-right">Hành động</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredAdminRoles.map((role) => (
              <TableRow key={role.admin_role_id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-purple-50 text-blue-600 rounded-md">
                      <ShieldUser className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="font-medium font-roboto">{role.role_name}</p>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-3">
                    {role.permissions && role.permissions.length > 0 ? (
                      <div className="font-medium font-roboto flex flex-col gap-2">{role.permissions?.map((p) => (
                        <Badge variant={"outline"} className='border border-gray-500' key={p.permission.permission_id}>
                          {p.permission.permission_name}
                        </Badge>
                      ))}</div>
                    ) : (
                      <p className='text-red-500'>Chưa được gán quyền</p>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-3">
                    {role.permissions && role.permissions.length > 0 ? (
                      <div className="font-medium font-roboto flex flex-wrap gap-2">
                        {getUniqueResourcesFromRole(role).map((resourceName, index) => (
                          <Badge key={index} variant="outline" className="border border-green-500 text-green-600">
                            {resourceName}
                          </Badge>
                        ))}
                      </div>
                    ) : (
                      <p className='text-red-500'>Chưa được gán tài nguyên quản lý</p>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-3">
                    {role.level ? (
                      <Badge variant={"secondary"} className='border border-red-500 text-red-500 text-sm'>
                        {role.level}
                      </Badge>
                    ) : (
                      <p className='text-red-600'>Không lấy được cấp bậc</p>
                    )}
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
                        onClick={() => navigator.clipboard.writeText(role.admin_role_id)}>
                        Copy ID
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => setDetailDialog({ open: true, adminRole: role })}>
                        Cấu hình quyền
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setEditDialog({ open: true, adminRole: role })} >
                        Sửa thông tin
                      </DropdownMenuItem>
                      <DropdownMenuItem className="text-red-600" onClick={() => handleDeleteAdminRole(role.admin_role_id)}>
                        Xóa vai trò
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Dialog open={editDialog.open} onOpenChange={(open) => setEditDialog(s => ({ ...s, open }))}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Sửa vai trò</DialogTitle>
          </DialogHeader>
          {editDialog.adminRole && (
            <EditAdminRoleForm
              open={editDialog.open}
              onOpenChange={(open) => setEditDialog(s => ({ ...s, open }))}
              adminRole={editDialog.adminRole}
              onSuccess={() => {
                fetchAdminRoles();
                setEditDialog({ open: false, adminRole: null });
              }}
            />
          )}
        </DialogContent>
      </Dialog>

      {detailDialog.adminRole && (
        <AdminRoleDetailDialog
          open={detailDialog.open}
          onOpenChange={(open) => setDetailDialog(s => ({ ...s, open }))}
          adminRole={detailDialog.adminRole}
        />
      )}
    </div>
  );
}
