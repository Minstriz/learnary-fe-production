"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { useState } from "react"
import { toast } from "sonner"
import { apiFetch } from '@/lib/api'
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
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"

// --- Schema của form ---
const courseSchema = z.object({
    title: z.string().min(3, "Tên khóa học tối thiểu 3 ký tự"),
    slug: z.string().min(3, "Slug không hợp lệ").toLowerCase(),
    description: z.string().min(10, "Mô tả tối thiểu 10 ký tự"),
    thumbnail: z.string().url("Phải là URL hợp lệ"),
    price: z.coerce.number().min(0, "Giá phải >= 0"),
    category_id: z.string().uuid("Category không hợp lệ"),
    level_id: z.string().uuid("Level không hợp lệ"),
    instructor_id: z.string().uuid("Instructor không hợp lệ"),
    status: z.enum(["Draft", "Published", "Archived"]),
    sale_off: z.boolean(),
    hot: z.boolean(),
    tag: z.boolean(),
    requirement: z.string().optional(),
    available_language: z.enum(["Vietnamese", "English"]),
})

type CourseFormData = z.infer<typeof courseSchema>

export function CreateCourseForm() {
    const [isLoading, setIsLoading] = useState(false)

    const form = useForm<CourseFormData>({
        resolver: zodResolver(courseSchema),
        defaultValues: {
            title: "",
            slug: "",
            description: "",
            thumbnail: "",
            price: 0,
            category_id: "",
            level_id: "",
            instructor_id: "",
            status: "Draft",
            sale_off: false,
            hot: false,
            tag: false,
            requirement: "",
            available_language: "Vietnamese",
        },
    })

    async function onSubmit(values: CourseFormData) {
        try {
            setIsLoading(true)
            const courseData = {
                ...values,
                price: Number(values.price),
                slug: values.slug.toLowerCase().replace(/\s+/g, '-'),
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
            }
            toast("")
            console.log("Submitting course data:", courseData)
            const response = await apiFetch('/api/courses', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(courseData),
            })
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`)
            }
            const result = await response.json()
            toast.success("Khóa học đã được tạo thành công!")
            console.log("Course created successfully:", result)
            form.reset()
            // TODO: Redirect to courses list or course detail page
            //router.push('/courses') or router.push(`/courses/${result.id}`)

        } catch (error) {
            console.error('Error creating course:', error)
            toast.error("Có lỗi xảy ra khi tạo khóa học. Vui lòng thử lại!")
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="flex space-x-7 w-full ">
                    {/* Title */}
                    <FormField
                        control={form.control}
                        name="title"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Tiêu đề khóa học</FormLabel>
                                <FormControl><Input placeholder="Tên khoá học" {...field} /></FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    {/* Slug */}
                    <FormField
                        control={form.control}
                        name="slug"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Slug</FormLabel>
                                <FormControl><Input placeholder="react-tu-a-den-z" {...field} /></FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                {/* Description */}
                <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Mô tả khóa học</FormLabel>
                            <FormControl><Textarea placeholder="Giới thiệu chi tiết..." {...field} /></FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                {/* Thumbnail */}
                <FormField
                    control={form.control}
                    name="thumbnail"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Ảnh Thumbnail (URL)</FormLabel>
                            <FormControl><Input placeholder="https://..." {...field} /></FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                {/* Price */}
                <FormField
                    control={form.control}
                    name="price"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Giá khóa học</FormLabel>
                            <FormControl><Input type="number" step="0.01" placeholder="0.00" {...field} /></FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                {/* Category */}
                <FormField
                    control={form.control}
                    name="category_id"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Danh mục</FormLabel>
                            <FormControl><Input placeholder="Nhập ID danh mục hoặc chọn" {...field} /></FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                {/* Level */}
                <FormField
                    control={form.control}
                    name="level_id"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Cấp độ</FormLabel>
                            <FormControl><Input placeholder="Nhập ID level hoặc chọn" {...field} /></FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                {/* Instructor */}
                <FormField
                    control={form.control}
                    name="instructor_id"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Giảng viên</FormLabel>
                            <FormControl><Input placeholder="Instructor ID" {...field} /></FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                {/* Status */}
                <FormField
                    control={form.control}
                    name="status"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Trạng thái</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Chọn trạng thái" />
                                    </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    <SelectItem value="Draft">Draft</SelectItem>
                                    <SelectItem value="Published">Published</SelectItem>
                                    <SelectItem value="Archived">Archived</SelectItem>
                                </SelectContent>
                            </Select>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                {/* Boolean fields */}
                <div className="grid grid-cols-3 gap-4">
                    <FormField control={form.control} name="sale_off" render={({ field }) => (
                        <FormItem className="flex items-center justify-between">
                            <FormLabel>Sale off</FormLabel>
                            <FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                        </FormItem>
                    )} />
                    <FormField control={form.control} name="hot" render={({ field }) => (
                        <FormItem className="flex items-center justify-between">
                            <FormLabel>Hot</FormLabel>
                            <FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                        </FormItem>
                    )} />
                    <FormField control={form.control} name="tag" render={({ field }) => (
                        <FormItem className="flex items-center justify-between">
                            <FormLabel>Tag</FormLabel>
                            <FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                        </FormItem>
                    )} />
                </div>

                {/* Requirement */}
                <FormField
                    control={form.control}
                    name="requirement"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Yêu cầu đầu vào</FormLabel>
                            <FormControl><Textarea placeholder="VD: Biết JavaScript cơ bản..." {...field} /></FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                {/* Language */}
                <FormField
                    control={form.control}
                    name="available_language"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Ngôn ngữ</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Chọn ngôn ngữ" />
                                    </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    <SelectItem value="Vietnamese">Vietnamese</SelectItem>
                                    <SelectItem value="English">English</SelectItem>
                                </SelectContent>
                            </Select>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? "Đang tạo..." : "Tạo khóa học"}
                </Button>
            </form>
        </Form>
    )
}
