"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Upload, X, Video, Loader2 } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import api from "@/app/lib/axios";
import type { AxiosError } from 'axios';
import { toast } from "sonner";

interface VideoUploadDialogProps {
  lessonId: string;
  currentVideoUrl?: string;
  onUploadSuccess: (videoUrl: string) => void;
  triggerButton?: React.ReactNode;
}

export function VideoUploadDialog({
  lessonId,
  currentVideoUrl,
  onUploadSuccess,
  triggerButton,
}: VideoUploadDialogProps) {
  const [open, setOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("video/")) {
      toast.error("Vui lòng chọn file video hợp lệ!");
      return;
    }
    const maxSize = 500 * 1024 * 1024;
    if (file.size > maxSize) {
      toast.error("File video không được vượt quá 500MB!");
      return;
    }
    setSelectedFile(file);
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      toast.error("Vui lòng chọn file video!");
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    try {
      const formData = new FormData();
      formData.append("video", selectedFile);
      formData.append("title", selectedFile.name);
      formData.append("duration", "00:00"); 
      const response = await api.put(`/lessons/${lessonId}`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        onUploadProgress: (progressEvent) => {
            /*
                progressEvent.loaded: Số byte đã upload 
                progressEvent.total: Tổng số byte của file
                Math.rounded là làm tròn số
             */
          const percentCompleted = progressEvent.total ? Math.round((progressEvent.loaded * 100) / progressEvent.total): 0;
          setUploadProgress(percentCompleted);
        },
      });
      const videoUrl = response.data.data?.video_url || response.data.video_url;
      if (videoUrl) {
        onUploadSuccess(videoUrl);
        toast.success("Upload video thành công!");
        setOpen(false);
        
        setSelectedFile(null);
        setPreviewUrl(null);
        setUploadProgress(0);
      }
    } catch (error) {
      console.error("Upload error:", error);
      const axiosErr = error as AxiosError<{ message?: string }>;
      toast.error(axiosErr?.response?.data?.message || "Upload video thất bại!");
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
    setUploadProgress(0);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {triggerButton || (
          <Button variant="outline" size="sm" className="cursor-pointer hover:bg-gray-300">
            <Upload className="w-4 h-4 mr-2" />
            {currentVideoUrl ? "Thay đổi video" : "Upload video"}
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Upload Video Bài Học</DialogTitle>
          <DialogDescription>
            Chọn file video từ máy tính của bạn (tối đa 500MB)
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {!selectedFile && (
            <div className="flex items-center justify-center w-full">
              <label htmlFor="video-upload" className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-lg cursor-pointer bg-slate-50 hover:bg-slate-100 transition-colors">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <Video className="w-12 h-12 mb-4 text-slate-400" />
                  <p className="mb-2 text-sm text-slate-600">
                    <span className="font-semibold">Click để chọn</span> hoặc kéo thả file vào đây
                  </p>
                  <p className="text-xs text-slate-500">
                    MP4, AVI, MOV, MKV (tối đa 500MB)
                  </p>
                </div>
                <input
                  id="video-upload"
                  type="file"
                  className="hidden"
                  accept="video/*"
                  onChange={handleFileSelect}
                  disabled={isUploading}
                />
              </label>
            </div>
          )}

          {selectedFile && (
            <div className="space-y-3">
              <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border">
                <div className="flex items-center gap-3">
                  <Video className="w-8 h-8 text-blue-500" />
                  <div>
                    <p className="font-medium text-sm">{selectedFile.name}</p>
                    <p className="text-xs text-slate-500">
                      {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
                    </p>
                  </div>
                </div>
                {!isUploading && (
                  <Button variant="ghost" size="icon" onClick={handleRemoveFile}>
                    <X className="w-4 h-4" />
                  </Button>
                )}
              </div>

              {previewUrl && (
                <video
                  src={previewUrl}
                  controls
                  className="w-full max-h-64 rounded-lg border"
                />
              )}

              {isUploading && (
                <div className="space-y-2">
                  <Progress value={uploadProgress} />
                  <p className="text-xs text-center text-slate-600">
                    Đang upload... {uploadProgress}%
                  </p>
                </div>
              )}
            </div>
          )}

          {currentVideoUrl && !selectedFile && (
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
              <p className="text-sm text-blue-800">
                <strong>Video hiện tại:</strong>{" "}
                <a href={currentVideoUrl} target="_blank" rel="noopener noreferrer"className="underline hover:text-blue-600">
                  Xem video
                </a>
              </p>
            </div>
          )}

          <div className="flex justify-end gap-2">
            <Button variant="outline" className=" hover:bg-gray-300 cursor-pointer" onClick={() => setOpen(false)}  disabled={isUploading}>
              Hủy
            </Button>
            <Button onClick={handleUpload} disabled={!selectedFile || isUploading}>
              {isUploading ? (
                <div>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Đang upload...
                </div>
              ) : (
                <div className="flex cursor-pointer">
                  <Upload className="w-4 h-4 mr-2" />
                  Upload
                </div>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
