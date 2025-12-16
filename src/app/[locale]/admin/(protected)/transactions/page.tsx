"use client";

import React, { useEffect, useState } from "react";
import api from "@/app/lib/axios";
import { toast } from "sonner";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Spinner } from "@/components/ui/spinner";
import { Search, RefreshCw, ArrowUpRight, ArrowDownRight } from "lucide-react";

type TransactionStatus = "Pending" | "Success" | "Cancel" | "Refund";
type TransactionType = "Withdraw" | "Deposit" | "Pay" | "Refund";
type StatusFilter = TransactionStatus | "ALL";
type TypeFilter = TransactionType | "ALL";

interface User {
  user_id: string;
  fullName: string;
  email: string;
}

interface Course {
  course_id: string;
  title: string;
}

interface Transaction {
  transaction_id: string;
  amount: number;
  status: TransactionStatus;
  transaction_type: TransactionType;
  payment_code: string;
  createdAt: string;
  user: User;
  course?: Course;
}

export default function AllTransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("ALL");
  const [typeFilter, setTypeFilter] = useState<TypeFilter>("ALL");

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      // Gọi API lấy tất cả transaction (Bạn cần implement API này ở BE)
      const res = await api.get("/transactions"); 
      setTransactions(res.data.data || res.data);
    } catch (error) {
      console.error("Lỗi tải giao dịch:", error);
      toast.error("Không thể tải danh sách giao dịch");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  const reload = async (): Promise<void> => {
    fetchTransactions();
  }


  // --- Logic Lọc ---
  const filteredData = transactions.filter((t) => {
    const search = searchTerm.toLowerCase();
    const matchSearch =
      t.user?.email.toLowerCase().includes(search) ||
      t.user?.fullName.toLowerCase().includes(search) ||
      t.payment_code?.toString().includes(search);

    const matchStatus = statusFilter === "ALL" || t.status === statusFilter;
    const matchType = typeFilter === "ALL" || t.transaction_type === typeFilter;

    return matchSearch && matchStatus && matchType;
  });

  // --- Helpers ---
  const formatCurrency = (val: number) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(Number(val));
  const formatDate = (date: string) => new Date(date).toLocaleString('vi-VN');

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Success": return <Badge className="bg-green-600">Thành công</Badge>;
      case "Pending": return <Badge className="bg-yellow-500">Đang xử lý</Badge>;
      case "Cancel": return <Badge className="bg-red-500">Đã hủy</Badge>;
      case "Refund": return <Badge className="bg-blue-600">Đã hoàn</Badge>;
      default: return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getTypeBadge = (type: string) => {
    switch (type) {
      case "Deposit": return <Badge variant="secondary" className="text-green-700 bg-green-50"><ArrowDownRight className="w-3 h-3 mr-1"/> Thu nhập</Badge>;
      case "Withdraw": return <Badge variant="secondary" className="text-red-700 bg-red-50"><ArrowUpRight className="w-3 h-3 mr-1"/> Rút tiền</Badge>;
      case "Pay": return <Badge variant="secondary" className="text-blue-700 bg-blue-50">Thanh toán</Badge>;
      case "Refund": return <Badge variant="secondary" className="text-blue-700 bg-blue-50"><ArrowDownRight className="w-3 h-3 mr-1"/> Hoàn tiền</Badge>;
      default: return <Badge variant="outline">{type}</Badge>;
    }
  };

  if (loading) return <div className="h-screen flex items-center justify-center"><Spinner /></div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Lịch sử Giao dịch</h1>
          <p className="text-gray-500">Quản lý toàn bộ dòng tiền trong hệ thống</p>
        </div>
      </div>

      {/* Toolbar: Search & Filters */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center ">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Tìm theo Email, Tên hoặc Mã giao dịch..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          <Select value={statusFilter} onValueChange={(value: string) => setStatusFilter(value as StatusFilter)}>
            <SelectTrigger><SelectValue placeholder="Trạng thái" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Tất cả trạng thái</SelectItem>
              <SelectItem value="Success">Thành công</SelectItem>
              <SelectItem value="Pending">Đang xử lý</SelectItem>
              <SelectItem value="Cancel">Đã hủy</SelectItem>
              <SelectItem value="Refund">Đã hoàn</SelectItem>
            </SelectContent>
          </Select>
          <Select value={typeFilter} onValueChange={(value: string) => setTypeFilter(value as TypeFilter)}>
            <SelectTrigger><SelectValue placeholder="Loại giao dịch" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Tất cả loại</SelectItem>
              <SelectItem value="Pay">Pay (Học viên mua)</SelectItem>
              <SelectItem value="Deposit">Deposit (Cộng ví GV)</SelectItem>
              <SelectItem value="Withdraw">Withdraw (Rút tiền)</SelectItem>
              <SelectItem value="Refund">Refund (Hoàn tiền)</SelectItem>
            </SelectContent>
          </Select>
          <Button
            variant={"outline"}
            onClick={reload}
            className="cursor-pointer hover:bg-gray-300"
          >
            <RefreshCw />Reload
          </Button>
        </div>
      </div>

      {/* --- Table --- */}
      <div className="border rounded-lg bg-white shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Mã GD</TableHead>
              <TableHead>Người dùng</TableHead>
              <TableHead>Loại</TableHead>
              <TableHead>Số tiền</TableHead>
              <TableHead>Trạng thái</TableHead>
              <TableHead>Nội dung / Khóa học</TableHead>
              <TableHead className="text-right">Thời gian</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredData.length > 0 ? (
              filteredData.map((t) => (
                <TableRow key={t.transaction_id}>
                  <TableCell className="font-mono text-xs">{t.payment_code?.toString()}</TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-medium">{t.user?.fullName}</span>
                      <span className="text-xs text-gray-500">{t.user?.email}</span>
                    </div>
                  </TableCell>
                  <TableCell>{getTypeBadge(t.transaction_type)}</TableCell>
                  <TableCell className={`font-bold ${
                    t.transaction_type === 'Refund' ? 'text-blue-600' : 
                    t.transaction_type === 'Withdraw' || t.transaction_type === 'Pay' ? 'text-red-600' : 'text-green-600'
                  }`}>
                    {t.transaction_type === 'Refund' ? '' : t.transaction_type === 'Deposit' ? '+' : '-'}{formatCurrency(t.amount)}
                  </TableCell>
                  <TableCell>{getStatusBadge(t.status)}</TableCell>
                  <TableCell className="max-w-[200px] truncate text-sm">
                    {t.course ? `Mua: ${t.course.title}` : 'Giao dịch ví'}
                  </TableCell>
                  <TableCell className="text-right text-sm text-gray-500">
                    {formatDate(t.createdAt)}
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow><TableCell colSpan={7} className="text-center h-24 text-gray-500">Không tìm thấy giao dịch nào</TableCell></TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}