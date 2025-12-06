
"use client";

import ProtectedRoute from "@/components/ProtectedRoute";
import { useAuth } from "@/app/context/AuthContext";
import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import api from "@/app/lib/axios";
// import type { AxiosError } from 'axios';
import Image from "next/image";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useIsMobile } from "@/hooks/useIsMobile";
import { EnvelopeIcon, MapPinIcon, CalendarIcon, CameraIcon, AcademicCapIcon, CheckBadgeIcon, UserIcon } from "@heroicons/react/24/outline";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner";
import Link from "next/link";


type UserProps = {
  user_id: string,
  fullName: string,
  email: string,
  phone?: string,
  avatar?: string,
  dateOfBirth?: Date,
  address?: string,
  city?: string,
  nation?: string,
  bio?: string,
  isActive: boolean,
  role?: string,
  createdAt?: Date,
  last_login?: Date,
}

type QualificationProps = {
  instructor_qualification_id: string;
  title: string;
  type: "Degree" | "Certificate";
  issue_date: string;
  expire_date?: string;
  issue_place?: string;
  status: "Pending" | "Approved" | "Rejected";
  qualification_images: string[];
  specialization: {
    specialization_name: string;
  };
  isVerified: boolean;
}

type InstructorProps = {
  instructor_id: string;
  isVerified: boolean;
  status: "Active" | "Inactive" | "Suspended";
  createdAt: string;
}
type AccountSecurity = {
  account_security_id: string;
  user_id: string;
  email_verified: boolean;
  failed_login_attempts: number;
  verification_token: string;
  token_expires_at?: string;
  createdAt?: string;
  updatedAt?: string;
}
type UpdateUserData = Omit<UserProps, "user_id" | "role" | "isActive" | "last_login" | "email" |"createdAt">

export default function ProfilePage() {
  const isMobile = useIsMobile();
  const { user, logout } = useAuth();
  const router = useRouter();
  const [userInfo, setUserInfo] = useState<UserProps | null>(null);
  const [accountSecurity, setAccountSecurity] = useState<AccountSecurity | null>(null);
  const [instructorInfo, setInstructorInfo] = useState<InstructorProps | null>(null);
  const [qualifications, setQualifications] = useState<QualificationProps[]>([]);

  const [isLoadingInstructor, setIsLoadingInstructor] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isEditingInstructor, setIsEditingInstructor] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);

  const [errors, setErrors] = useState<Partial<Record<keyof UpdateUserData, string>>>({});
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState<UpdateUserData>({
    fullName: "", phone: "", avatar: "", dateOfBirth: undefined, address: "", city: "", nation: "", bio: ""
  });

  const [instructorFormData, setInstructorFormData] = useState({
    bank_name: "", account_number: "", account_holder_name: ""
  });

  const handleAvatarClick = () => {
    if (fileInputRef.current) fileInputRef.current.click();
  };

  const handleLogout = async () => {
    try {
      await logout();
      router.push("/");
      toast.success("Đăng xuất thành công!")
    } catch (error) {
      console.error("Đã xảy ra lỗi:", error);
      toast.error("Lỗi khi đăng xuất, vui lòng thử lại sau!");
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof UpdateUserData, string>> = {};
    if (!formData.fullName || formData.fullName.trim().length < 2) newErrors.fullName = "Họ tên phải có ít nhất 2 ký tự";
    if (formData.phone && formData.phone.trim()) {
      const phoneRegex = /^(0|\+84)[0-9]{9,10}$/;
      if (!phoneRegex.test(formData.phone.replace(/\s/g, ''))) newErrors.phone = "Số điện thoại không hợp lệ";
    }
    if (formData.dateOfBirth) {
      const birthDate = new Date(formData.dateOfBirth);
      const today = new Date();
      const age = today.getFullYear() - birthDate.getFullYear();
      if (age < 13) newErrors.dateOfBirth = "Bạn phải ít nhất 13 tuổi";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) { toast.error("Vui lòng chọn file ảnh!"); return; }
    if (file.size > 10 * 1024 * 1024) { toast.error("Ảnh quá lớn (>10MB)!"); return; }

    setIsUploadingAvatar(true);
    try {
      const userId = userInfo?.user_id || user?.id || '';
      const fileExtension = file.name.split('.').pop() || 'jpg';
      const newFileName = `${userId.slice(0, Math.floor(userId.length / 2))}.${fileExtension}`;
      const renamedFile = new File([file], newFileName, { type: file.type, lastModified: file.lastModified });

      const formDataUpload = new FormData();
      formDataUpload.append('avatar', renamedFile);

      const response = await api.post(`/users/upload-avatar/${userInfo?.user_id}`, formDataUpload, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      const avatarUrlWithTimestamp = `${response.data.avatarUrl}?t=${Date.now()}`;
      setFormData(prev => ({ ...prev, avatar: avatarUrlWithTimestamp }));
      setUserInfo(prev => prev ? { ...prev, avatar: avatarUrlWithTimestamp } : prev);

      toast.success("Cập nhật avatar thành công!");
    } catch (error) {
      toast.error("Lỗi khi tải ảnh lên.");
      console.error(error);
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  const handleEditInfo = async (id: string, data: UpdateUserData) => {
    try {
      if (!user) return;
      const res = await api.patch(`/users/update-info/${id}`, data);
      setUserInfo({ ...userInfo, ...data } as UserProps);
      setIsEditing(false);
      toast.success("Cập nhật hồ sơ thành công");
      return res.data;
    } catch (error) {
      console.error(error);
      toast.error("Cập nhật hồ sơ thất bại");
    }
  }

  const handleSubmitEdit = async () => {
    if (!user || !validateForm()) return;
    await handleEditInfo(user.id, formData);
  }

  const handleInputChange = (field: keyof UpdateUserData, value: string | number | Date | undefined) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: undefined }));
  }

  useEffect(() => {
    const takeUserInfo = async () => {
      try {
        if (!user) return;
        const res = await api.get(`/users/getMyProfile/${user.id}`)
        const userData = res.data.user || res.data;
        setUserInfo(userData);
        setAccountSecurity(userData.accountSecurities)

        if (userData) {
          setFormData({
            fullName: userData.fullName || "", phone: userData.phone || "", avatar: userData.avatar || "",
            dateOfBirth: userData.dateOfBirth, address: userData.address || "", city: userData.city || "",
            nation: userData.nation || "", bio: userData.bio || "", 
          });
        }
      } catch (error) { console.log("Lỗi fetch user", error) }
    }
    if (user) takeUserInfo();
  }, [user]);
  const fetchInstructorData = async () => {
    if (!user) return;
    setIsLoadingInstructor(true);
    try {
      try {
        const instrRes = await api.get(`/instructors/user/${user.id}`);
        if (instrRes.data && instrRes.data.data) {
          setInstructorInfo(instrRes.data.data);
        }
      } catch (err) { console.log("User chưa là giảng viên", err); }

      const qualRes = await api.get(`/instructor-qualifications/my-qualifications`);
      if (qualRes.data && qualRes.data.data) {
        setQualifications(qualRes.data.data);
      }
    } catch (error) {
      console.error("Lỗi fetch giảng viên:", error);
    } finally {
      setIsLoadingInstructor(false);
    }
  };

  const handleInstructorUpdateSubmit = async () => {
    try {
      toast.success("Cập nhật thông tin giảng viên thành công!");
      setIsEditingInstructor(false);
      fetchInstructorData();
    } catch (error) {
      console.log(error);
      toast.error("Đã có lỗi xảy ra");
    }
  };

  return (
    <ProtectedRoute>
      <div className={`w-full min-h-screen overflow-y-auto pb-10 ${isMobile ? 'pl-1 pr-1 ' : 'pl-10 pr-10 mt-4'}`}>
        {user ? (
          <div className="">
            <div className={`breadcrumb ${isMobile ? 'ml-3 pt-3 mb-5' : ' pt-5 mb-5'}`}>
              <Breadcrumb>
                <BreadcrumbList>
                  <BreadcrumbItem><BreadcrumbLink href="/">Home</BreadcrumbLink></BreadcrumbItem>
                  <BreadcrumbSeparator />
                  <BreadcrumbItem><BreadcrumbLink href="#">Hồ sơ người dùng</BreadcrumbLink></BreadcrumbItem>
                </BreadcrumbList>
              </Breadcrumb>
            </div>

            {userInfo && (
              <div className={`${isMobile ? 'mx-2' : 'mx-auto max-w-8xl mt-2'}`}>

                <div className="relative">
                  <div className={`relative ${isMobile ? 'h-32' : 'h-48'} rounded-t-2xl overflow-hidden bg-linear-to-r from-slate-700 via-slate-800 to-slate-900`}>
                    <Image src={'/images/background/bg.jpg'} alt="Background Banner" fill className="object-cover opacity-50" />
                  </div>

                  <div className={`relative bg-white rounded-2xl shadow-xl ${isMobile ? '-mt-8 mx-4 p-4' : '-mt-16 mx-8 p-8'}`}>
                    <div className={`flex ${isMobile ? 'flex-col items-center text-center' : 'flex-row items-end'} gap-6`}>
                      <div className={`${isMobile ? '-mt-16' : '-mt-20'} relative group`}>
                        <Avatar className={`${isMobile ? 'h-24 w-24' : 'h-32 w-32'} border-4 border-white shadow-lg`}>
                          <AvatarImage src={formData.avatar || userInfo?.avatar} alt="User avatar" style={{ objectFit: "cover" }} />
                          <AvatarFallback className="text-2xl font-roboto-bold">{userInfo.fullName.charAt(0).toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <div onClick={handleAvatarClick} className={`absolute inset-0 rounded-full bg-opacity-0 group-hover:bg-opacity-50 transition-all flex items-center justify-center cursor-pointer z-10`}>
                          <CameraIcon className="w-8 h-8 text-white opacity-0 group-hover:opacity-100" />
                        </div>
                        <input ref={fileInputRef} type="file" accept="image/*" onChange={handleAvatarUpload} className="hidden" />
                        {isUploadingAvatar && (
                          <div className="absolute inset-0 rounded-full bg-opacity-50 flex items-center justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div></div>
                        )}
                      </div>

                      <div className="flex-1">
                        <div className="flex items-center justify-center gap-5 sm:justify-start">
                          <h1 className={`font-rosario-bold text-gray-900 ${isMobile ? 'text-xl' : 'text-3xl'}`}>{userInfo.fullName}</h1>
                          <Badge className={`font-roboto-bold ${userInfo.role === 'ADMIN' ? 'bg-red-500' : userInfo.role === 'INSTRUCTOR' ? 'bg-blue-500' : 'bg-green-500'} text-white`}>
                            {userInfo.role?.toUpperCase() || 'LEARNER'}
                          </Badge>
                        </div>

                        <div className={`flex ${isMobile ? 'flex-col justify-center items-center' : 'flex-row'} gap-4 mt-4 text-gray-600`}>
                          <div className="flex items-center gap-2"><EnvelopeIcon className="w-5 h-5" /><span className="font-roboto text-sm">{userInfo.email}</span></div>
                          {(userInfo.city || userInfo.nation) && (<div className="flex items-center gap-2"><MapPinIcon className="w-5 h-5" /><span className="font-roboto text-sm">{[userInfo.city, userInfo.nation].filter(Boolean).join(', ')}</span></div>)}
                          <div className="flex items-center gap-2"><CalendarIcon className="w-5 h-5" /><span className="font-roboto text-sm">Tham gia {userInfo.createdAt ? new Date(userInfo.createdAt).toLocaleDateString('vi-VN', { year: 'numeric' }) : 'N/A'}</span></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="tab mt-5 ml-5">
                  <Tabs defaultValue="learner-profile" className="w-full" onValueChange={(val) => {
                    if (val === 'instructor-profile' && userInfo.role === 'INSTRUCTOR') {
                      fetchInstructorData();
                      setIsEditingInstructor(false);
                    }
                  }}>

                    <div className={`${isMobile ? 'flex justify-center w-full mb-4' : 'flex justify-center w-full'}`}>
                      <TabsList className="flex gap-3 justify-between">
                        <TabsTrigger value="learner-profile" className='p-3 cursor-pointer hover:bg-gray-200 text-center'>Hồ sơ cá nhân</TabsTrigger>

                        {/*  Instructor Tab */}
                        {userInfo.role === 'INSTRUCTOR' && (
                          <TabsTrigger value="instructor-profile" className='p-3 cursor-pointer hover:bg-gray-200'>Hồ sơ giảng viên</TabsTrigger>
                        )}

                        <TabsTrigger value="account-setting" className='p-3 cursor-pointer hover:bg-gray-200'>Tài khoản</TabsTrigger>
                      </TabsList>
                    </div>

                    {/*USER PROFILE */}
                    <TabsContent value="learner-profile">
                      <div className="mt-6 bg-white rounded-2xl border-2 border-gray-200 shadow-sm p-6">
                        <div className={`grid gap-6 ${isMobile ? 'grid-cols-1' : 'grid-cols-2'}`}>
                          {/* Form Fields */}
                          <div>
                            <Label className="text-gray-400 text-sm mb-1">Họ và tên</Label>
                            {isEditing ? <Input value={formData.fullName} onChange={(e) => handleInputChange('fullName', e.target.value)} className={errors.fullName ? 'border-red-500' : ''} /> : <p className="font-bold text-gray-800">{userInfo.fullName}</p>}
                          </div>
                          <div><Label className="text-gray-400 text-sm mb-1">Email</Label><p className="font-bold text-gray-800">{userInfo.email}</p></div>
                          <div>
                            <Label className="text-gray-400 text-sm mb-1">Số điện thoại</Label>
                            {isEditing ? <Input value={formData.phone} onChange={(e) => handleInputChange('phone', e.target.value)} /> : <p className="font-bold text-gray-800">{userInfo.phone || 'Chưa cập nhật'}</p>}
                          </div>
                          <div>
                            <Label className="text-gray-400 text-sm mb-1">Ngày sinh</Label>
                            {isEditing ? <Input type="date" value={formData.dateOfBirth ? new Date(formData.dateOfBirth).toISOString().split('T')[0] : ""} onChange={(e) => handleInputChange('dateOfBirth', e.target.value ? new Date(e.target.value) : undefined)} /> : <p className="font-bold text-gray-800">{userInfo.dateOfBirth ? new Date(userInfo.dateOfBirth).toLocaleDateString('vi-VN') : 'Chưa có'}</p>}
                          </div>
                          <div>
                            <Label className="text-gray-400 text-sm mb-1">Địa chỉ</Label>
                            {isEditing ? <Input value={formData.address} onChange={(e) => handleInputChange('address', e.target.value)} /> : <p className="font-bold text-gray-800">{userInfo.address || 'Chưa cập nhật'}</p>}
                          </div>
                          <div className={isMobile ? '' : 'col-span-2'}>
                            <Label className="text-gray-400 text-sm mb-1">Tiểu sử</Label>
                            {isEditing ? <Textarea value={formData.bio} onChange={(e) => handleInputChange('bio', e.target.value)} /> : <p className="text-gray-800">{userInfo.bio || "Chưa cập nhật"}</p>}
                          </div>
                        </div>

                        <div className="mt-6 flex justify-end">
                          {!isEditing ? (
                            <Button onClick={() => setIsEditing(true)} className="bg-[#371D8C] text-white font-bold">Chỉnh sửa</Button>
                          ) : (
                            <div className="flex gap-2">
                              <Button variant="outline" onClick={() => setIsEditing(false)} className="text-red-700 border-red-700">Hủy</Button>
                              <Button onClick={handleSubmitEdit} className="bg-green-600 text-white">Lưu thay đổi</Button>
                            </div>
                          )}
                        </div>
                      </div>
                    </TabsContent>

                    {/* ---  INSTRUCTOR PROFILE --- */}
                    {userInfo.role === 'INSTRUCTOR' && (
                      <TabsContent value="instructor-profile">
                        <div className="mt-6 bg-white rounded-2xl border-2 border-gray-200 shadow-sm p-6">
                          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                            <div>
                              <h3 className="font-bold text-xl text-gray-900">Thông tin Giảng viên</h3>
                              <p className="text-gray-500 text-sm">Quản lý hồ sơ giảng dạy, chuyên môn và bằng cấp</p>
                            </div>
                            {!isEditingInstructor ? (
                              <Button onClick={() => setIsEditingInstructor(true)} className="bg-[#371D8C] text-white font-bold">Cập nhật thông tin</Button>
                            ) : (
                              <div className="flex gap-2">
                                <Button variant="outline" onClick={() => setIsEditingInstructor(false)} className="border-red-500 text-red-500">Hủy bỏ</Button>
                                <Button onClick={handleInstructorUpdateSubmit} className="bg-green-600 text-white">Lưu thay đổi</Button>
                              </div>
                            )}
                          </div>

                          {isLoadingInstructor ? (
                            <div className="text-center py-10">Đang tải dữ liệu...</div>
                          ) : (
                            <div className="space-y-8">
                              {isEditingInstructor && (
                                <div className="bg-blue-50 p-6 rounded-xl border border-blue-100 mb-6 animate-in fade-in zoom-in-95">
                                  <h4 className="font-bold text-blue-900 mb-4">Chỉnh sửa thông tin thanh toán</h4>
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div><Label>Tên ngân hàng</Label><Input value={instructorFormData.bank_name} onChange={(e) => setInstructorFormData({ ...instructorFormData, bank_name: e.target.value })} className="bg-white mt-1" placeholder="VD: Vietcombank" /></div>
                                    <div><Label>Số tài khoản</Label><Input value={instructorFormData.account_number} onChange={(e) => setInstructorFormData({ ...instructorFormData, account_number: e.target.value })} className="bg-white mt-1" /></div>
                                    <div className="md:col-span-2"><Label>Chủ tài khoản</Label><Input value={instructorFormData.account_holder_name} onChange={(e) => setInstructorFormData({ ...instructorFormData, account_holder_name: e.target.value })} className="bg-white mt-1" /></div>
                                  </div>
                                  <p className="text-xs text-blue-600 mt-3 italic">* Lưu ý: Để chỉnh sửa bằng cấp, vui lòng gửi yêu cầu xét duyệt mới.</p>
                                </div>
                              )}

                              <div className={isEditingInstructor ? "opacity-40 pointer-events-none grayscale-[0.5]" : ""}>
                                <div className="mb-6">
                                  <h4 className="font-bold text-gray-800 mb-3 flex items-center gap-2"><UserIcon className="w-5 h-5" /> Thông tin cá nhân</h4>
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg border">
                                    <div><Label className="text-gray-400 text-xs">Họ và tên</Label><p className="text-sm font-semibold mt-1">{userInfo.fullName}</p></div>
                                    <div><Label className="text-gray-400 text-xs">Email</Label><p className="text-sm font-semibold mt-1">{userInfo.email}</p></div>
                                    <div><Label className="text-gray-400 text-xs">SĐT</Label><p className="text-sm mt-1">{userInfo.phone || "N/A"}</p></div>
                                    <div><Label className="text-gray-400 text-xs">Địa chỉ</Label><p className="text-sm mt-1">{userInfo.address || "N/A"}</p></div>
                                  </div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                  <div className="p-4 border rounded-lg shadow-sm">
                                    <Label className="text-gray-400 text-sm mb-1">Xác thực</Label>
                                    <div className="mt-1">{instructorInfo?.isVerified ? <Badge className="bg-green-500"><CheckBadgeIcon className="w-4 h-4 mr-1" /> Đã xác thực</Badge> : <Badge className="bg-yellow-500">Chờ xác thực</Badge>}</div>
                                  </div>
                                  <div className="p-4 border rounded-lg shadow-sm">
                                    <Label className="text-gray-400 text-sm mb-1">Trạng thái</Label>
                                    <p className={`font-bold mt-1 ${instructorInfo?.status === 'Active' ? 'text-green-600' : 'text-red-500'}`}>{instructorInfo?.status || "N/A"}</p>
                                  </div>
                                </div>

                                <hr className="my-6" />
                                <div>
                                  <h4 className="font-bold text-lg text-gray-900 mb-4 flex items-center gap-2"><AcademicCapIcon className="w-6 h-6 text-[#371D8C]" /> Bằng cấp & Chứng chỉ</h4>
                                  {qualifications.length === 0 ? (
                                    <div className="text-center py-8 bg-gray-50 rounded border border-dashed"><p className="text-gray-500">Chưa có bằng cấp.</p></div>
                                  ) : (
                                    <div className="grid grid-cols-1 gap-4">
                                      {qualifications.map((qual) => (
                                        <div key={qual.instructor_qualification_id} className="border rounded-xl p-4 bg-white hover:shadow-sm">
                                          <div className="flex flex-col md:flex-row justify-between gap-4">
                                            <div className="flex-1">
                                              <div className="flex items-center gap-2 mb-2">
                                                <Badge variant="outline" className="text-[#371D8C] border-[#371D8C]">{qual.type}</Badge>
                                                <span className="text-xs text-gray-400">{new Date(qual.issue_date).toLocaleDateString('vi-VN')}</span>
                                              </div>
                                              <h5 className="font-bold text-lg text-gray-800">{qual.title}</h5>
                                              <p className="text-sm text-gray-600">Chuyên môn: <b>{qual.specialization?.specialization_name}</b></p>
                                            </div>
                                            <div>
                                              <Badge className={qual.status === 'Approved' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}>
                                                {qual.status === 'Approved' ? 'Đã duyệt' : qual.status === 'Rejected' ? 'Từ chối' : 'Chờ duyệt'}
                                              </Badge>
                                            </div>
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      </TabsContent>
                    )}
                    <TabsContent value="account-setting">
                      <div className="mt-6 bg-white rounded-2xl border-2 border-gray-200 shadow-sm p-6">
                        <h3 className="font-bold text-xl text-gray-900 mb-6">Tài khoản</h3>
                        <div className="space-y-4">
                          <div className="flex justify-between items-center pb-4 border-b">
                            <div><p className="font-bold text-gray-800">Mật khẩu</p><p className="text-gray-400 text-sm">**********</p></div>
                            <Button variant="outline">Đổi mật khẩu</Button>
                          </div>
                          <div className="flex justify-between">
                            <div className="flex justify-between items-center pb-4 border-b">
                              <div><p className="font-bold text-gray-800">Email</p><p className="text-gray-400 text-xs">{userInfo.email}</p></div>
                            </div>
                            {accountSecurity?.email_verified ? (
                              <div>
                                <Badge className="bg-green-700 text-white">
                                    Email đã được xác thực
                                </Badge>
                                </div>
                            ) : (
                              <div>
                              <Link href={`/verify-email/`}>
                                <Button variant={'outline'} className="border-2 border-amber-700 text-amber-700 cursor-pointer hover:text-white hover:bg-amber-700">
                                  Xác thực email
                                </Button>
                              </Link>
                              </div>
                            )}
                            
                          </div>
                          <div className="flex justify-between items-center pb-4 border-b">
                            <div><p className="font-bold text-gray-800">User ID</p><p className="text-gray-400 text-xs">{userInfo.user_id}</p></div>
                          </div>
                          <Button variant="outline" className="text-red-500 border-red-500 hover:bg-red-50 hover:text-red-600 cursor-pointer" onClick={handleLogout}>Đăng xuất</Button>
                        </div>
                      </div>
                    </TabsContent>
                  </Tabs>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="mt-6 text-center"><p>Vui lòng đăng nhập để xem hồ sơ.</p></div>
        )}
      </div>
    </ProtectedRoute>
  );
}