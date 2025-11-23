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

const levelSchema = z.object({
    level_name: z.string().min(2, "Tên cấp độ phải có ít nhất 2 ký tự"),
    order_index: z.number().int().min(0, "Thứ tự phải là số nguyên không âm")
})

type CreateLevelFormProps = {
  onSuccess?: () => void;
};

type LevelFormData = z.infer<typeof levelSchema>

export function CreateLevelForm({onSuccess}: CreateLevelFormProps) {
    const [isLoading, setIsLoading] = useState(false)
    const form = useForm<LevelFormData>({
        resolver: zodResolver(levelSchema),
        defaultValues: {
            level_name: "",
            order_index: 0,
        }
    })

    async function onSubmit(values: LevelFormData) {
        try {
            setIsLoading(true)
            const response = await api.post("/levels", {
                level_name: values.level_name,
                order_index: values.order_index,
            })
            if (!response) {
                toast.error("Tạo cấp độ thất bại, vui lòng kiểm tra lại")
                throw new Error(`HTTP Error, status: ${response}`)
            } else {
                toast.success("Tạo cấp độ thành công")
                form.reset()
                if(onSuccess) onSuccess();
            }
        } catch (error) {
            console.error('Error creating level', error)
            toast.error("Có lỗi xảy ra khi tạo cấp độ. Vui lòng thử lại!")
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
                        name="level_name"
                        render={({ field }) => ( 
                            <FormItem className='flex flex-col gap-3'>
                                <FormLabel className='pl-2'>Tên cấp độ</FormLabel>
                                <FormControl>
                                    <Input placeholder="Ví dụ: Beginner, Intermediate, Advanced" className='w-full' {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="order_index"
                        render={({ field }) => (
                            <FormItem className='flex flex-col gap-3'>
                                <FormLabel className='pl-2'>Cấp độ</FormLabel>
                                <FormControl>
                                    <Input 
                                        type="number" 
                                        className='w-full' 
                                        placeholder="0" 
                                        {...field}
                                        onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>
                <div className="flex justify-left">
                    <Button type="submit" className="w-[150px] cursor-pointer" disabled={isLoading}>
                        {isLoading ? "Đang tạo..." : "Tạo cấp độ"}
                    </Button>
                </div>
            </form>
        </Form>
    )
}
