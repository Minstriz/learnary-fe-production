"use client";
import React from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import api from "@/app/lib/axios";
import { toast } from "sonner";
import { AdminRole } from "@/type/administrator.type";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
type EditAdminRoleFormProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  adminRole: AdminRole;
  onSuccess?: () => void;
};

const schema = z.object({
  role_name: z.string().min(2, "Tên vai trò phải có ít nhất 2 ký tự"),
  level: z.number().min(1, "Cấp bậc cao nhất phải từ 1 trở lên").max(10, "Cấp bậc thấp nhất từ 10 trở xuống")
});

type FormValues = z.infer<typeof schema>;

export function EditAdminRoleForm({ onOpenChange, adminRole, onSuccess }: EditAdminRoleFormProps) {
  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      role_name: adminRole.role_name,
      level: adminRole.level
    },
  });

  React.useEffect(() => {
    form.reset({ role_name: adminRole.role_name, level: adminRole.level });
  }, [adminRole, form]);

  const onSubmit = async (values: FormValues) => {
    try {
      await api.put(`/admin-roles/${adminRole.admin_role_id}`, {
        role_name: values.role_name,
        level: values.level
      });
      toast.success("Cập nhật vai trò thành công");
      onOpenChange(false);
      if (onSuccess) onSuccess();
    } catch (err) {
      console.log(err);
      toast.error("Cập nhật thất bại");
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="role_name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tên vai trò</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="level"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Cấp bậc</FormLabel>
              <FormControl>
                <Select value={field.value?.toString()} onValueChange={(value) => field.onChange(Number(value))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn cấp bậc"></SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectLabel>Cấp bậc</SelectLabel>
                      <SelectItem value="1">1</SelectItem>
                      <SelectItem value="2">2</SelectItem>
                      <SelectItem value="3">3</SelectItem>
                      <SelectItem value="4">4</SelectItem>
                      <SelectItem value="5">5</SelectItem>
                      <SelectItem value="6">6</SelectItem>
                      <SelectItem value="7">7</SelectItem>
                      <SelectItem value="8">8</SelectItem>
                      <SelectItem value="9">9</SelectItem>
                      <SelectItem value="10">10</SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </FormControl>
            </FormItem>
          )}
        />
        <div className="flex gap-2 justify-end">
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Hủy
          </Button>
          <Button type="submit" className="cursor-pointer">Lưu</Button>
        </div>
      </form>
    </Form>
  );
}
