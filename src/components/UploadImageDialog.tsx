"use client"
//sẽ phát triển component này từ update thumbnail thành update image bất kỳ
import { useRef, useState } from "react";
import { Loader2, Upload, X } from 'lucide-react';
import Image from "next/image";
import { Button } from "./ui/button";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import { toast } from "sonner";
import api from "@/app/lib/axios";
interface ImageUploadProps {
    userId:string,
    courseId:string,
    currentImageUrl?: string,
    disabled?: boolean,
    onUploadSuccess: (url: string) => void;
}
export function ImageUploadDialog({ currentImageUrl, onUploadSuccess, courseId, userId, disabled }: ImageUploadProps) {
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | "">(currentImageUrl || "");
    const [isUpLoading, setIsUpLoading] = useState<boolean>(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const allowedExt = ['jpd','png','jpeg']
    const allowedMime = ['image/jpeg', 'image/png','image/jpg']
    const uploadFile = async (file: File) => {
        setIsUpLoading(true)
        try {
            const formData = new FormData();
            formData.append('file',file);
            formData.append('course_id',courseId)
            formData.append('user_id',userId)
            const res = await api.put("/courses/updateThumbnail", formData, {
                headers:{'Content-Type': 'multipart/form-data'},
            })
            const uploadedURL = (res.data.data || res.data).thumbnail;
            if(!uploadedURL) {
                toast.error("Upload thumbnail bị lỗi, vui lòng thử lại sau")
            } else {
                setPreviewUrl(uploadedURL);
                onUploadSuccess(uploadedURL);
                toast.success("Thay đổi thumbnail thành công!")
            }
        } catch (error) {
            console.log(error)
            toast.error("Có lỗi trong quá trình upload ảnh, vui lòng thử lại!")
        } finally {
            setIsUpLoading(false)
        }
    }
    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if(!file) return   
        if(!allowedMime.includes(file.type)) {
            toast.error("Vui lòng chọn file ảnh JPG hoặc PNG")
            return 
        }
        const ext = file.name.split('.').pop()?.toLowerCase();
        if(!ext || !allowedExt.includes(ext)) {
            toast.error("Vui lòng chọn file ảnh có đuôi JPG, PNG")
            return 
        }
        const maxSize = 10 * 1024 * 1024 //10MB
        if(file.size > maxSize) {
            toast.error("Dung lượng ảnh vượt quá 10MB!")
            return
        }
        setSelectedFile(file);
        const objectUrl = URL.createObjectURL(file);
        setPreviewUrl(objectUrl);
        await uploadFile(file)
    }
    const handleRemove = async () => {
        setSelectedFile(null)
        setIsUpLoading(false)
        onUploadSuccess("")
        if(fileInputRef.current) {
            fileInputRef.current.value=""
        }
    }

    return (
        <div className="space-y-3">
            {previewUrl && (
                <div className="relative group">
                    <div className="relative w-full h-48 border-2 border-dashed border-slate-300 rounded-lg overflow-hidden bg-slate-50">
                        <Image src={previewUrl} alt="Thumbnail preview" className="w-full h-full object-cover" fill/>
                        {isUpLoading && (
                            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                                <Loader2 className="animate-spin text-white" size={32} />
                            </div>
                        )}
                    </div>

                    {!isUpLoading && (
                        <Button type="button" variant="destructive" size="icon" className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity" onClick={handleRemove}>
                            <X size={16} />
                        </Button>
                    )}
                </div>
            )}

            <div className="flex gap-2">
                <Input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileSelect}  disabled={isUpLoading || disabled} className="hidden"  id="thumbnail-upload" />
                <Label htmlFor="thumbnail-upload" className={`flex-1 ${disabled ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'}`} >
                    <div className={` flex items-center justify-center gap-2  h-10 px-4 py-2  border-2 border-dashed rounded-md transition-colors ${isUpLoading || disabled ? 'border-slate-300 bg-slate-100 cursor-not-allowed' : 'border-slate-300 hover:border-primary hover:bg-primary/5' }`}>
                        {isUpLoading ? (
                            <>
                                <Loader2 className="animate-spin" size={18} />
                                <span className="text-sm">Đang upload...</span>
                            </>
                        ) : (
                            <>
                                <Upload size={18} />
                                <span className="text-sm">
                                    {previewUrl ? 'Thay đổi ảnh' : 'Chọn ảnh'}
                                </span>
                            </>
                        )}
                    </div>
                </Label>
            </div>
            {selectedFile && (
                <p className="text-xs text-muted-foreground">
                    {selectedFile.name} ({(selectedFile.size / 1024).toFixed(2)} KB)
                </p>
            )}
            <p className="text-xs text-muted-foreground">
                Định dạng: JPG, PNG, WebP. Kích thước tối đa: 5MB. Tỷ lệ khuyến nghị: 16:9
            </p>
        </div>
    )
}
