"use client"
import React, { useEffect, useState } from 'react'
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
import { slugify } from "@/utils/utils"
import api from "@/app/lib/axios";
const categorySchema = z.object({
    category_name: z.string().min(3, "Tên danh mục phải có ít nhất 3 ký tự"),
    slug: z.string().min(0, "slug phải có ít nhất 5 ký tự")
})
type CreateCategoryFormProps = {
  onSuccess?: () => void;
};
type CategoryFormData = z.infer<typeof categorySchema>
export function CreateCategoryForm({onSuccess}: CreateCategoryFormProps) {
    const [isLoading, setIsLoading] = useState(false)
    const form = useForm<CategoryFormData>({
        resolver: zodResolver(categorySchema),
        defaultValues: {
            category_name: "",
            slug: "",
        }
    })
    const categoryName = form.watch("category_name")

    useEffect(() => {
        const newSlug = slugify(categoryName)
        form.setValue("slug", newSlug, { shouldValidate: true })
    }, [categoryName, form])

    async function onSubmit(values: CategoryFormData) {
        try {
            setIsLoading(true)
            const categoryData = {
                ...values,
            }
            const response = await api.post("/categories/create", {
                category_name:categoryData.category_name,
                slug:categoryData.slug,
            })
            if (!response) {
                toast.error("Tạo danh mục thất bại, vui lòng kiểm tra lại")
                throw new Error(`HTTP Error, status: ${response}`)
            } else {
                toast.success("Tạo danh mục thành công")
                form.reset()
                if(onSuccess) onSuccess();
            }
        } catch (error) {
            console.error('Error creating course', error)
            toast.error("Có lỗi xảy ra khi tạo danh mục. Vui lòng thử lại!")
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
                        name="category_name"
                        render={({ field }) => ( 
                            <FormItem className='flex flex-col gap-3'>
                                <FormLabel className='pl-2'>Tên danh mục</FormLabel>
                                <FormControl>
                                    <Input placeholder="Tên danh mục" className='w-full' {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="slug"
                        render={({ field }) => (
                            <FormItem className='flex flex-col gap-3'>
                                <FormLabel className='pl-2'>Slug</FormLabel>
                                <FormControl><Input className='w-full' placeholder="Slug danh mục được tạo tự động" disabled {...field} /></FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>
                <div className="flex justify-left">
                    <Button type="submit" className="w-[150px] cursor-pointer" disabled={isLoading}>
                        {isLoading ? "Đang tạo..." : "Tạo danh mục"}
                    </Button>
                </div>
            </form>

        </Form>
    )
}
