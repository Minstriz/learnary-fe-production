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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { ArrowUpDown, ChevronDown, MoreHorizontal, Plus, RefreshCw, User } from "lucide-react"
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
import { toast } from "sonner"
import { CreateCategoryForm } from "@/components/CreateCategoryForm";
import { ToasterConfirm } from "@/components/ToasterConfimer";
import { z } from "zod";

export const UserSchema = z.object({
  user_id: z.string(),
  email: z.string().email(),
  fullName: z.string(),
  gender: z.enum(["MALE", "FEMALE", "OTHER"]),
  role: z.enum(["ADMIN", "INSTRUCTOR", "LEARNER"]),
  phone: z.union([z.string(), z.number()]).nullable(),
  avatar: z.string().url().nullable(),
  dateOfBirth: z.string().nullable(),
  address: z.string().nullable(),
  city: z.string().nullable(),
  country: z.string().nullable(),
  nation: z.string().nullable(),
  bio: z.string().nullable(),
  last_login: z.string().nullable(),
  isActive: z.boolean(),
});
type User = z.infer<typeof UserSchema>

function UserPages() {
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
  const [rowSelection, setRowSelection] = useState({})
  const [user, setUser] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [open, setOpen] = useState(false)

  const fetchUsers = async () => {
    try {
      setLoading(true)
      setError(null)

      const res = await api.get("/api/users");
      const apiData = res.data

      let parsedUsers: User[] = [];

      if (apiData.success && Array.isArray(apiData.data)) {
        parsedUsers = UserSchema.array().parse(apiData.data)
        toast.info(`Đã tải lên ${apiData.data.length} người dùng`)
      } else if (Array.isArray(apiData)) {
        parsedUsers = UserSchema.array().parse(apiData)
        toast.success(`Đã tải lên ${apiData.length} người dùng`)
      }
      else {
        throw new Error("Data from API is not formated")
      }
      setUser(parsedUsers);

    } catch (error) {
      console.error("Lỗi khi tải danh sách người dùng", error)

      if (isAxiosError(error)) {
        const errorMsg = error.response?.data?.message || "Lỗi khi tra cứu danh sách người dùng";
        setError(errorMsg);
        toast.error(errorMsg);
      } else if (error instanceof z.ZodError) {
        const zodError = "Dữ liệu người dùng nhận về không hợp lệ";
        setError(zodError);
        toast.error(zodError);
        console.error("Zod validation error:", error.issues);
      } else {
        const genericError = "Lỗi không xác định, vui lòng thử lại";
        setError(genericError);
        toast.error(genericError);
      }
    } finally {
      setLoading(false)
    }
  }
  const handleDeleteUser = async (user_id: string) => {
    ToasterConfirm({
      title: "Xoá người dùng",
      description: "Hành động này không thể hoàn tác. Bạn chắc chắn muốn xoá người dùng này?",
      confirmText: "Xoá người dùng này",
      cancelText: "Huỷ",
      onConfirm: async () => {
        try {
          const res = await api.delete(`/api/users/delete/${user_id}`)
          const apiData = res.data
          if (!apiData.success) throw new Error(apiData.message)
          setUser((prev) => prev.filter((c) => c.user_id !== user_id))
          toast.success("Đã xoá người dùng thành công")
        } catch (err) {
          console.log(err)
          if (isAxiosError(err)) {
            toast.error(err.response?.data?.message || "Không thể xoá người dùng");
          } else {
            toast.error("Không thể xoá người dùng, vui lòng thử lại");
          }
        }
      },
    })
  }
  const columns: ColumnDef<User>[] = [
    {
      id: "select",
      header: ({ table }) => (
        <Checkbox checked={
          table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && "indeterminate")
        }
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label='Select all'
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label='Select row'
        ></Checkbox>
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: "fullName",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Tên người dùng
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
      cell: ({ row }) => {
        const user = row.original
        return (
          <div>
            <div className="flex items-center justify-between w-full">
              <div className="space-y-1">
                <div className="font-medium">{user.fullName}</div>
              </div>
            </div>
          </div>
        )
      }
    },
    {
      accessorKey: "role",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Vai trò
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
         )
      },
      cell: ({ row }) => {
        const user = row.original
        return (
          <div className="flex items-center justify-between w-full">
            <div className="space-y-1">
              <div className="font-medium">{user.role}</div>
            </div>
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
                  onClick={() => navigator.clipboard.writeText(user.user_id)}
                >
                  Copy ID
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem>Xem chi tiết</DropdownMenuItem>
              	<DropdownMenuItem>Chỉnh sửa</DropdownMenuItem>
                <DropdownMenuItem className="text-red-600" onClick={() => handleDeleteUser(user.user_id)}>
                  Xóa người dùng
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )
      }
    }
  ]
  const table = useReactTable({
    data: user,
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
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-[120px]" />
          <Skeleton className="h-4 w-[60px]" />
        </div>
      ))}
    </div>
  )
  useEffect(() => {
    fetchUsers()
  }, [])

  return (
    <div className='space-y-6'>
      <Card>
        <CardHeader>
          <div className="flex flex-col">
            <div className="flex items-center justify-between">
              <div className="flex gap-2 justify-start w-full pb-2">
                <Button
                  variant="outline"
                  className="cursor-pointer"
                  onClick={fetchUsers}
                  disabled={loading}
              	>
                  <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                  Làm mới
                </Button>

                <Dialog open={open} onOpenChange={setOpen}>
                  <DialogTrigger asChild>
                     <Button className="cursor-pointer">
                        <Plus className="mr-2 h-4 w-4" />
                        Thêm người dùng
                     </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle className="flex justify-center pb-5">Tạo người dùng mới</DialogTitle>
                    </DialogHeader>
                    <CreateCategoryForm></CreateCategoryForm>
                  </DialogContent>
                </Dialog>
              </div>
        	</div>
          </div>
          <CardDescription className="pl-2">
            {loading ? "Đang tải..." : `Tổng cộng ${user.length} người dùng trong hệ thống`}
            {error && (
              <span className="text-red-500 ml-2">({error})</span>
            )}
          </CardDescription>
        </CardHeader>

      	<CardContent>
          <div className="flex items-center py-4">
            <div className="flex w-full justify-start gap-5">
              <CardTitle>Danh sách người dùng</CardTitle>
              <Input
                placeholder="Tìm kiếm người dùng ..."
                value={(table.getColumn("fullName")?.getFilterValue() as string) ?? ""}
                onChange={(event) =>
            	    table.getColumn("fullName")?.setFilterValue(event.target.value)
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
                        {error ? "Không thể tải dữ liệu" : "Không có người dùng nào"}
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
  )
}

export default UserPages