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

type EditLevelFormProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    level: { level_id: string; level_name: string };
    onSuccess?: () => void;
};

const schema = z.object({
    level_name: z.string().min(2, "Tên cấp độ phải có ít nhất 2 ký tự"),
});

type FormValues = z.infer<typeof schema>;

export function EditLevelForm({  onOpenChange, level, onSuccess }: EditLevelFormProps) {
    const form = useForm<FormValues>({
        resolver: zodResolver(schema),
        defaultValues: { level_name: level.level_name },
    });

    React.useEffect(() => {
        form.reset({ level_name: level.level_name });
    }, [level, form]);

    const onSubmit = async (values: FormValues) => {
        try {
            await api.put(`/levels/update/${level.level_id}`, { level_name: values.level_name });
            toast.success("Cập nhật cấp độ thành công");
            onOpenChange(false);
            if (onSuccess) onSuccess();
        } catch (err) {
            console.log(err)
            toast.error("Cập nhật thất bại");
        }
    };

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                    control={form.control}
                    name="level_name"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Tên cấp độ</FormLabel>
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
