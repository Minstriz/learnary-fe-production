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
import { slugify } from "@/utils/utils";

type EditCategoryFormProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  category: { category_id: string; category_name: string; slug: string };
  onSuccess?: () => void;
};

const schema = z.object({
  category_name: z.string().min(2, "Tên danh mục phải có ít nhất 2 ký tự"),
  slug: z.string().min(1, "Slug không được để trống"),
});

type FormValues = z.infer<typeof schema>;

export function EditCategoryForm({  onOpenChange, category, onSuccess }: EditCategoryFormProps) {
  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { category_name: category.category_name, slug: category.slug },
  });

  React.useEffect(() => {
    form.reset({ category_name: category.category_name, slug: category.slug });
  }, [category, form]);

  React.useEffect(() => {
    const subscription = form.watch((values, { name }) => {
      if (name === 'category_name') {
        form.setValue('slug', slugify(values.category_name || ''), { shouldValidate: true });
      }
    });
    return () => subscription.unsubscribe();
  }, [form]);

  const onSubmit = async (values: FormValues) => {
    try {
      await api.put(`/categories/update/${category.category_id}`, {
        category_name: values.category_name,
        slug: values.slug,
      });
      toast.success("Cập nhật danh mục thành công");
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
          name="category_name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tên danh mục</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="slug"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Slug</FormLabel>
              <FormControl>
                <Input {...field} disabled className="bg-gray-50 text-gray-600" />
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
