"use client";
import React, { useState, useEffect } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import api from "@/app/lib/axios";
import { toast } from "sonner";
import { Admin, AdminRole } from "@/type/administrator.type";
import { isAxiosError } from "axios";

type EditAdminAccountFormProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  admin: Admin;
  onSuccess?: () => void;
};

const schema = z.object({
  admin_role_id: z.string().min(1, "Vui lòng chọn vai trò quản trị"),
});

type FormValues = z.infer<typeof schema>;

export function EditAdminAccountForm({
  onOpenChange,
  admin,
  onSuccess,
}: EditAdminAccountFormProps) {
  const [adminRoles, setAdminRoles] = useState<AdminRole[]>([]);
  const [isLoadingRoles, setIsLoadingRoles] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      admin_role_id: admin.admin_role_id,
    },
  });

  useEffect(() => {
    const fetchAdminRoles = async () => {
      try {
        setIsLoadingRoles(true);
        const response = await api.get("/admin-roles");
        const apiData = response.data;
        const roles = apiData.success ? apiData.data : apiData;
        setAdminRoles(roles);
      } catch (error) {
        console.error("Error fetching admin roles:", error);
        if (isAxiosError(error)) {
          toast.error(error.response?.data?.message || "Lỗi khi tải danh sách vai trò");
        } else {
          toast.error("Không thể tải danh sách vai trò");
        }
      } finally {
        setIsLoadingRoles(false);
      }
    };

    fetchAdminRoles();
  }, []);

  useEffect(() => {
    form.reset({ admin_role_id: admin.admin_role_id });
  }, [admin, form]);

  const onSubmit = async (values: FormValues) => {
    try {
      setIsSubmitting(true);
      await api.put(`/admins/${admin.admin_id}`, {
        admin_role_id: values.admin_role_id,
      });
      toast.success("Cập nhật vai trò quản trị thành công");
      onOpenChange(false);
      if (onSuccess) onSuccess();
    } catch (err) {
      console.error(err);
      if (isAxiosError(err)) {
        toast.error(err.response?.data?.message || "Cập nhật thất bại");
      } else {
        toast.error("Cập nhật thất bại");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="space-y-4">
          <div className="p-4 bg-gray-50 rounded-lg">
            <h3 className="text-sm font-medium text-gray-700 mb-2">Thông tin tài khoản</h3>
            <div className="space-y-1 text-sm">
              <p><span className="font-medium">Tên:</span> {admin.user?.fullName || 'N/A'}</p>
              <p><span className="font-medium">Email:</span> {admin.user?.email || 'N/A'}</p>
              <p><span className="font-medium">Vai trò hiện tại:</span> {admin.adminRole?.role_name || 'N/A'}</p>
            </div>
          </div>

          <FormField
            control={form.control}
            name="admin_role_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Vai trò quản trị mới</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  disabled={isLoadingRoles}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder={isLoadingRoles ? "Đang tải..." : "Chọn vai trò quản trị"} />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {adminRoles.map((role) => (
                      <SelectItem key={role.admin_role_id} value={role.admin_role_id}>
                        {role.role_name} (Cấp {role.level})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="flex gap-2 justify-end">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
          >
            Hủy
          </Button>
          <Button
            type="submit"
            className="cursor-pointer"
            disabled={isSubmitting || isLoadingRoles}
          >
            {isSubmitting ? "Đang cập nhật..." : "Cập nhật vai trò"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
