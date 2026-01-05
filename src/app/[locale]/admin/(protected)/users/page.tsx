"use client";

import React, { useEffect, useState } from 'react';
import { z } from "zod";
import api from "@/app/lib/axios";
import { formatDate, formatDateForInput } from "@/utils/datetime";
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
import { UserRole } from '@/type/user.type';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const UserSchema = z.object({
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
   status: z.enum(["Active", "Locked", "Freezed"]).nullable().optional(),
});

const EditUserSchema = z.object({
   fullName: z.string()
      .min(2, "Tên phải có ít nhất 2 ký tự")
      .max(100, "Tên không được quá 100 ký tự"),
   phone: z.string()
      .regex(/^[0-9]{10,11}$/, "Số điện thoại phải có 10-11 chữ số")
      .nullable()
      .optional()
      .or(z.literal("")),
   dateOfBirth: z.string()
      .refine((date) => {
         if (!date) return true;
         const birthDate = new Date(date);
         const today = new Date();
         const age = today.getFullYear() - birthDate.getFullYear();
         return age >= 13 && age <= 120;
      }, "Tuổi phải từ 13 đến 120")
      .nullable()
      .optional(),
   address: z.string()
      .max(200, "Địa chỉ không được quá 200 ký tự")
      .nullable()
      .optional(),
   city: z.string()
      .max(50, "Tên thành phố không được quá 50 ký tự")
      .nullable()
      .optional(),
   country: z.string()
      .max(50, "Tên quốc gia không được quá 50 ký tự")
      .nullable()
      .optional(),
   nation: z.string()
      .max(50, "Quốc tịch không được quá 50 ký tự")
      .nullable()
      .optional(),
   bio: z.string()
      .max(500, "Mô tả không được quá 500 ký tự")
      .nullable()
      .optional(),
   gender: z.enum(["MALE", "FEMALE", "OTHER"]),
   role: z.enum(["ADMIN", "INSTRUCTOR", "LEARNER"]),
   isActive: z.boolean(),
});

type User = z.infer<typeof UserSchema>;

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
   const [dateInputValue, setDateInputValue] = useState<string>("");
   const [avatarTimestamp, setAvatarTimestamp] = useState<number>(Date.now());
   const [actionDialogOpen, setActionDialogOpen] = useState(false);
   const [actionType, setActionType] = useState<'lock' | 'freeze' | 'active' | null>(null);
   const [actionReason, setActionReason] = useState("");
   const [actionUserId, setActionUserId] = useState<string | null>(null);
   const [isSubmittingAction, setIsSubmittingAction] = useState(false);

   useEffect(() => {
      fetchUsers();
   }, []);

   const openDialog = (user: User) => {
      setSelecteduser(user);
      setEditData(user);
      setDateInputValue(formatDateForInput(user.dateOfBirth));
      setEditMode(false);
      setIsDialogOpen(true);
      setAvatarFile(null);
      setAvatarPreview(null);
      setAvatarTimestamp(Date.now());
   }
   const closeDialog = () => {
      setSelecteduser(null);
      setEditData({});
      setDateInputValue("");
      setEditMode(false);
      setIsDialogOpen(false);
      setAvatarFile(null);
      setAvatarPreview(null);
   }

   const fetchUsers = async () => {
      try {
         setIsLoading(true);
         const response = await api.get("/users/getUserExceptAdmin");
         const rawData = response.data || [];
         // Map data
         const mappedData: User[] = rawData.map((item: {
            user_id: string,
            email: string,
            fullName: string,
            gender: string,
            role: string,
            phone: string | number | null,
            avatar: string | null,
            dateOfBirth: string | null,
            address: string | null,
            city: string | null,
            country: string | null,
            nation: string | null,
            bio: string | null,
            isActive: boolean,
            last_login: string | null,
            accountSecurities?: { status: string },
         }) => ({
            user_id: item.user_id?.trim() || "",
            email: item.email?.trim() || "",
            fullName: item.fullName?.trim() || "",
            avatar: item.avatar?.trim() || null,
            role: item.role?.trim() || "",
            gender: item.gender?.trim() || "",
            phone: typeof item.phone === 'string' ? item.phone.trim() : item.phone,
            dateOfBirth: item.dateOfBirth?.trim() || null,
            address: item.address?.trim() || null,
            city: item.city?.trim() || null,
            country: item.country?.trim() || null,
            nation: item.nation?.trim() || null,
            bio: item.bio?.trim() || null,
            last_login: item.last_login?.trim() || null,
            isActive: item.isActive,
            status: item.accountSecurities?.status || null,
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
         const dataToValidate = {
            fullName: (editData.fullName || selectedUser.fullName)?.trim() || "",
            phone: editData.phone === null || editData.phone === undefined ? "" : String(editData.phone).trim(),
            dateOfBirth: editData.dateOfBirth?.trim() || null,
            address: (editData.address || "")?.trim() || "",
            city: (editData.city || "")?.trim() || "",
            country: (editData.country || "")?.trim() || "",
            nation: (editData.nation || "")?.trim() || "",
            bio: (editData.bio || "")?.trim() || "",
            gender: editData.gender || selectedUser.gender,
            role: editData.role || selectedUser.role,
            isActive: editData.isActive !== undefined ? editData.isActive : selectedUser.isActive,
         };
         /* parse là phương thức được cấp bởi zod để validate dữ liệu theo Schema đã khai báo trước. */
         EditUserSchema.parse(dataToValidate);
         Object.assign(editData, {
            fullName: dataToValidate.fullName,
            phone: dataToValidate.phone || null,
            dateOfBirth: dataToValidate.dateOfBirth,
            address: dataToValidate.address || null,
            city: dataToValidate.city || null,
            country: dataToValidate.country || null,
            nation: dataToValidate.nation || null,
            bio: dataToValidate.bio || null,
         });

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
               setAvatarTimestamp(Date.now());
            }
         }

         if (editData.dateOfBirth) {
            const date = new Date(editData.dateOfBirth);
            if (!isNaN(date.getTime())) {
               editData.dateOfBirth = date.toISOString();
            } else {
               delete editData.dateOfBirth;
            }
         }

         if (editData.role && editData.role !== selectedUser.role) {
            await api.patch(`/users/update-role/${selectedUser.user_id}`, {
               role: editData.role
            });
         }
         /* object.keys là phương thức lấy keys của 1 object của javascript */
         // eslint-disable-next-line @typescript-eslint/no-unused-vars
         const { role: role, avatar: string, ...otherData } = editData;
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
         setAvatarFile(null);
         setAvatarPreview(null);

         setIsSaving(false)

      } catch (error) {
         setIsSaving(false);
         if (error instanceof z.ZodError) {
            const firstError = error.issues[0];
            toast.error(firstError.message);
            return;
         }
         console.error("Lỗi khi lưu thông tin người dùng", error);
         toast.error("Lưu thông tin tài khoản thất bại");
      }
   }

   const openActionDialog = (userId: string, type: 'lock' | 'freeze' | 'active') => {
      setActionUserId(userId);
      setActionType(type);
      setActionReason("");
      setActionDialogOpen(true);
   }
   const closeActionDialog = () => {
      setActionDialogOpen(false);
      setActionUserId(null);
      setActionType(null);
      setActionReason("");
   }
   const handleAccountAction = async () => {
      if (!actionUserId || !actionType) return;
      if ((actionType === 'lock' || actionType === 'freeze') && !actionReason.trim()) {
         toast.error("Vui lòng nhập lý do");
         return;
      }
      try {
         setIsSubmittingAction(true);
         const endpoint = actionType === 'lock' ? '/account-securities/lock-account' : actionType === 'freeze' ? '/account-securities/freeze-account' : '/account-securities/active-account';
         await api.post(endpoint, {
            user_id: actionUserId,
            reason: actionReason || 'Mở lại tài khoản'
         });
         const actionText = actionType === 'lock' ? 'khóa' : actionType === 'freeze' ? 'đóng băng' : 'mở lại';
         toast.success(`${actionText.charAt(0).toUpperCase() + actionText.slice(1)} tài khoản thành công`);
         closeActionDialog();
         await fetchUsers();
      } catch (error) {
         console.error("Lỗi khi thực hiện hành động:", error);
         toast.error("Có lỗi xảy ra, vui lòng thử lại");
      } finally {
         setIsSubmittingAction(false);
      }
   }

   const filteredUsers = users.filter((user) => {
      const matchSearch = user.fullName.toLowerCase().includes(searchTerm.toLowerCase()) || user.email.toLowerCase().includes(searchTerm.toLowerCase());
      const matchActive = filterActive === null || filterActive === user.isActive === true;
      return matchSearch && matchActive;
   });

   const labeledRole: Record<UserRole, "destructive" | "outline" | "default"> = {
      ADMIN: "destructive",
      INSTRUCTOR: "default",
      LEARNER: "outline",
   }


   if (isLoading) {
      return (
         <div className="flex items-center justify-center min-h-screen">
            <Spinner />
         </div>
      );
   }

   return (
      <div className="space-y-6 p-4 max-w-screen">
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

         <div className="border rounded-lg overflow-x-auto">
            <Table>
               <TableHeader>
                  <TableRow>
                     <TableHead>Người dùng</TableHead>
                     <TableHead>Role</TableHead>
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
                                 <AvatarImage
                                    /* đổi params để báo với trình duyệt là url này thay đổi, nếu không có thì trình duyệt sẽ lấy cache url của ảnh cũ, không hiển thị ảnh mới */
                                    src={user.avatar ? `${user.avatar}?t=${Date.now()}` : undefined}
                                    className="object-cover"
                                 />
                                 <AvatarFallback>
                                    {user.fullName.charAt(0).toUpperCase()}
                                 </AvatarFallback>
                              </Avatar>
                              <div>
                                 <p className="font-medium">{user.fullName}</p>
                              </div>
                           </div>
                        </TableCell>

                        <TableCell>
                           <div className="flex items-center gap-3">
                              <div>
                                 <Badge variant={labeledRole[user.role]}>
                                    {user.role}
                                 </Badge>
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
                           {user.status === "Active" && (
                              <Badge variant="default" className="bg-green-600">
                                 Hoạt động
                              </Badge>
                           )}
                           {user.status === "Locked" && (
                              <Badge variant="destructive" className="bg-red-600">
                                 Bị khóa
                              </Badge>
                           )}
                           {user.status === "Freezed" && (
                              <Badge variant="default" className="bg-blue-600">
                                 Đóng băng
                              </Badge>
                           )}
                           {!user.status && (
                              <Badge variant="outline" className="bg-gray-100">
                                 Chưa xác định
                              </Badge>
                           )}
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
                                 <DropdownMenuItem
                                    onClick={() => openActionDialog(user.user_id, 'lock')}
                                    className="text-red-600"
                                 >
                                    Khóa tài khoản
                                 </DropdownMenuItem>
                                 <DropdownMenuItem
                                    onClick={() => openActionDialog(user.user_id, 'freeze')}
                                    className="text-orange-600"
                                 >
                                    Đóng băng tài khoản
                                 </DropdownMenuItem>
                                 <DropdownMenuItem
                                    onClick={() => openActionDialog(user.user_id, 'active')}
                                    className="text-green-600"
                                 >
                                    Mở lại tài khoản
                                 </DropdownMenuItem>
                              </DropdownMenuContent>
                           </DropdownMenu>
                        </TableCell>
                     </TableRow>
                  ))}
               </TableBody>
            </Table>
         </div>

         <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogContent className="max-w-6xl! w-[95vw] max-h-[90vh] overflow-y-auto sm:max-w-6xl">
               <DialogHeader>
                  <DialogTitle>Thông tin tài khoản</DialogTitle>
               </DialogHeader>
               <div>
                  {selectedUser ? (
                     <div className="space-y-4">
                        <div className="flex sm:flex-row items-start sm:items-center gap-4">
                           <div className="relative">
                              <Avatar className="w-16 h-16 shrink-0">
                                 <AvatarImage
                                    src={
                                       avatarPreview ||
                                       (selectedUser.avatar ? `${selectedUser.avatar}?t=${avatarTimestamp}` : undefined)
                                    }
                                    className="object-cover"
                                 />
                                 <AvatarFallback>
                                    {selectedUser.fullName.charAt(0).toUpperCase()}
                                 </AvatarFallback>
                              </Avatar>
                              {editMode && (
                                 <Label htmlFor="avatar-upload" className="absolute -bottom-1 -right-1 cursor-pointer">
                                    <CircleFadingArrowUpIcon />
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
                           <div className="flex-1 w-full">
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

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                                 selectedUser.role === "ADMIN" ? (
                                    <Badge variant="default" className="bg-red-600 cursor-default select-none">
                                       ADMIN
                                    </Badge>
                                 ) : selectedUser.role === "INSTRUCTOR" ? (
                                    <Badge variant="default" className="bg-blue-600 cursor-default select-none">
                                       INSTRUCTOR
                                    </Badge>
                                 ) : (
                                    <Badge variant="default" className="bg-green-600 cursor-default select-none">
                                       LEARNER
                                    </Badge>
                                 )
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
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                           <div>
                              <Label htmlFor="gender" className="block text-sm font-medium mb-1">Giới tính</Label>
                              {!editMode ? (
                                 <div>{selectedUser.gender === "MALE" ? "Nam" : selectedUser.gender === "FEMALE" ? "Nữ" : "Khác"}</div>
                              ) : (
                                 <Select
                                    value={editData.gender || selectedUser.gender}
                                    onValueChange={(value) => handleChange("gender", value)}
                                 >
                                    <SelectTrigger id="gender">
                                       <SelectValue placeholder="Chọn giới tính" />
                                    </SelectTrigger>
                                    <SelectContent>
                                       <SelectItem value="MALE">Nam</SelectItem>
                                       <SelectItem value="FEMALE">Nữ</SelectItem>
                                       <SelectItem value="OTHER">Khác</SelectItem>
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
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                           <div>
                              <label className="block text-sm font-medium mb-1">Ngày sinh</label>
                              {!editMode ? (
                                 <div>{formatDate(selectedUser.dateOfBirth)}</div>
                              ) : (
                                 <Input
                                    type="date"
                                    value={dateInputValue}
                                    onChange={(e) => {
                                       setDateInputValue(e.target.value);
                                       handleChange("dateOfBirth", e.target.value);
                                    }}
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
                        </div>
                        <div>
                           <label className="block text-sm font-medium mb-1">Địa chỉ</label>
                           {!editMode ? (
                              <div>{selectedUser.address || "Chưa có"}</div>
                           ) : (
                              <Input
                                 type="text"
                                 value={editData.address || ""}
                                 onChange={(e) => handleChange("address", e.target.value)}
                              />
                           )}
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                           <div>
                              <label className="block text-sm font-medium mb-1">Thành phố</label>
                              {!editMode ? (
                                 <div>{selectedUser.city || "Chưa có"}</div>
                              ) : (
                                 <Input
                                    type="text"
                                    value={editData.city || ""}
                                    onChange={(e) => handleChange("city", e.target.value)}
                                 />
                              )}
                           </div>

                           <div>
                              <label className="block text-sm font-medium mb-1">Quốc gia</label>
                              {!editMode ? (
                                 <div>{selectedUser.country || "Chưa có"}</div>
                              ) : (
                                 <Input
                                    type="text"
                                    value={editData.country || ""}
                                    onChange={(e) => handleChange("country", e.target.value)}
                                 />
                              )}
                           </div>

                           <div>
                              <label className="block text-sm font-medium mb-1">Quốc tịch</label>
                              {!editMode ? (
                                 <div>{selectedUser.nation || "Chưa có"}</div>
                              ) : (
                                 <Input
                                    type="text"
                                    value={editData.nation || ""}
                                    onChange={(e) => handleChange("nation", e.target.value)}
                                 />
                              )}
                           </div>
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
                                       setDateInputValue(formatDateForInput(selectedUser.dateOfBirth));
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

         <Dialog open={actionDialogOpen} onOpenChange={setActionDialogOpen}>
            <DialogContent className="max-w-md">
               <DialogHeader>
                  <DialogTitle>
                     {actionType === 'lock' && 'Khóa tài khoản'}
                     {actionType === 'freeze' && 'Đóng băng tài khoản'}
                     {actionType === 'active' && 'Mở lại tài khoản'}
                  </DialogTitle>
               </DialogHeader>
               <div className="space-y-4">
                  <div>
                     <Label htmlFor="reason">
                        Lý do {actionType === 'lock' ? 'khóa' : actionType === 'freeze' ? 'đóng băng' : 'mở lại'} tài khoản
                        {(actionType === 'lock' || actionType === 'freeze') && <span className="text-red-500">*</span>}
                     </Label>
                     <textarea
                        id="reason"
                        rows={4}
                        className="w-full rounded-md border border-gray-300 p-2 mt-1"
                        value={actionReason}
                        onChange={(e) => setActionReason(e.target.value)}
                        placeholder={`Nhập lý do ${actionType === 'lock' ? 'khóa' : actionType === 'freeze' ? 'đóng băng' : 'mở lại'} tài khoản...`}
                     />
                  </div>
                  <div className="flex justify-end gap-2">
                     <Button variant="outline" onClick={closeActionDialog} disabled={isSubmittingAction}>
                        Hủy
                     </Button>
                     <Button
                        onClick={handleAccountAction}
                        disabled={isSubmittingAction}
                        variant={actionType === 'lock' ? 'destructive' : 'default'}
                     >
                        {isSubmittingAction ? (
                           <>
                              <Spinner className="mr-2" />
                              Đang xử lý...
                           </>
                        ) : (
                           'Xác nhận'
                        )}
                     </Button>
                  </div>
               </div>
            </DialogContent>
         </Dialog>
      </div>
   );
}