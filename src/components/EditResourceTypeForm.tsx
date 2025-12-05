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
import { ResourceTypeData } from "@/type/administrator.type";

type EditResourceTypeFormProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  resourceType: ResourceTypeData;
  onSuccess?: () => void;
};

const schema = z.object({
  resource_name: z.string().min(2, "Tên loại tài nguyên phải có ít nhất 2 ký tự"),
});

type FormValues = z.infer<typeof schema>;

export function EditResourceTypeForm({ onOpenChange, resourceType, onSuccess }: EditResourceTypeFormProps) {
  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { resource_name: resourceType.resource_name },
  });

  React.useEffect(() => {
    form.reset({ resource_name: resourceType.resource_name });
  }, [resourceType, form]);

  const onSubmit = async (values: FormValues) => {
    try {
      await api.put(`/resource-types/${resourceType.resource_id}`, {
        resource_name: values.resource_name,
      });
      toast.success("Cập nhật loại tài nguyên thành công");
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
          name="resource_name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tên loại tài nguyên</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
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
