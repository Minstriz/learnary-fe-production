"use client";

import React, { useEffect, useState } from "react";
import api from "@/app/lib/axios";
import { toast } from "sonner";
import { useAuth } from "@/app/context/AuthContext";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { CheckCircle, XCircle, AlertCircle } from "lucide-react";

type WithdrawStatus = "Pending" | "Success" | "Rejected";
type ActionType = 'APPROVE' | 'REJECT';

interface BelongUser {
  fullName: string;
  email: string;
  phone: string;
}

interface WithdrawRequest {
  withdraw_request_id: string;
  user_id: string;
  balance: number;
  status: WithdrawStatus;
  note: string;
  createdAt: string;
  belongUser: BelongUser | null;
}

export default function WithdrawApprovalPage() {
  const { user } = useAuth(); // Lấy adminId từ context
  const [requests, setRequests] = useState<WithdrawRequest[]>([]);
  const [loading, setLoading] = useState(true);
  
  // State cho Modal xử lý (Duyệt/Từ chối)
  const [selectedRequest, setSelectedRequest] = useState<WithdrawRequest | null>(null);
  const [actionType, setActionType] = useState<ActionType | null>(null);
  const [adminNote, setAdminNote] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  // Load danh sách Pending
  const fetchRequests = async () => {
    try {
      setLoading(true);
      // Bạn cần thêm API này ở Backend: router.get('/withdraw/requests?status=Pending', ...)
      const res = await api.get("/withdraw/requests?status=Pending");
      console.log('📦 [fetchRequests] Response:', res.data);
      console.log('👤 [fetchRequests] First user:', res.data.data?.[0]?.belongUser);
      setRequests(res.data.data || res.data);
    } catch (error) {
      console.error("Lỗi:", error);
      toast.error("Không thể tải danh sách yêu cầu rút tiền");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  // Hàm xử lý khi Admin bấm xác nhận trong Modal
  const handleConfirmAction = async () => {
    if (!selectedRequest || !actionType || !user?.id) return;

    try {
      setIsProcessing(true);
      
      // Gọi API Approve/Reject đã viết ở Backend
      await api.post("/withdraw/approve", {
        adminId: user.id,
        requestId: selectedRequest.withdraw_request_id,
        action: actionType, // 'APPROVE' hoặc 'REJECT'
        note: adminNote // Ghi chú của admin (VD: Mã giao dịch ngân hàng, hoặc Lý do từ chối)
      });

      toast.success(actionType === 'APPROVE' ? "Đã duyệt yêu cầu thành công!" : "Đã từ chối yêu cầu!");
      
      // Đóng modal và reload lại danh sách
      setActionType(null);
      setSelectedRequest(null);
      setAdminNote("");
      fetchRequests();

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Xử lý thất bại";
      toast.error(errorMessage);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Phê duyệt Rút tiền</h1>
          <p className="text-gray-500">Danh sách các yêu cầu đang chờ xử lý (Pending)</p>
        </div>
      </div>

      <div className="border rounded-lg bg-white shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50">
              <TableHead>Giảng viên</TableHead>
              <TableHead>Số tiền rút</TableHead>
              <TableHead>Thông tin ngân hàng (Note)</TableHead>
              <TableHead>Ngày tạo</TableHead>
              <TableHead className="text-right pr-6">Hành động</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={5} className="text-center py-8">Đang tải...</TableCell></TableRow>
            ) : requests.length > 0 ? (
              requests.map((req) => (
                <TableRow key={req.withdraw_request_id}>
                  <TableCell>
                    <div className="font-medium">{req.belongUser?.fullName || 'N/A'}</div>
                    <div className="text-xs text-gray-500">{req.belongUser?.email || 'N/A'}</div>
                    <div className="text-xs text-gray-500">{req.belongUser?.phone || 'N/A'}</div>
                  </TableCell>
                  <TableCell className="font-bold text-lg text-red-600">
                    {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(Number(req.balance))}
                  </TableCell>
                  <TableCell className="max-w-[300px]">
                    <div className="bg-gray-100 p-2 rounded text-sm text-gray-700 whitespace-pre-wrap">
                        {req.note}
                    </div>
                  </TableCell>
                  <TableCell className="text-sm text-gray-500">
                    {new Date(req.createdAt).toLocaleString('vi-VN')}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      {/* Nút Từ chối */}
                      <Button 
                        variant="destructive" 
                        size="sm"
                        onClick={() => {
                          setSelectedRequest(req);
                          setActionType('REJECT');
                        }}
                      >
                        <XCircle className="w-4 h-4 mr-1"/> Từ chối
                      </Button>

                      {/* Nút Duyệt */}
                      <Button 
                        className="bg-green-600 hover:bg-green-700" 
                        size="sm"
                        onClick={() => {
                          setSelectedRequest(req);
                          setActionType('APPROVE');
                        }}
                      >
                        <CheckCircle className="w-4 h-4 mr-1"/> Duyệt tiền
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="text-center h-32 text-gray-500 flex flex-col items-center justify-center">
                  <CheckCircle className="w-10 h-10 text-green-300 mb-2" />
                  <p>Tuyệt vời! Không có yêu cầu nào đang chờ.</p>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* --- MODAL XÁC NHẬN --- */}
      <Dialog open={!!selectedRequest} onOpenChange={(open) => !open && setSelectedRequest(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className={actionType === 'APPROVE' ? "text-green-600" : "text-red-600"}>
              {actionType === 'APPROVE' ? "Xác nhận chuyển khoản" : "Từ chối yêu cầu rút tiền"}
            </DialogTitle>
          </DialogHeader>
          
          <div className="py-4 space-y-4">
            <div className="bg-slate-50 p-3 rounded border">
                <p className="text-sm text-gray-600">Giảng viên: <strong>{selectedRequest?.belongUser?.fullName || 'N/A'}</strong></p>
                <p className="text-sm text-gray-600">Số tiền: <strong className="text-red-600">{selectedRequest && new Intl.NumberFormat('vi-VN').format(Number(selectedRequest.balance))} đ</strong></p>
                <p className="text-sm text-gray-600 mt-2">Ngân hàng:</p>
                <p className="text-sm font-mono bg-white p-1 border rounded">{selectedRequest?.note}</p>
            </div>

            <div className="space-y-2">
                <label className="text-sm font-medium">
                    {actionType === 'APPROVE' ? "Ghi chú của Admin (Mã giao dịch ngân hàng...)" : "Lý do từ chối (Sẽ gửi cho GV)"}
                </label>
                <Textarea 
                    placeholder={actionType === 'APPROVE' ? "Đã chuyển qua VCB, mã GD: 998877..." : "Sai thông tin số tài khoản..."}
                    value={adminNote}
                    onChange={(e) => setAdminNote(e.target.value)}
                />
            </div>

            {actionType === 'APPROVE' && (
                <div className="flex items-center gap-2 text-amber-600 text-sm bg-amber-50 p-2 rounded">
                    <AlertCircle className="w-4 h-4" />
                    <span>Hành động này không thể hoàn tác. Hãy chắc chắn bạn đã chuyển tiền thật!</span>
                </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedRequest(null)}>Hủy</Button>
            <Button 
                className={actionType === 'APPROVE' ? "bg-green-600 hover:bg-green-700" : "bg-red-600 hover:bg-red-700"}
                onClick={handleConfirmAction}
                disabled={isProcessing}
            >
                {isProcessing ? "Đang xử lý..." : (actionType === 'APPROVE' ? "Xác nhận đã chuyển" : "Xác nhận từ chối")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}