"use client";
import React, { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { useAuth } from "@/app/context/AuthContext";
import { useIsMobile } from "@/hooks/useIsMobile";
import api from "@/app/lib/axios";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { GraduationCap, Award, Upload, FileImage, X, AlertCircle, Plus, History, Calendar, MapPin, CheckCircle, Clock, XCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";

interface Specialization {
  specialization_id: string;
  instructor_id?: string;
  specialization_name: string;
  isVerified: boolean;
  createdAt?: string;
  updatedAt?: string;
}

interface QualificationHistory {
  instructor_qualification_id: string;
  instructor_id?: string;
  specialization_id?: string;
  specialization_name: string;
  type: "Degree" | "Certificate";
  title: string;
  issue_date: string;
  expire_date?: string;
  issue_place: string;
  status: "Pending" | "Approved" | "Rejected";
  images?: string[];
  createdAt: string;
  updatedAt: string;
  rejection_reason?: string;
}

interface InstructorQualificationForm {
  specialization_name: string;
  type: "Degree" | "Certificate";
  title: string;
  issue_date: string;
  expire_date?: string;
  issue_place: string;
}

interface FormErrors {
  [key: string]: string;
}

const MAX_IMAGES = 6;
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'application/pdf'];

export default function BecomeInstructorPage() {
  const isMobile = useIsMobile();
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [specializations, setSpecializations] = useState<Specialization[]>([]);
  const [loadingSpecializations, setLoadingSpecializations] = useState(true);

  const [showAddSpecDialog, setShowAddSpecDialog] = useState(false);
  const [newSpecializationName, setNewSpecializationName] = useState("");

  const [showHistoryDialog, setShowHistoryDialog] = useState(false);
  const [hasPendingQualification, setHasPendingQualification] = useState(false);
  const [qualificationHistory, setQualificationHistory] = useState<QualificationHistory[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  const [qualification, setQualification] = useState<InstructorQualificationForm>({
    specialization_name: "",
    type: "Degree",
    title: "",
    issue_date: "",
    issue_place: ""
  });

  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [errors, setErrors] = useState<FormErrors>({});
  const [existingQualifications, setExistingQualifications] = useState<string[]>([]);

  useEffect(() => {
    const fetchExistingQualifications = async () => {
      if (!user) return;

      try {
        const response = await api.get('/instructor-qualifications/my-qualifications');
        if (response.data && Array.isArray(response.data.data)) {
          const qualifications = response.data.data;
          /* cấu trúc array.some((element) -> condition) */
          const hasPending = qualifications.some((q: QualificationHistory) => q.status === "Pending");
          setHasPendingQualification(hasPending);

          const existingSpecs = qualifications.map((q: { specialization_name: string }) => q.specialization_name);
          setExistingQualifications(existingSpecs);
        }
      } catch (error) {
        console.error("Lỗi khi tải bằng cấp hiện có:", error);
      }
    };
    fetchExistingQualifications();
  }, [user]);

  useEffect(() => {
    const fetchSpecializations = async () => {
      try {
        setLoadingSpecializations(true);
        const response = await api.get('/specializations');
        if (response.data && Array.isArray(response.data.data)) {
          setSpecializations(response.data.data);
        } else {
          setSpecializations([]);
          toast.error("Định dạng dữ liệu không đúng");
        }
      } catch (error) {
        console.error("❌ Lỗi khi tải chuyên ngành:", error);
        toast.error("Không thể tải danh sách chuyên ngành");
        setSpecializations([]);
      } finally {
        setLoadingSpecializations(false);
      }
    };
    fetchSpecializations();
  }, []);

  const handleInputChange = (field: keyof InstructorQualificationForm, value: string) => {
    setQualification(prev => ({
      ...prev,
      [field]: value
    }));
    if (errors[field]) {
      const newErrors = { ...errors };
      delete newErrors[field];
      setErrors(newErrors);
    }
  };

  const handleAddNewSpecialization = () => {
    if (!newSpecializationName || newSpecializationName.trim().length < 3) {
      toast.error("Tên chuyên ngành phải có ít nhất 3 ký tự");
      return;
    }

    const trimmedName = newSpecializationName.trim();

    const newSpec: Specialization = {
      specialization_id: `temp_${Date.now()}`,
      specialization_name: trimmedName,
      isVerified: false
    };

    setSpecializations(prev => [...prev, newSpec]);

    setQualification(prev => ({
      ...prev,
      specialization_name: trimmedName
    }));

    toast.success(`Đã chọn chuyên ngành: ${trimmedName}`, {
      description: "Chuyên ngành mới sẽ được tạo khi bạn gửi đăng ký và cần admin phê duyệt"
    });

    setShowAddSpecDialog(false);
    setNewSpecializationName("");
  };

  const handleViewHistory = async () => {
    if (!user) {
      toast.error("Bạn phải đăng nhập để xem lịch sử!");
      return;
    }

    setShowHistoryDialog(true);
    setLoadingHistory(true);

    try {
      const response = await api.get('/instructor-qualifications/my-qualifications');
      if (response.data && Array.isArray(response.data.data)) {
        const qualifications = response.data.data;
        setQualificationHistory(qualifications);
      } else {
        console.error("Response data is not array:", response.data);
        setQualificationHistory([]);
      }
    } catch (error) {
      console.error("Lỗi khi tải lịch sử:", error);
      toast.error("Không thể tải lịch sử đăng ký");
      setQualificationHistory([]);
    } finally {
      setLoadingHistory(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Approved":
        return (
          <Badge className="bg-green-100 text-green-700 hover:bg-green-200">
            <CheckCircle className="w-3 h-3 mr-1" />
            Đã duyệt
          </Badge>
        );
      case "Pending":
        return (
          <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-200">
            <Clock className="w-3 h-3 mr-1" />
            Chờ duyệt
          </Badge>
        );
      case "Rejected":
        return (
          <Badge className="bg-red-100 text-red-700 hover:bg-red-200">
            <XCircle className="w-3 h-3 mr-1" />
            Từ chối
          </Badge>
        );
      default:
        return (
          <Badge className="bg-gray-100 text-gray-700">
            {status}
          </Badge>
        );
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);

    if (selectedFiles.length + files.length > MAX_IMAGES) {
      toast.error(`Chỉ được upload tối đa ${MAX_IMAGES} ảnh!`);
      return;
    }

    const validFiles: File[] = [];
    for (const file of files) {
      if (file.size > MAX_FILE_SIZE) {
        toast.error(`File ${file.name} vượt quá 10MB!`);
        continue;
      }

      if (!ALLOWED_TYPES.includes(file.type)) {
        toast.error(`File ${file.name} phải là JPG, PNG hoặc PDF!`);
        continue;
      }

      validFiles.push(file);
    }

    setSelectedFiles(prev => [...prev, ...validFiles]);
    /* tham khao AI de toi uu on change khi chon image, noted */
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleRemoveFile = (index: number) => {
    /* 
    const newArray = array.filter(element => condition);
    setSelectedFiles(prev => prev.filter((file, i) => i !== index));
    file đang chọn để xoá -> index
    i là index để chạy và tạo mảng mới, gặp index là bỏ không lấy ảnh đó.  
    */
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};
    if (!qualification.specialization_name || qualification.specialization_name.trim().length === 0) {
      newErrors.specialization_name = "Chuyên ngành không được để trống";
    } else if (existingQualifications.includes(qualification.specialization_name)) {
      newErrors.specialization_name = "Bạn đã đăng ký chuyên ngành này rồi!";
      toast.error("Bạn đã có bằng cấp/chứng chỉ cho chuyên ngành này. Vui lòng chọn chuyên ngành khác!");
    }
    if (!qualification.title || qualification.title.trim().length < 3) {
      newErrors.title = "Tiêu đề phải có ít nhất 3 ký tự";
    }
    if (!qualification.issue_date) {
      newErrors.issue_date = "Ngày cấp không được để trống";
    } else {
      const issueDate = new Date(qualification.issue_date);
      const today = new Date();
      if (issueDate > today) {
        newErrors.issue_date = "Ngày cấp không được trong tương lai";
      }
    }
    if (qualification.expire_date) {
      const expireDate = new Date(qualification.expire_date);
      const issueDate = new Date(qualification.issue_date);
      if (expireDate <= issueDate) {
        newErrors.expire_date = "Ngày hết hạn phải sau ngày cấp";
      }
    }
    if (!qualification.issue_place || qualification.issue_place.trim().length < 3) {
      newErrors.issue_place = "Nơi cấp phải có ít nhất 3 ký tự";
    }
    if (selectedFiles.length === 0) {
      toast.warning("Bạn chưa upload ảnh minh chứng!");
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast.error("Bạn phải đăng nhập để đăng ký làm giảng viên!");
      return;
    }
    if (!validateForm()) {
      toast.error("Vui lòng kiểm tra lại thông tin!");
      return;
    }
    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('specialization_name', qualification.specialization_name);
      formData.append('type', qualification.type);
      formData.append('title', qualification.title);
      formData.append('issue_date', qualification.issue_date);
      if (qualification.expire_date) {
        formData.append('expire_date', qualification.expire_date);
      }
      formData.append('issue_place', qualification.issue_place);

      selectedFiles.forEach(file => {
        formData.append('images', file);
      });

      const response = await api.post('/instructor-qualifications', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.data) {
        toast.success("Đăng ký bằng cấp thành công! Vui lòng đợi phê duyệt.");
        toast.info("Sau khi admin phê duyệt, bạn sẽ trở thành giảng viên và có thể tạo khóa học!");
        setQualification({
          specialization_name: "",
          type: "Degree",
          title: "",
          issue_date: "",
          issue_place: ""
        });
        setSelectedFiles([]);
      }
    } catch (error: unknown) {
      console.error("Lỗi khi đăng ký:", error);
      const err = error as { response?: { data?: { message?: string } } };
      const errorMessage = err.response?.data?.message || "Đăng ký thất bại! Vui lòng thử lại.";
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={`w-full min-h-screen bg-linear-to-br from-purple-50 via-white to-blue-50 ${isMobile ? 'p-4' : 'p-10'}`}>
      <div className={`mb-6 ${isMobile ? '' : 'ml-2'}`}>
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/">Trang chủ</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink href="/become-lecturer">Đăng ký giảng viên</BreadcrumbLink>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      <div className="text-center mb-8">
        <div className="flex items-center justify-center gap-4 mb-3 flex-wrap">
          <h1 className={`font-rosario-bold text-gray-900 ${isMobile ? 'text-2xl' : 'text-4xl'}`}>
            Trở thành giảng viên của Learnary ngay hôm nay!
          </h1>
        </div>
        <p className="font-roboto text-gray-600 max-w-2xl mx-auto">
          Chia sẻ kiến thức của bạn với hàng nghìn học viên trên toàn thế giới
        </p>
        <Button
          variant="outline"
          size={isMobile ? "sm" : "default"}
          onClick={handleViewHistory}
          className="font-roboto-bold border-purple-300 text-purple-600 hover:bg-purple-50 cursor-pointer mt-5 ">
          <History className="w-4 h-4 mr-2" />
          Lịch sử đăng ký
        </Button>
      </div>

      <Alert className="max-w-screen mx-auto mb-6 border-blue-200 bg-blue-50">
        <AlertCircle className="h-4 w-4 text-blue-600" />
        <AlertDescription className="font-roboto text-blue-900">
          Bạn có thể upload tối đa <strong>6 ảnh</strong> minh chứng (JPG, PNG, PDF), mỗi file tối đa <strong>10MB</strong>. <strong>Bạn chỉ có thể tạo 1 đơn đăng ký đang chờ phê duyệt</strong>
        </AlertDescription>
      </Alert>

      {hasPendingQualification && (
        <Alert className="max-w-screen mx-auto mb-6 border-amber-500 bg-amber-50">
          <Clock className="h-4 w-4 text-amber-600" />
          <AlertDescription className="font-roboto text-amber-900">
            <strong>Bạn đã có đơn đăng ký đang chờ phê duyệt!</strong> Vui lòng đợi admin xét duyệt trước khi tạo đơn mới. Bạn có thể xem chi tiết trong <button onClick={handleViewHistory} className="underline font-bold hover:text-amber-700">Lịch sử đăng ký</button>.
          </AlertDescription>
        </Alert>
      )}

      <form onSubmit={handleSubmit} className={`max-w-screen mx-auto ${isMobile ? 'space-y-4' : 'space-y-6'} ${hasPendingQualification ? 'opacity-60 pointer-events-none' : ''}`}>
        <Card className="border-2 border-gray-200 shadow-lg hover:shadow-xl transition-shadow">
          <CardHeader className="flex flex-col h-fit p-5 bg-linear-to-r from-purple-100 to-blue-100">
            <div className="flex items-center gap-3">
              {qualification.type === "Degree" ? (
                <GraduationCap className="w-6 h-6 text-purple-600" />
              ) : (
                <Award className="w-6 h-6 text-blue-600" />
              )}
              <CardTitle className="font-rosario-bold text-gray-900">
                Thông tin bằng cấp/chứng chỉ
              </CardTitle>
            </div>
            <CardDescription className="font-roboto">
              Vui lòng điền đầy đủ thông tin và upload ảnh minh chứng
            </CardDescription>
          </CardHeader>

          <CardContent className={`${isMobile ? 'pt-4 space-y-4' : 'pt-6 space-y-6'}`}>
            <div className={`grid gap-6 ${isMobile ? 'grid-cols-1' : 'grid-cols-2'}`}>
              <div>
                <Label className="text-gray-700 font-roboto-bold mb-2">
                  Loại <span className="text-red-500">*</span>
                </Label>
                <Select

                  value={qualification.type}
                  onValueChange={(value: "Degree" | "Certificate") => handleInputChange('type', value)}

                >
                  <SelectTrigger className={`font-roboto  cursor-pointer ${errors.type ? 'border-red-500' : ''}`}>
                    <SelectValue placeholder="Chọn loại" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Degree" className="font-roboto ">
                      <div className="flex items-center gap-2 cursor-pointer">
                        <GraduationCap className="w-4 h-4" />
                        Bằng cấp (Degree)
                      </div>
                    </SelectItem>
                    <SelectItem value="Certificate" className="font-roboto">
                      <div className="flex items-center gap-2  cursor-pointer">
                        <Award className="w-4 h-4" />
                        Chứng chỉ (Certificate)
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
                {errors.type && (
                  <p className="text-red-500 text-xs mt-1 font-roboto">{errors.type}</p>
                )}
              </div>

              <div>
                <Label className="text-gray-700 font-roboto-bold mb-2 ">
                  Chuyên ngành <span className="text-red-500">*</span>
                </Label>

                <Select
                  value={qualification.specialization_name}
                  onValueChange={(value) => {
                    if (value === "__add_new__") {
                      setShowAddSpecDialog(true);
                    } else {
                      handleInputChange('specialization_name', value);
                    }
                  }}
                >
                  <SelectTrigger className={`font-roboto \ cursor-pointer ${errors.specialization_name ? 'border-red-500' : ''}`}>
                    <SelectValue placeholder={loadingSpecializations ? "Đang tải..." : "Chọn chuyên ngành"} />
                  </SelectTrigger>
                  <SelectContent>
                    {specializations.map((spec) => {
                      const alreadyRegistered = existingQualifications.includes(spec.specialization_name);

                      return (
                        <SelectItem
                          key={spec.specialization_id}
                          value={spec.specialization_name}
                          className="font-roboto  cursor-pointer"
                          disabled={alreadyRegistered}
                        >
                          {spec.specialization_name}
                          {alreadyRegistered && (
                            <span className="ml-2 text-xs text-green-600">✓ Đã đăng ký</span>
                          )}
                          {!alreadyRegistered && !spec.isVerified && (
                            <span className="ml-2 text-xs text-amber-600">⏳ Chờ duyệt</span>
                          )}
                        </SelectItem>
                      );
                    })}

                    {specializations.length > 0 && (
                      <div className="border-t border-gray-200 my-1"></div>
                    )}

                    <SelectItem value="__add_new__" className="font-roboto-bold text-purple-600 cursor-pointer">
                      <div className="flex items-center gap-2">
                        <Plus className="w-4 h-4" />
                        Thêm chuyên ngành mới
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
                {errors.specialization_name && (
                  <p className="text-red-500 text-xs mt-1 font-roboto">{errors.specialization_name}</p>
                )}
                {qualification.specialization_name && (
                  <p className="text-green-600 text-xs mt-1 font-roboto flex items-center gap-1">
                    ✓ Đã chọn: <strong>{qualification.specialization_name}</strong>
                  </p>
                )}
              </div>

              <div className={isMobile ? '' : 'col-span-2'}>
                <Label className="text-gray-700 font-roboto-bold mb-2">
                  Tiêu đề bằng cấp/chứng chỉ <span className="text-red-500">*</span>
                </Label>
                <Input
                  value={qualification.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  placeholder="VD: Cử nhân Khoa học Máy tính, Chứng chỉ Google Cloud..."
                  className={`font-roboto ${errors.title ? 'border-red-500' : ''}`}
                />
                {errors.title && (
                  <p className="text-red-500 text-xs mt-1 font-roboto">{errors.title}</p>
                )}
              </div>

              <div className={isMobile ? '' : 'col-span-2'}>
                <Label className="text-gray-700 font-roboto-bold mb-2">
                  Nơi cấp <span className="text-red-500">*</span>
                </Label>
                <Input
                  value={qualification.issue_place}
                  onChange={(e) => handleInputChange('issue_place', e.target.value)}
                  placeholder="VD: Đại học Bách Khoa, Google, AWS..."
                  className={`font-roboto ${errors.issue_place ? 'border-red-500' : ''}`}
                />
                {errors.issue_place && (
                  <p className="text-red-500 text-xs mt-1 font-roboto">{errors.issue_place}</p>
                )}
              </div>

              <div>
                <Label className="text-gray-700 font-roboto-bold mb-2">
                  Ngày cấp <span className="text-red-500">*</span>
                </Label>
                <Input
                  type="date"
                  value={qualification.issue_date}
                  onChange={(e) => handleInputChange('issue_date', e.target.value)}
                  className={`font-roboto ${errors.issue_date ? 'border-red-500' : ''}`}
                />
                {errors.issue_date && (
                  <p className="text-red-500 text-xs mt-1 font-roboto">{errors.issue_date}</p>
                )}
              </div>

              <div>
                <Label className="text-gray-700 font-roboto-bold mb-2">
                  Ngày hết hạn <span className="text-gray-400">(Không bắt buộc)</span>
                </Label>
                <Input
                  type="date"
                  value={qualification.expire_date || ''}
                  onChange={(e) => handleInputChange('expire_date', e.target.value)}
                  className={`font-roboto ${errors.expire_date ? 'border-red-500' : ''}`}
                />
                {errors.expire_date && (
                  <p className="text-red-500 text-xs mt-1 font-roboto">{errors.expire_date}</p>
                )}
              </div>
            </div>

            <div className="pt-4 border-t border-gray-200">
              <Label className="text-gray-700 font-roboto-bold mb-3 block">
                Ảnh minh chứng <span className="text-gray-400">({selectedFiles.length}/{MAX_IMAGES})</span>
              </Label>

              <div className="flex flex-wrap gap-3 mb-4">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,application/pdf"
                  multiple
                  onChange={handleFileSelect}
                  className="hidden"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={selectedFiles.length >= MAX_IMAGES}
                  className="border-2 border-dashed border-purple-400 text-purple-600 hover:bg-purple-50 font-roboto-bold cursor-pointer"
                >
                  <Upload className="w-5 h-5 mr-2" />
                  Thêm ảnh
                </Button>
                <p className="text-sm text-gray-500 font-roboto flex items-center">
                  JPG, PNG, PDF • Tối đa 10MB/file
                </p>
              </div>

              {selectedFiles.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {selectedFiles.map((file, index) => (
                    <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                      <div className="shrink-0">
                        {file.type === 'application/pdf' ? (
                          <FileImage className="w-10 h-10 text-red-500" />
                        ) : (
                          <div className="relative w-10 h-10">
                            <Image
                              src={URL.createObjectURL(file)}
                              alt={file.name}
                              fill
                              className="object-cover rounded"
                            />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-roboto-bold text-gray-900 truncate">
                          {file.name}
                        </p>
                        <p className="text-xs text-gray-500 font-roboto">
                          {formatFileSize(file.size)}
                        </p>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveFile(index)}
                        className="shrink-0 text-red-600 hover:bg-red-50"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-center pt-4">
          <Button
            type="submit"
            disabled={isSubmitting || hasPendingQualification}
            className={`bg-linear-to-r from-purple-600 cursor-pointer to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-roboto-bold ${isMobile ? 'w-full' : 'w-auto px-12'} py-6 text-lg shadow-lg ${hasPendingQualification ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {isSubmitting ? (
              <div className="flex items-center">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                Đang xử lý...
              </div>
            ) : hasPendingQualification ? (
              "Đã có đơn đang chờ duyệt"
            ) : (
              "Gửi đăng ký"
            )}
          </Button>
        </div>
      </form>

      <Dialog open={showAddSpecDialog} onOpenChange={setShowAddSpecDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="font-rosario-bold flex items-center gap-2">
              <Plus className="w-5 h-5 text-purple-600" />
              Thêm chuyên ngành mới
            </DialogTitle>
            <DialogDescription className="font-roboto">
              Nhập tên chuyên ngành của bạn. Chuyên ngành sẽ cần được admin phê duyệt sau khi bạn gửi đăng ký.
            </DialogDescription>
          </DialogHeader>

          <div className="py-4">
            <Label htmlFor="new-spec-name" className="text-gray-700 font-roboto-bold mb-2 block">
              Tên chuyên ngành <span className="text-red-500">*</span>
            </Label>
            <Input
              id="new-spec-name"
              value={newSpecializationName}
              onChange={(e) => setNewSpecializationName(e.target.value)}
              placeholder="VD: Khoa học Dữ liệu, Thiết kế Đồ họa..."
              className="font-roboto"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleAddNewSpecialization();
                }
              }}
            />
            <p className="text-xs text-gray-500 mt-2 font-roboto">
              Tên chuyên ngành phải có ít nhất 3 ký tự
            </p>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setShowAddSpecDialog(false);
                setNewSpecializationName("");
              }}
              className="font-roboto"
            >
              Hủy
            </Button>
            <Button
              type="button"
              onClick={handleAddNewSpecialization}
              className="bg-linear-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-roboto-bold cursor-pointer"
            >
              Xác nhận
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showHistoryDialog} onOpenChange={setShowHistoryDialog}>
        <DialogContent className="sm:max-w-4xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle className="font-rosario-bold flex items-center gap-2 text-2xl">
              <History className="w-6 h-6 text-purple-600" />
              Lịch sử đăng ký giảng viên
            </DialogTitle>
            <DialogDescription className="font-roboto">
              Danh sách tất cả bằng cấp/chứng chỉ bạn đã đăng ký
            </DialogDescription>
          </DialogHeader>

          <ScrollArea className="max-h-[60vh] pr-4">
            {loadingHistory ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
                <p className="ml-3 font-roboto text-gray-600">Đang tải...</p>
              </div>
            ) : qualificationHistory.length === 0 ? (
              <div className="text-center py-12">
                <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="font-roboto text-gray-600">Bạn chưa có đơn đăng ký nào</p>
              </div>
            ) : (
              <div className="space-y-4">
                {qualificationHistory.map((qual, index) => (
                  <Card key={qual.instructor_qualification_id} className="border-2 hover:shadow-md transition-shadow">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          {qual.type === "Degree" ? (
                            <div className="p-2 bg-purple-100 rounded-lg">
                              <GraduationCap className="w-5 h-5 text-purple-600" />
                            </div>
                          ) : (
                            <div className="p-2 bg-blue-100 rounded-lg">
                              <Award className="w-5 h-5 text-blue-600" />
                            </div>
                          )}
                          <div>
                            <CardTitle className="font-roboto-bold text-lg">
                              {qual.title}
                            </CardTitle>
                            <CardDescription className="font-roboto text-sm mt-1">
                              {qual.specialization_name}
                            </CardDescription>
                          </div>
                        </div>
                        {getStatusBadge(qual.status)}
                      </div>
                    </CardHeader>

                    <CardContent className="space-y-3">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                        <div className="flex items-center gap-2 text-gray-700">
                          <MapPin className="w-4 h-4 text-gray-500" />
                          <span className="font-roboto">
                            <strong>Nơi cấp:</strong> {qual.issue_place}
                          </span>
                        </div>

                        <div className="flex items-center gap-2 text-gray-700">
                          <Calendar className="w-4 h-4 text-gray-500" />
                          <span className="font-roboto">
                            <strong>Ngày cấp:</strong> {formatDate(qual.issue_date)}
                          </span>
                        </div>

                        {qual.expire_date && (
                          <div className="flex items-center gap-2 text-gray-700">
                            <Calendar className="w-4 h-4 text-gray-500" />
                            <span className="font-roboto">
                              <strong>Hết hạn:</strong> {formatDate(qual.expire_date)}
                            </span>
                          </div>
                        )}

                        <div className="flex items-center gap-2 text-gray-700">
                          <Clock className="w-4 h-4 text-gray-500" />
                          <span className="font-roboto">
                            <strong>Đăng ký:</strong> {formatDate(qual.createdAt)}
                          </span>
                        </div>
                      </div>

                      {qual.status === "Rejected" && qual.rejection_reason && (
                        <Alert className="border-red-200 bg-red-50">
                          <XCircle className="h-4 w-4 text-red-600" />
                          <AlertDescription className="font-roboto text-red-900">
                            <strong>Lý do từ chối:</strong> {qual.rejection_reason}
                          </AlertDescription>
                        </Alert>
                      )}

                      {qual.images && qual.images.length > 0 && (
                        <div>
                          <p className="text-xs font-roboto-bold text-gray-700 mb-2">
                            Ảnh minh chứng ({qual.images.length})
                          </p>
                          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
                            {qual.images.map((imageUrl, imgIndex) => (
                              <div key={`${qual.instructor_qualification_id}-img-${imgIndex}`} className="relative w-full aspect-square rounded border overflow-hidden group cursor-pointer hover:ring-2 hover:ring-purple-400 transition-all">
                                <Image src={imageUrl} alt={`Minh chứng ${imgIndex + 1}`} fill className="object-cover"/>
                                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all flex items-center justify-center">
                                  <span className="text-white opacity-0 group-hover:opacity-100 text-xs font-roboto-bold">
                                    #{imgIndex + 1}
                                  </span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </CardContent>
                    {index < qualificationHistory.length - 1 && (
                      <Separator className="mt-4" />
                    )}
                  </Card>
                ))}
              </div>
            )}
          </ScrollArea>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setShowHistoryDialog(false)}className="font-roboto-bold cursor-pointer">
              Đóng
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
