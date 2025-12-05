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
  Layers
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
import { ResourceTypeData } from "@/type/administrator.type";
import { CreateResourceTypeForm } from "@/components/CreateResourceTypeForm";
import { EditResourceTypeForm } from "@/components/EditResourceTypeForm";
import { ResourceTypeDetailDialog } from "@/components/ResourceTypeDetailDialog";
import { Spinner } from "@/components/ui/spinner";
import { ToasterConfirm } from "@/components/ToasterConfimer";

export default function ResourceTypesPage() {
  const [resourceTypes, setResourceTypes] = useState<ResourceTypeData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [open, setOpen] = useState(false);
  const [editDialog, setEditDialog] = useState<{ open: boolean; resourceType: ResourceTypeData | null }>({
    open: false,
    resourceType: null
  });
  const [detailDialog, setDetailDialog] = useState<{ open: boolean; resourceType: ResourceTypeData | null }>({
    open: false,
    resourceType: null
  });  useEffect(() => {
    fetchResourceTypes();
  }, []);

  const fetchResourceTypes = async () => {
    try {
      setIsLoading(true);
      const response = await api.get("/resource-types");
      const apiData = response.data;
      if (apiData.success && Array.isArray(apiData.data)) {
        setResourceTypes(apiData.data);
        toast.success(`Đã tải ${apiData.data.length} loại tài nguyên`);
      } else if (Array.isArray(apiData)) {
        setResourceTypes(apiData);
        toast.success(`Đã tải ${apiData.length} loại tài nguyên`);
      } else {
        throw new Error("Dữ liệu API không đúng định dạng");
      }
    } catch (error) {
      console.error("Lỗi khi tải danh sách loại tài nguyên:", error);
      if (isAxiosError(error)) {
        toast.error(error.response?.data?.message || "Lỗi khi tải loại tài nguyên");
      } else {
        toast.error("Lỗi không xác định");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteResourceType = async (resourceId: string) => {
    ToasterConfirm({
      title: "Xóa loại tài nguyên",
      description: "Hành động này không thể hoàn tác. Bạn chắc chắn muốn xóa loại tài nguyên này?",
      confirmText: "Xóa",
      cancelText: "Hủy",
      onConfirm: async () => {
        try {
          const res = await api.delete(`/resource-types/${resourceId}`);
          if (!res.data.success && res.status !== 204) throw new Error(res.data.message);
          setResourceTypes(prev => prev.filter(r => r.resource_id !== resourceId));
          toast.success("Đã xóa loại tài nguyên thành công");
        } catch (err) {
          console.error(err);
          if (isAxiosError(err)) {
            toast.error(err.response?.data?.message || "Không thể xóa loại tài nguyên");
          } else {
            toast.error("Không thể xóa loại tài nguyên");
          }
        }
      },
    });
  };

  const filteredResourceTypes = resourceTypes.filter((resourceType) =>
    resourceType.resource_name.toLowerCase().includes(searchTerm.toLowerCase()) 
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
          <h1 className="text-3xl font-bold font-roboto-bold self-center">Quản lý loại tài nguyên</h1>
          <p className="text-blue-600 mt-1  font-roboto-condensed-bold">Tổng số: {resourceTypes.length} loại tài nguyên</p>
        </div>
      </div>

      <div className="flex gap-4 items-center">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Tìm kiếm theo tên loại tài nguyên..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={fetchResourceTypes}
            className='cursor-pointer hover:bg-gray-300'
          >
            <RefreshCcw className="mr-2 h-4 w-4" /> Reload
          </Button>
          
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button className="cursor-pointer">
                <Plus className="mr-2 h-4 w-4" />
                Thêm loại tài nguyên
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle className="flex justify-center pb-5">Tạo loại tài nguyên mới</DialogTitle>
              </DialogHeader>
              <CreateResourceTypeForm onSuccess={() => {
                fetchResourceTypes();
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
              <TableHead>Tên loại tài nguyên</TableHead>
              <TableHead className="text-right">Hành động</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredResourceTypes.map((resourceType) => (
              <TableRow key={resourceType.resource_id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-green-50 text-green-600 rounded-md">
                      <Layers className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="font-medium font-roboto">{resourceType.resource_name}</p>
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
                      <DropdownMenuItem
                        onClick={() => navigator.clipboard.writeText(resourceType.resource_id)}
                      >
                        Copy ID
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => setDetailDialog({ open: true, resourceType: resourceType })}
                      >
                        Xem chi tiết
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => setEditDialog({ open: true, resourceType: resourceType })}
                      >
                        Chỉnh sửa
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="text-red-600"
                        onClick={() => handleDeleteResourceType(resourceType.resource_id)}
                      >
                        Xóa loại tài nguyên
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
            <DialogTitle>Sửa loại tài nguyên</DialogTitle>
          </DialogHeader>
          {editDialog.resourceType && (
            <EditResourceTypeForm
              open={editDialog.open}
              onOpenChange={(open) => setEditDialog(s => ({ ...s, open }))}
              resourceType={editDialog.resourceType}
              onSuccess={() => {
                fetchResourceTypes();
                setEditDialog({ open: false, resourceType: null });
              }}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Detail Dialog */}
      {detailDialog.resourceType && (
        <ResourceTypeDetailDialog
          open={detailDialog.open}
          onOpenChange={(open) => setDetailDialog(s => ({ ...s, open }))}
          resourceType={detailDialog.resourceType}
        />
      )}
    </div>
  );
}
