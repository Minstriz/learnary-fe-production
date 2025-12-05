"use client"
import React, { useState } from 'react'
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import api from "@/app/lib/axios";


const adminRoleSchema = z.object({
    role_name: z.string()
        .min(3, "Tên vai trò phải có ít nhất 3 ký tự")
        .max(255, "Tên vai trò không được quá 255 ký tự"),
    level: z.number()
        .min(1, "Level phải từ 1 đến 10, trong đó 1 là cấp cao nhất")
        .max(10, "Level phải từ 1 đến 10, trong đó 10 là cấp thấp nhất")
        .int("Level phải là số nguyên"),
    description: z.string().optional(),
});

type CreateAdminRoleFormProps = {
    onSuccess?: () => void;
};

type AdminRoleFormData = z.infer<typeof adminRoleSchema>

export function CreateAdminRoleForm({ onSuccess }: CreateAdminRoleFormProps) {
    const [isLoading, setIsLoading] = useState(false)
    const form = useForm<AdminRoleFormData>({
        resolver: zodResolver(adminRoleSchema),
        defaultValues: {
            role_name: "",
            level: 0,
        }
    })

    async function onSubmit(values: AdminRoleFormData) {
        try {
            setIsLoading(true)
            const response = await api.post("/admin-roles", {
                role_name: values.role_name,
                level: values.level,
            })
            if (!response) {
                toast.error("Tạo vai trò thất bại, vui lòng kiểm tra lại")
                throw new Error(`HTTP Error, status: ${response}`)
            } else {
                toast.success("Tạo vai trò thành công")
                form.reset()
                if (onSuccess) onSuccess();
            }
        } catch (error) {
            console.error('Error creating admin role', error)
            toast.error("Có lỗi xảy ra khi tạo vai trò. Vui lòng thử lại!")
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-6'>
                <div className='flex space-x-7 w-full gap-7 flex-col '>
                    <FormField
                        control={form.control}
                        name="role_name"
                        render={({ field }) => (
                            <FormItem className='flex flex-col gap-3'>
                                <FormLabel className='pl-2'>Tên vai trò</FormLabel>
                                <FormControl>
                                    <Input placeholder="Tên vai trò" className='w-full' {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="level"
                        render={({ field }) => (
                            <FormItem className='flex flex-col gap-3'>
                                <FormLabel className='pl-2'>Cấp bậc quản trị (Cao nhất: 1 - Thấp nhất: 10)</FormLabel>
                                <FormControl>
                                    <Input
                                        type='number'
                                        placeholder="Cấp bậc (1-10)"
                                        className='w-full'
                                        {...field}
                                        onChange={(e) => field.onChange(e.target.valueAsNumber || 0)}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>
                <div className="flex justify-end w-full">
                    <Button type="submit" className="w-[150px] cursor-pointer self-end text-blue-600 border border-blue-600 bg-white hover:bg-blue-600 hover:text-white" disabled={isLoading}>
                        {isLoading ? "Đang tạo..." : "Tạo vai trò"}
                    </Button>
                </div>
            </form>
        </Form>
    )
}
