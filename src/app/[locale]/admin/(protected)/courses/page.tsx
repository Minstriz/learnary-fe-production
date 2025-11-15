"use client";

import React, { useState, useEffect } from "react";
import api from "@/app/lib/axios";
import { isAxiosError } from "axios";
import {
  ColumnDef,
  ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
  VisibilityState,
} from "@tanstack/react-table"
import { ArrowUpDown, ChevronDown, MoreHorizontal, Plus, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { toast } from "react-hot-toast" // Giữ nguyên react-hot-toast như file gốc

type Course = {
  courses_id: string;
  category_id: string;
  level_id: string;
  instructor_id: string;
  status: "Draft" | "Published" | "Archived";
  title: string;
  slug: string;
  description: string;
  thumbnail: string;
  price: number;
  sale_off: boolean;
  hot: boolean;
  tag: boolean;
  requirement: string;
  available_language: "Vietnamese" | "English";
  created_at: string;
  updated_at: string;
}

const columns: ColumnDef<Course>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "title",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Tên khóa học
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
      const course = row.original
      return (
        <div className="space-y-1">
          <div className="font-medium">{row.getValue("title")}</div>
          <div className="text-xs text-muted-foreground">{course.slug}</div>
        </div>
      )
    },
  },
  {
    accessorKey: "instructor_id",
    header: "Giảng viên",
    cell: ({ row }) => {
      const instructorId = row.getValue("instructor_id") as string
      // Trong thực tế, bạn sẽ fetch thông tin instructor từ API
      const instructorNames: { [key: string]: string } = {
        "inst_001": "Nguyễn Văn A",
        "inst_002": "Trần Thị B",
        "inst_003": "Lê Văn C",
        "inst_004": "Phạm Thị D",
        "inst_005": "Hoàng Văn E"
      }
      return <div>{instructorNames[instructorId] || instructorId}</div>
    },
  },
  {
    accessorKey: "status",
    header: "Trạng thái",
    cell: ({ row }) => {
      const status = row.getValue("status") as string
      const statusColors = {
        Published: "bg-green-100 text-green-800",
        Archived: "bg-red-100 text-red-800",
        Draft: "bg-yellow-100 text-yellow-800"
      }
      const statusLabels = {
        Published: "Đã xuất bản",
        Archived: "Đã lưu trữ",
        Draft: "Bản nháp"
      }

      return (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[status as keyof typeof statusColors]}`}>
	        {statusLabels[status as keyof typeof statusLabels]}
        </span>
      )
    },
  },
  {
    accessorKey: "available_language",
    header: "Ngôn ngữ",
    cell: ({ row }) => {
      const language = row.getValue("available_language") as string
      const languageLabels = {
        Vietnamese: "Tiếng Việt",
        English: "Tiếng Anh"
      }
      return <div>{languageLabels[language as keyof typeof languageLabels]}</div>
    },
  },
  {
    accessorKey: "price",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Giá
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
      const course = row.original
      const price = parseFloat(row.getValue("price"))
      const formatted = new Intl.NumberFormat("vi-VN", {
        style: "currency",
        currency: "VND",
      }).format(price)

      return (
        <div className="text-right space-y-1">
          <div className="font-medium">{formatted}</div>
          {course.sale_off && (
            <div className="text-xs text-green-600 font-medium">Đang giảm giá</div>
          )}
        </div>
      )
    },
  },
  {
    id: "badges",
    header: "Nhãn",
    cell: ({ row }) => {
      const course = row.original
      return (
        <div className="flex gap-1 flex-wrap">
          {course.hot && (
            <span className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full">
              Hot
            </span>
          )}
          {course.tag && (
            <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
              Tag
            </span>
          )}
        </div>
      )
    },
  },
  {
    id: "actions",
    enableHiding: false,
    cell: ({ row }) => {
      const course = row.original

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Hành động</DropdownMenuLabel>
            <DropdownMenuItem
              onClick={() => navigator.clipboard.writeText(course.courses_id)}
            >
              Copy ID
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Xem chi tiết</DropdownMenuItem>
            <DropdownMenuItem>Chỉnh sửa</DropdownMenuItem>
            <DropdownMenuItem className="text-red-600">
              Xóa khóa học
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    },
  },
]

function CoursePage() {
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
  const [rowSelection, setRowSelection] = useState({})
  const [courses, setCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchCourses = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await api.get("/api/courses")
      const apiData = response.data

      if (apiData.success && Array.isArray(apiData.data)) {
        setCourses(apiData.data)
        toast.success(`Đã tải ${apiData.data.length} khóa học`)
      } else if (Array.isArray(apiData)) {
        setCourses(apiData)
        toast.success(`Đã tải ${apiData.length} khóa học`)
      } else {
        throw new Error("Dữ liệu API không đúng định dạng")
      }
    } catch (error) {
      console.error("Lỗi khi fetch courses:", error)
      if (isAxiosError(error)) {
        const errorMsg = error.response?.data?.message || "Lỗi khi tải khóa học, vui lòng thử lại";
        setError(errorMsg);
        toast.error(errorMsg);
      } else {
        const genericError = "Lỗi không xác định, vui lòng thử lại";
        setError(genericError);
        toast.error(genericError);
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCourses()
  }, [])

  const table = useReactTable({
    data: courses,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
  })

  const LoadingSkeleton = () => (
    <div className="space-y-4">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="flex items-center space-x-4">
          <Skeleton className="h-4 w-4" />
          <Skeleton className="h-4 w-[250px]" />
          <Skeleton className="h-4 w-[150px]" />
          <Skeleton className="h-4 w-[100px]" />
          <Skeleton className="h-4 w-[80px]" />
          <Skeleton className="h-4 w-[120px]" />
          <Skeleton className="h-4 w-[60px]" />
        </div>
      ))}
    </div>
  )

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex flex-col">
            <div className="flex items-center justify-between">
              <div className="flex gap-2 justify-start w-full pb-2">
                <Button
                  variant="outline"
                  className="cursor-pointer"
                  onClick={fetchCourses}
                  disabled={loading}
                >
                  <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                  Làm mới
                </Button>
                <Button className="cursor-pointer">
                  <Plus className="mr-2 h-4 w-4" />
                  Thêm khóa học
                </Button>
              </div>
            </div>
          </div>
          <CardDescription className="pl-2">
            {loading ? "Đang tải..." : `Tổng cộng ${courses.length} khóa học trong hệ thống`}
            {error && (
              <span className="text-red-500 ml-2">({error})</span>
            )}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center py-4">
          	<div className="flex w-full justify-start gap-5">
              <CardTitle>Danh sách khoá học</CardTitle>
              <Input
                placeholder="Tìm kiếm khóa học..."
                value={(table.getColumn("title")?.getFilterValue() as string) ?? ""}
                onChange={(event) =>
                  table.getColumn("title")?.setFilterValue(event.target.value)
                }
                className="max-w-sm"
              />
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="ml-auto cursor-pointer">
                  Cột hiển thị <ChevronDown className="ml-2 h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {table
                  .getAllColumns()
                	.filter((column) => column.getCanHide())
                  .map((column) => {
                    return (
                      <DropdownMenuCheckboxItem
                        key={column.id}
                      	className="capitalize"
                        checked={column.getIsVisible()}
                        onCheckedChange={(value) =>
                          column.toggleVisibility(!!value)
                        }
                      >
                        {column.id}
                      </DropdownMenuCheckboxItem>
                    )
                  })}
              </DropdownMenuContent>
          	</DropdownMenu>
          </div>
          <div className="rounded-md border">
            {loading ? (
              <div className="p-4">
                <LoadingSkeleton />
              </div>
            ) : (
              <Table>
                <TableHeader>
                  {table.getHeaderGroups().map((headerGroup) => (
                    <TableRow key={headerGroup.id}>
                      {headerGroup.headers.map((header) => {
                        return (
                          <TableHead key={header.id}>
                            {header.isPlaceholder
                              ? null
                              : flexRender(
                                header.column.columnDef.header,
                                header.getContext()
                              )}
                          </TableHead>
                        )
                      })}
                    </TableRow>
                  ))}
                </TableHeader>
                <TableBody>
                  {table.getRowModel().rows?.length ? (
                    table.getRowModel().rows.map((row) => (
                      <TableRow
                        key={row.id}
                         data-state={row.getIsSelected() && "selected"}
                      >
                        {row.getVisibleCells().map((cell) => (
  	                      <TableCell key={cell.id}>
                            {flexRender(
                              cell.column.columnDef.cell,
                              cell.getContext()
                            )}
                          </TableCell>
                        ))}
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell
                        colSpan={columns.length}
                        className="h-24 text-center"
                      >
                        {error ? "Không thể tải dữ liệu" : "Không có khóa học nào"}
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            )}
          </div>
          {!loading && (
            <div className="flex items-center justify-end space-x-2 py-4">
              <div className="flex-1 text-sm text-muted-foreground">
                {table.getFilteredSelectedRowModel().rows.length} trong{" "}
                {table.getFilteredRowModel().rows.length} hàng được chọn.
              </div>
              <div className="space-x-2">
              	<Button
                  variant="outline"
                  size="sm"
                  onClick={() => table.previousPage()}
                  disabled={!table.getCanPreviousPage()}
            	  >
                  Trước
                </Button>
              	<Button
                  variant="outline"
                  size="sm"
                  onClick={() => table.nextPage()}
                  disabled={!table.getCanNextPage()}
                >
                  Sau
            	  </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default CoursePage;