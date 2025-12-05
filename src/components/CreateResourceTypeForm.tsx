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

const resourceTypeSchema = z.object({
    resource_name: z.string().min(2, "Tên loại tài nguyên phải có ít nhất 2 ký tự"),
})

type CreateResourceTypeFormProps = {
  onSuccess?: () => void;
};

type ResourceTypeFormData = z.infer<typeof resourceTypeSchema>

export function CreateResourceTypeForm({onSuccess}: CreateResourceTypeFormProps) {
    const [isLoading, setIsLoading] = useState(false)
    const form = useForm<ResourceTypeFormData>({
        resolver: zodResolver(resourceTypeSchema),
        defaultValues: {
            resource_name: "",
        }
    })

    async function onSubmit(values: ResourceTypeFormData) {
        try {
            setIsLoading(true)
            const response = await api.post("/resource-types", {
                resource_name: values.resource_name,
            })
            if (!response) {
                toast.error("Tạo loại tài nguyên thất bại, vui lòng kiểm tra lại")
                throw new Error(`HTTP Error, status: ${response}`)
            } else {
                toast.success("Tạo loại tài nguyên thành công")
                form.reset()
                if(onSuccess) onSuccess();
            }
        } catch (error) {
            console.error('Error creating resource type', error)
            toast.error("Có lỗi xảy ra khi tạo loại tài nguyên. Vui lòng thử lại!")
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
                        name="resource_name"
                        render={({ field }) => ( 
                            <FormItem className='flex flex-col gap-3'>
                                <FormLabel className='pl-2'>Tên loại tài nguyên</FormLabel>
                                <FormControl>
                                    <Input placeholder="VD: COURSE, USER, TRANSACTION..." className='w-full' {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>
                <div className="flex justify-left">
                    <Button type="submit" className="w-[200px] cursor-pointer" disabled={isLoading}>
                        {isLoading ? "Đang tạo..." : "Tạo loại tài nguyên"}
                    </Button>
                </div>
            </form>
        </Form>
    )
}
