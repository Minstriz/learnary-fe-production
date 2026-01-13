"use client";

import { Lock } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface AccountLockedDialogProps {
  open: boolean;
  reason?: string;
  onLogout: () => void;
}

export default function AccountLockedDialog({ open, reason, onLogout }: AccountLockedDialogProps) {
  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent className="sm:max-w-md" onInteractOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <div className="flex justify-center mb-4">
            <div className="rounded-full bg-red-100 p-3">
              <Lock className="h-8 w-8 text-red-600" />
            </div>
          </div>
          <DialogTitle className="text-center text-xl">Tài khoản của bạn đã bị khóa</DialogTitle>
          <DialogDescription className="text-center space-y-3 pt-2">
            {reason && (
              <p className="text-base">
                <span className="font-semibold">Lý do:</span> {reason}
              </p>
            )}
            <p className="text-sm">
              Nếu có thắc mắc, vui lòng liên hệ với quản trị viên hệ thống qua email:
            </p>
            <a
              href="mailto:learnary.contact@gmail.com"
              className="text-blue-600 hover:underline font-medium block"
            >
              learnary.contact@gmail.com
            </a>
          </DialogDescription>
        </DialogHeader>
        <div className="flex justify-center pt-4">
          <Button onClick={onLogout} variant="default">
            Đăng xuất
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
