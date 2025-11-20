"use client";

import React, { useEffect, useState } from 'react';
import { z } from "zod";
import api from "@/app/lib/axios";
import {
   Table,
   TableBody,
   TableCell,
   TableHead,
   TableHeader,
   TableRow,
} from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import {
   Select,
   SelectContent,
   SelectItem,
   SelectTrigger,
   SelectValue,
} from "@/components/ui/select";
import {
   Search,
   MoreHorizontal,
   Mail,
   Phone,
   RefreshCcw,
   CircleFadingArrowUpIcon,
} from "lucide-react";
import {
   DropdownMenu,
   DropdownMenuContent,
   DropdownMenuItem,
   DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
   Dialog,
   DialogContent,
   DialogHeader,
   DialogTitle,
} from "@/components/ui/dialog"
import { toast } from "sonner"

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const _UserSchema = z.object({
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

type User = z.infer<typeof _UserSchema>;

export default function UserManagement() {
   const [users, setUser] = useState<User[]>([]);
   const [isLoading, setIsLoading] = useState(true);
   const [searchTerm, setSearchTerm] = useState("");
   const [filterActive, setFilterActive] = useState<boolean | null>(null);
   const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);
   const [isSaving, setIsSaving] = useState<boolean>(false);
   const [selectedUser, setSelecteduser] = useState<User | null>(null);
   const [editMode, setEditMode] = useState(false);
   const [editData, setEditData] = useState<Partial<User>>({});
   const [avatarFile, setAvatarFile] = useState<File | null>(null);
   const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
   useEffect(() => {
      fetchUsers();
   }, []);

   const openDialog = (user: User) => {
      setSelecteduser(user);
      setEditData(user);
      setEditMode(false); 
      setIsDialogOpen(true);
      setAvatarFile(null);
      setAvatarPreview(null);
   }
   const closeDialog = () => {
      setSelecteduser(null);
      setEditData({});
      setEditMode(false);
      setIsDialogOpen(false);
      setAvatarFile(null);
      setAvatarPreview(null);
   }

   const fetchUsers = async () => {
      try {
         setIsLoading(true);
         const response = await api.get("/users");
         const rawData = response.data || [];
         // Map data
         const mappedData: User[] = rawData.map((item: {
            user_id: string,
            email: string,
            fullName: string,
            gender: string,
            role: string,
            phone: null,
            avatar: string,
            dateOfBirth: null,
            address: null,
            city: null,
            country: null,
            nation: null,
            bio: null,
            isActive: boolean,
            last_login: null,
         }) => ({
            user_id: item.user_id.trim(),
            email: item.email.trim(),
            fullName: item.fullName,
            avatar: item.avatar,
            role: item.role,
            gender: item.gender,
            phone: null,
            dateOfBirth: null,
            address: null,
            city: null,
            country: null,
            nation: null,
            bio: null,
            last_login: null,
            isActive: item.isActive,
         }));
         setUser(mappedData);
      } catch (error) {
         console.error("Lỗi khi tải danh sách người dùng:", error);
      } finally {
         setIsLoading(false);
      }
   };
   const reload = async (): Promise<void> => {
      fetchUsers();
   }
   const handleChange = (field: keyof User, value: string | boolean | null | undefined) => {
      setEditData((prev) => ({
         ...prev,
         [field]: value,
      }))
   }

   const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      if (!file.type.startsWith('image/')) {
         toast.error('Vui lòng chọn file ảnh hợp lệ!');
         return;
      }

      const maxSize = 5 * 1024 * 1024; // 5MB
      if (file.size > maxSize) {
         toast.error('Kích thước ảnh không được vượt quá 5MB!');
         return;
      }

      setAvatarFile(file);
      const url = URL.createObjectURL(file);
      setAvatarPreview(url);
   }

   const submitChange = async () => {
      if (!selectedUser) return;
      try {
         setIsSaving(true);
         if (avatarFile) {
            const formData = new FormData();
            formData.append('avatar', avatarFile);
            const avatarResponse = await api.post(`/users/upload-avatar/${selectedUser.user_id}`, formData, {
               headers: {
                  'Content-Type': 'multipart/form-data',
               },
            });
            const newAvatarUrl = avatarResponse.data.data?.avatar || avatarResponse.data.avatar;
            if (newAvatarUrl) {
               editData.avatar = newAvatarUrl;
            }
         }
         if (editData.role && editData.role !== selectedUser.role) {
            await api.patch(`/users/update-role/${selectedUser.user_id}`, {
               role: editData.role
            });
         }
         // eslint-disable-next-line @typescript-eslint/no-unused-vars
         const { role: _role, avatar: string, ...otherData } = editData;
         if (Object.keys(otherData).length > 0) {
            await api.patch(`/users/update-info/${selectedUser.user_id}`, otherData);
         }

         setUser((prev) =>
            prev.map((u) =>
               u.user_id === selectedUser.user_id ? { ...u, ...editData } : u
            )
         );
         setSelecteduser((prev) => (prev ? { ...prev, ...editData } : null));

         toast.success("Lưu thông tin tài khoản thành công");

         setEditMode(false);
         setIsDialogOpen(false);
         setAvatarFile(null);
         setAvatarPreview(null);

         fetchUsers();

         setIsSaving(false)

      } catch (error) {
         console.error("Lỗi khi lưu thông tin người dùng", error);
         toast.error("Lưu thông tin tài khoản thất bại");
         setIsSaving(false)
      }
   }
   const filteredUsers = users.filter((user) => {
      const matchSearch =
         user.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
         user.email.toLowerCase().includes(searchTerm.toLowerCase());
      const matchActive = filterActive === null || filterActive === user.isActive === true;
      return matchSearch && matchActive;
   });

   if (isLoading) {
      return (
         <div className="flex items-center justify-center min-h-screen">
            <Spinner />
         </div>
      );
   }

   return (
      <div className="space-y-6 p-4 max-w-screen">
         <div className="flex flex-col justify-start items-start md:items-start gap-4">
            <div className='flex flex-col gap-2'>
               <h1 className="text-3xl font-bold">Quản lý người dùng</h1>
               <p className="text-gray-500 mt-1">Tổng số: {users.length} người dùng</p>
            </div>

            <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto">
               <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                     placeholder="Tìm kiếm theo tên hoặc email..."
                     value={searchTerm}
                     onChange={(e) => setSearchTerm(e.target.value)}
                     className="pl-10"
                  />
               </div>

               <div className="flex gap-2 flex-wrap">
                  <Button
                     variant={filterActive === null ? "default" : "outline"}
                     onClick={() => setFilterActive(null)}
                     className="cursor-pointer hover:bg-gray-300"
                  >
                     Tất cả
                  </Button>
                  <Button
                     variant={filterActive === true ? "default" : "outline"}
                     onClick={() => setFilterActive(true)}
                     className="cursor-pointer hover:bg-gray-300"
                  >
                     Tài khoản đang mở
                  </Button>
                  <Button
                     variant={filterActive === false ? "default" : "outline"}
                     onClick={() => setFilterActive(false)}
                     className="cursor-pointer hover:bg-gray-300"
                  >
                     Tài khoản bị khoá
                  </Button>
                  <Button
                     variant={"outline"}
                     onClick={reload}
                     className="cursor-pointer hover:bg-gray-300"
                  >
                     <RefreshCcw /> Reload
                  </Button>
               </div>
            </div>
         </div>

         <div className="border rounded-lg overflow-x-auto">
            <Table>
               <TableHeader>
                  <TableRow>
                     <TableHead>Người dùng</TableHead>
                     <TableHead>Email</TableHead>
                     <TableHead>Trạng thái</TableHead>
                     <TableHead className="text-right">Hành động</TableHead>
                  </TableRow>
               </TableHeader>
               <TableBody>
                  {filteredUsers.map((user) => (
                     <TableRow key={user.user_id}>
                        <TableCell>
                           <div className="flex items-center gap-3">
                              <Avatar className="h-10 w-10 shrink-0">
                                 <AvatarImage src={user.avatar || undefined} className="object-cover" />
                                 <AvatarFallback>
                                    {user.fullName.charAt(0).toUpperCase()}
                                 </AvatarFallback>
                              </Avatar>
                              <div>
                                 <p className="font-medium">{user.fullName}</p>
                                 <p className="text-sm text-gray-500">{user.bio || "Chưa có mô tả"}</p>
                              </div>
                           </div>
                        </TableCell>

                        <TableCell>
                           <div className="space-y-1">
                              <div className="flex items-center gap-2 text-sm">
                                 <Mail className="h-3 w-3 text-gray-400" />
                                 {user.email}
                              </div>
                              {user.phone && (
                                 <div className="flex items-center gap-2 text-sm">
                                    <Phone className="h-3 w-3 text-gray-400" />
                                    {user.phone}
                                 </div>
                              )}
                           </div>
                        </TableCell>

                        <TableCell>
                           <div className="space-y-1">
                              {user.isActive ? (
                                 <Badge variant={"default"} className="bg-green-600">
                                    Đang mở
                                 </Badge>
                              ) : (
                                 <Badge variant={"destructive"} className="bg-red-600">
                                    Tài khoản bị khoá
                                 </Badge>
                              )}
                           </div>
                        </TableCell>

                        <TableCell className="text-right">
                           <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                 <Button variant="ghost" size="sm">
                                    <MoreHorizontal className="h-4 w-4" />
                                 </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                 <DropdownMenuItem onClick={() => openDialog(user)}>
                                    Xem chi tiết
                                 </DropdownMenuItem>
                                 <DropdownMenuItem>Xem khóa học</DropdownMenuItem>
                              </DropdownMenuContent>
                           </DropdownMenu>
                        </TableCell>
                     </TableRow>
                  ))}
               </TableBody>
            </Table>
         </div>

         <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogContent className="max-w-lg w-full">
               <DialogHeader>
                  <DialogTitle>Thông tin tài khoản</DialogTitle>
               </DialogHeader>
               <div>
                  {selectedUser ? (
                     <div className="space-y-4">
                        <div className="flex items-center gap-4">
                           <div className="relative">
                              <Avatar className="w-16 h-16 shrink-0">
                                 <AvatarImage src={avatarPreview || selectedUser.avatar || undefined} className="object-cover" />
                                 <AvatarFallback>
                                    {selectedUser.fullName.charAt(0).toUpperCase()}
                                 </AvatarFallback>
                              </Avatar>
                              {editMode && (
                                 <Label htmlFor="avatar-upload" className="absolute -bottom-1 -right-1 cursor-pointer">
                                    <CircleFadingArrowUpIcon/>
                                    <input
                                       id="avatar-upload"
                                       type="file"
                                       accept="image/*"
                                       className="hidden"
                                       onChange={handleAvatarChange}
                                    />
                                 </Label>
                              )}
                           </div>
                           <div className="flex-1">
                              {!editMode ? (
                                 <div className="text-lg font-semibold">{selectedUser.fullName}</div>
                              ) : (
                                 <div className="space-y-1">
                                    <Label htmlFor="fullName">Họ và tên</Label>
                                    <Input
                                       id="fullName"
                                       type="text"
                                       value={editData.fullName || ""}
                                       onChange={(e) => handleChange("fullName", e.target.value)}
                                    />
                                 </div>
                              )}
                           </div>
                        </div>

                        <div>
                           <label className="block text-sm font-medium mb-1">Email</label>
                           {!editMode ? (
                              <div className="text-gray-700">{selectedUser.email}</div>
                           ) : (
                              <Input
                                 type="email"
                                 value={editData.email || ""}
                                 disabled
                                 onChange={(e) => handleChange("email", e.target.value)}
                              />
                           )}
                        </div>

                        <div>
                           <Label htmlFor="role" className="block text-sm font-medium mb-1">Vai trò</Label>
                           {!editMode ? (
                              <Badge
                                 variant={"default"}
                                 className="cursor-default select-none"
                              >
                                 {selectedUser.role}
                              </Badge>
                           ) : (
                              <Select
                                 value={editData.role || selectedUser.role}
                                 onValueChange={(value) => handleChange("role", value)}
                              >
                                 <SelectTrigger id="role">
                                    <SelectValue placeholder="Chọn vai trò" />
                                 </SelectTrigger>
                                 <SelectContent>
                                    <SelectItem value="ADMIN">ADMIN</SelectItem>
                                    <SelectItem value="INSTRUCTOR">INSTRUCTOR</SelectItem>
                                    <SelectItem value="LEARNER">LEARNER</SelectItem>
                                 </SelectContent>
                              </Select>
                           )}
                        </div>

                        <div>
                           <label className="block text-sm font-medium mb-1">Số điện thoại</label>
                           {!editMode ? (
                              <div>{selectedUser.phone || "Chưa có"}</div>
                           ) : (
                              <Input
                                 type="tel"
                                 value={editData.phone || ""}
                                 onChange={(e) => handleChange("phone", e.target.value)}
                              />
                           )}
                        </div>

                        <div>
                           <label className="block text-sm font-medium mb-1">Mô tả</label>
                           {!editMode ? (
                              <div>{selectedUser.bio || "Chưa có mô tả"}</div>
                           ) : (
                              <textarea
                                 rows={3}
                                 className="w-full rounded-md border border-gray-300 p-2"
                                 value={editData.bio || ""}
                                 onChange={(e) => handleChange("bio", e.target.value)}
                              />
                           )}
                        </div>

                        <div>
                           <label className="block text-sm font-medium mb-1">Trạng thái</label>
                           {!editMode ? (
                              selectedUser.isActive ? (
                                 <Badge variant={"default"} className="bg-green-600">
                                    Đang mở
                                 </Badge>
                              ) : (
                                 <Badge variant={"destructive"} className="bg-red-600">
                                    Tài khoản bị khoá
                                 </Badge>
                              )
                           ) : (
                              <select
                                 className="w-full rounded-md border border-gray-300 p-2"
                                 value={editData.isActive ? "true" : "false"}
                                 onChange={(e) =>
                                    handleChange("isActive", e.target.value === "true")
                                 }
                              >
                                 <option value="true">Đang mở</option>
                                 <option value="false">Tài khoản bị khoá</option>
                              </select>
                           )}
                        </div>

                        <div className="flex justify-end gap-3 pt-4">
                           {!editMode ? (
                              <div className='flex gap-2'>
                                 <Button variant="outline" onClick={() => setEditMode(true)}>
                                    Sửa
                                 </Button>
                                 <Button variant="ghost" onClick={closeDialog}>
                                    Đóng
                                 </Button>
                              </div>
                           ) : (
                              <div className='flex gap-2'>
                                 {!isSaving ? (
                                    <Button variant="default" onClick={submitChange} className='cursor-pointer'>
                                       Lưu
                                    </Button>
                                 ) : (
                                    <Button size="sm" variant={'outline'} disabled>
                                       <Spinner></Spinner> Submitting
                                    </Button>
                                 )}
                                 <Button
                                    variant="outline"
                                    className='cursor-pointer'
                                    onClick={() => {
                                       setEditData(selectedUser);
                                       setEditMode(false);
                                    }}
                                 >
                                    Huỷ
                                 </Button>
                              </div>
                           )}
                        </div>
                     </div>
                  ) : (
                     <div>
                        <p className="text-xl text-red-600">Lỗi khi lấy thông tin người dùng</p>
                     </div>
                  )}
               </div>
            </DialogContent>
         </Dialog>
      </div>
   );
}