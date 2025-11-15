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
import { apiFetch } from '@/lib/api'
const categorySchema = z.object({
    category_name: z.string().min(3, "Tên danh mục phải có ít nhất 3 ký tự"),
    slug: z.string().min(0, "slug phải có ít nhất 5 ký tự")
})

type CategoryFormData = z.infer<typeof categorySchema>
export function CreateCategoryForm() {
    const userLoggedInToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6ImE2ZTAwODQ0LWFlZmMtNGQ1OS05ZTdjLTZkNTlmYzllNWM1ZiIsImVtYWlsIjoiYWRtaW5AZXhhbXBsZS5jb20iLCJyb2xlIjoiQURNSU4iLCJpYXQiOjE3NTk3MzI0ODEsImV4cCI6MTc1OTczNjA4MX0.UMRLZ2lX6ZoMvdrOioEHpPVG6z0x8i0odqnmlNEBPGE'
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
            const response = await apiFetch('/api/categories/create', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${userLoggedInToken}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(categoryData)
            })
            if (!response.ok) {
                toast.error("Tạo danh mục thất bại, vui lòng kiểm tra lại")
                throw new Error(`HTTP Error, status: ${response.status}`)
            } else {
                toast.success("Tạo danh mục thành công")
                form.reset()
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
                    {/* CATEGORY NAME */}
                    <FormField
                        control={form.control} /* liên kết input của field này với use form phía trên */
                        name="category_name"
                        render={({ field }) => ( /* render ra UI */
                            <FormItem className='flex flex-col gap-3'>
                                <FormLabel className='pl-2'>Tên danh mục</FormLabel>
                                <FormControl>
                                    <Input placeholder="Tên danh mục" className='w-full' {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    {/* Slug */}
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
