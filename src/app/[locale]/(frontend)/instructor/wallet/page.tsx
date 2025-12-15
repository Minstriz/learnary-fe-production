"use client";
import React, { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/app/lib/axios';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { useAuth } from '@/app/context/AuthContext';
import { isAxiosError } from 'axios';
import { ArrowUpRight, ArrowDownRight, Clock, CheckCircle2, XCircle, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

// Định nghĩa kiểu dữ liệu cho Transaction
interface Transaction {
    transaction_id: string;
    amount: number;
    status: 'Pending' | 'Success' | 'Cancel';
    transaction_type: 'Deposit' | 'Withdraw' | 'Pay' | 'Refund';
    note: string;
    description?: string;
    createdAt: string;
    course?: {
        course_id: string;
        title: string;
    };
    user?: {
        user_id: string;
        fullName: string;
        email: string;
    };
}

// Định nghĩa kiểu dữ liệu cho Ví
interface WalletData {
    wallet_id: string;
    balance: number;
    transactions?: Transaction[];
}

export default function MyWalletPage() {
    const router = useRouter();
    const { user, isLoggedIn, isLoading: authLoading } = useAuth();

    // State
    const [wallet, setWallet] = useState<WalletData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'withdraw' | 'revenue'>('withdraw');
    
    // State form rút tiền
    const [amount, setAmount] = useState<number | ''>('');
    const [isWithdrawing, setIsWithdrawing] = useState(false);

    // State thông tin ngân hàng
    const [instructorId, setInstructorId] = useState<string | null>(null);
    const [isEditingBank, setIsEditingBank] = useState(false);
    const [bankForm, setBankForm] = useState({
        bank_name: '',
        account_number: '',
        account_holder_name: ''
    });

    // Kiểm tra quyền truy cập
    useEffect(() => {
        if (!authLoading) {
            if (!isLoggedIn || user?.role !== 'INSTRUCTOR') {
                toast.error('Bạn không có quyền truy cập trang này');
                router.push('/');
            }
        }
    }, [user, isLoggedIn, authLoading, router]);

    // 1. Hàm lấy thông tin Ví (Chạy khi load trang)
    const fetchWallet = useCallback(async () => {
        if (!user?.id) return;
        
        try {
            const res = await api.get(`/wallet/info?userId=${user.id}`);
            setWallet(res.data);
        } catch (error) {
            console.error("Lỗi lấy ví:", error);
            if (isAxiosError(error)) {
                toast.error(error.response?.data?.message || "Không thể tải thông tin ví");
            } else {
                toast.error("Không thể tải thông tin ví");
            }
        } finally {
            setIsLoading(false);
        }
    }, [user?.id]);

    // 1.5. Hàm lấy thông tin Instructor và Bank Account
    const fetchInstructorAndBank = useCallback(async () => {
        if (!user?.id) return;
        
        try {
            // Lấy instructor_id
            const instrRes = await api.get(`/instructors/user/${user.id}`);
            if (instrRes.data && instrRes.data.data) {
                const instrId = instrRes.data.data.instructor_id;
                setInstructorId(instrId);
                
                // Lấy thông tin bank account
                try {
                    const bankRes = await api.get(`/bank-account/${instrId}`);
                    if (bankRes.data && bankRes.data.data) {
                        setBankForm({
                            bank_name: bankRes.data.data.bank_name || '',
                            account_number: bankRes.data.data.account_number || '',
                            account_holder_name: bankRes.data.data.account_holder_name || ''
                        });
                    }
                } catch (bankErr) {
                    console.log('Chưa có thông tin ngân hàng', bankErr);
                }
            }
        } catch (error) {
            console.error('Lỗi lấy thông tin instructor:', error);
        }
    }, [user?.id]);

    useEffect(() => {
        if (user?.id && user?.role === 'INSTRUCTOR') {
            fetchWallet();
            fetchInstructorAndBank();
        }
    }, [user?.id, user?.role, fetchWallet, fetchInstructorAndBank]);

    // 1.6. Hàm lưu thông tin ngân hàng
    const handleSaveBankAccount = async () => {
        if (!instructorId) {
            toast.error('Không tìm thấy thông tin giảng viên');
            return;
        }

        if (!bankForm.bank_name || !bankForm.account_number || !bankForm.account_holder_name) {
            toast.error('Vui lòng điền đầy đủ thông tin ngân hàng');
            return;
        }

        try {
            await api.patch(`/bank-account/${instructorId}`, bankForm);
            toast.success('Cập nhật thông tin ngân hàng thành công!');
            setIsEditingBank(false);
            fetchInstructorAndBank();
        } catch (error) {
            console.error('Lỗi lưu ngân hàng:', error);
            toast.error('Đã có lỗi xảy ra');
        }
    };

    // 2. Hàm xử lý Rút tiền
    const handleWithdraw = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!wallet || !user?.id) return;
        const withdrawAmount = Number(amount);

        // Validate cơ bản
        if (withdrawAmount < 5000) return toast.error("Tối thiểu rút 50.000 đ");
        if (withdrawAmount > wallet.balance) return toast.error("Số dư không đủ!");
        
        // Kiểm tra thông tin ngân hàng
        if (!bankForm.bank_name || !bankForm.account_number || !bankForm.account_holder_name) {
            toast.error("Vui lòng cập nhật thông tin ngân hàng trước khi rút tiền");
            setIsEditingBank(true);
            return;
        }

        // Tạo note từ thông tin ngân hàng
        const bankNote = `${bankForm.bank_name} - ${bankForm.account_number} - ${bankForm.account_holder_name}`;

        try {
            setIsWithdrawing(true);
            
            // Gọi API POST rút tiền
            await api.post('/withdraw/request', {
                userId: user.id,
                amount: withdrawAmount,
                note: bankNote
            });

            toast.success("Gửi yêu cầu rút tiền thành công!");
            
            // Reset form
            setAmount('');

            // Cập nhật lại số dư ngay lập tức (Trừ tạm thời trên giao diện cho mượt)
            setWallet(prev => prev ? { ...prev, balance: prev.balance - withdrawAmount } : null);
            
            // Hoặc gọi lại fetchWallet() để lấy số liệu chuẩn từ Server
            // fetchWallet(); 

        } catch (err) {
            if (isAxiosError(err)) {
                toast.error(err.response?.data?.error || "Lỗi rút tiền");
            } else {
                toast.error("Lỗi rút tiền");
            }
        } finally {
            setIsWithdrawing(false);
        }
    };

    // Hàm format tiền VND
    const formatVND = (num: number) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(num);

    // Hàm format ngày giờ
    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleString('vi-VN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    // Hàm lấy icon status
    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'Success':
                return <CheckCircle2 className="w-5 h-5 text-green-500" />;
            case 'Pending':
                return <Clock className="w-5 h-5 text-yellow-500" />;
            case 'Cancel':
            case 'Rejected':
                return <XCircle className="w-5 h-5 text-red-500" />;
            default:
                return null;
        }
    };

    // Hàm lấy màu status
    const getStatusColor = (status: string) => {
        switch (status) {
            case 'Success':
                return 'text-green-600 bg-green-50';
            case 'Pending':
                return 'text-yellow-600 bg-yellow-50';
            case 'Cancel':
            case 'Rejected':
                return 'text-red-600 bg-red-50';
            default:
                return 'text-gray-600 bg-gray-50';
        }
    };

    if (authLoading || isLoading) return <div className="p-10 text-center">Đang tải ví...</div>;
    
    if (!isLoggedIn || user?.role !== 'INSTRUCTOR') return null;

    return (
        <div className="min-h-screen bg-gray-50 py-10 px-4">
            <div className="max-w-6xl mx-auto space-y-6">
                <Link href="/instructor">
                    <Button variant="ghost" className="mb-4 cursor-pointer">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Quay lại khu vực giảng viên
                    </Button>
                </Link>
                
                {/* --- CARD 1: HIỂN THỊ SỐ DƯ --- */}
                <div className="bg-linear-to-r from-purple-600 to-blue-600 rounded-2xl p-8 text-white shadow-lg">
                    <h2 className="text-lg font-medium opacity-90">Số dư khả dụng</h2>
                    <div className="text-4xl font-bold mt-2">
                        {wallet ? formatVND(wallet.balance) : '0 đ'}
                    </div>
                    <p className="text-sm mt-4 opacity-75">
                        ID Ví: {wallet?.wallet_id}
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* --- CARD 2: FORM RÚT TIỀN --- */}
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-xl shadow p-6 sticky top-6">
                            <h3 className="text-xl font-bold text-gray-800 mb-4 border-b pb-2">Tạo lệnh rút tiền</h3>
                            
                            <form onSubmit={handleWithdraw} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Số tiền muốn rút</label>
                                    <div className="relative">
                                        <input 
                                            type="number" 
                                            className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-purple-500 outline-none"
                                            placeholder="Ví dụ: 100000"
                                            value={amount}
                                            onChange={e => setAmount(Number(e.target.value))}
                                        />
                                        <span className="absolute right-4 top-3 text-gray-500 font-bold">VND</span>
                                    </div>
                                    <p className="text-xs text-gray-500 mt-1">Phí rút tiền: 0đ. Tối thiểu: 50.000đ</p>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Thông tin nhận tiền</label>
                                    
                                    {isEditingBank ? (
                                        // Chế độ chỉnh sửa
                                        <div className="space-y-3">
                                            <input 
                                                type="text"
                                                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-purple-500 outline-none"
                                                placeholder="Tên ngân hàng (VD: Vietcombank)"
                                                value={bankForm.bank_name}
                                                onChange={e => setBankForm({...bankForm, bank_name: e.target.value})}
                                            />
                                            <input 
                                                type="text"
                                                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-purple-500 outline-none"
                                                placeholder="Số tài khoản"
                                                value={bankForm.account_number}
                                                onChange={e => setBankForm({...bankForm, account_number: e.target.value})}
                                            />
                                            <input 
                                                type="text"
                                                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-purple-500 outline-none"
                                                placeholder="Tên chủ tài khoản"
                                                value={bankForm.account_holder_name}
                                                onChange={e => setBankForm({...bankForm, account_holder_name: e.target.value})}
                                            />
                                            <div className="flex gap-2">
                                                <Button 
                                                    type="button"
                                                    onClick={handleSaveBankAccount}
                                                    className="flex-1 bg-green-600 hover:bg-green-700 cursor-pointer"
                                                >
                                                    Lưu
                                                </Button>
                                                <Button 
                                                    type="button"
                                                    variant="outline"
                                                    onClick={() => setIsEditingBank(false)}
                                                    className="flex-1 cursor-pointer"
                                                >
                                                    Hủy
                                                </Button>
                                            </div>
                                        </div>
                                    ) : (
                                        // Chế độ hiển thị
                                        <div className="border border-gray-300 rounded-lg p-4 bg-gray-50">
                                            {bankForm.bank_name && bankForm.account_number && bankForm.account_holder_name ? (
                                                <div className="space-y-1">
                                                    <p className="text-sm"><span className="font-semibold">Ngân hàng:</span> {bankForm.bank_name}</p>
                                                    <p className="text-sm"><span className="font-semibold">Số TK:</span> {bankForm.account_number}</p>
                                                    <p className="text-sm"><span className="font-semibold">Chủ TK:</span> {bankForm.account_holder_name}</p>
                                                    <Button 
                                                        type="button"
                                                        variant="link"
                                                        onClick={() => setIsEditingBank(true)}
                                                        className="text-purple-600 p-0 h-auto mt-2 cursor-pointer"
                                                    >
                                                        Chỉnh sửa thông tin
                                                    </Button>
                                                </div>
                                            ) : (
                                                <div className="text-center py-4">
                                                    <p className="text-gray-500 text-sm mb-2">Chưa có thông tin ngân hàng</p>
                                                    <Button 
                                                        type="button"
                                                        variant="outline"
                                                        onClick={() => setIsEditingBank(true)}
                                                        className="text-purple-600 border-purple-600 cursor-pointer"
                                                    >
                                                        + Thêm thông tin ngân hàng
                                                    </Button>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>

                                <Button 
                                    type="submit" 
                                    disabled={isWithdrawing}
                                    className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-4 rounded-lg text-lg transition-all cursor-pointer"
                                >
                                    {isWithdrawing ? 'Đang xử lý...' : 'Xác nhận rút tiền'}
                                </Button>
                            </form>
                        </div>
                    </div>

                    {/* --- CARD 3: LỊCH SỬ GIAO DỊCH --- */}
                    <div className="lg:col-span-2">
                        <div className="bg-white rounded-xl shadow">
                            <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'withdraw' | 'revenue')} className="w-full">
                                <TabsList className="grid w-full grid-cols-2 p-1 bg-gray-100 rounded-t-xl">
                                    <TabsTrigger value="revenue" className="data-[state=active]:bg-white">
                                        Doanh thu bán khóa học
                                    </TabsTrigger>
                                    <TabsTrigger value="withdraw" className="data-[state=active]:bg-white">
                                        Lịch sử rút tiền
                                    </TabsTrigger>
                                </TabsList>

                                {/* Tab Doanh thu */}
                                <TabsContent value="revenue" className="p-6 space-y-4">
                                    <h3 className="font-semibold text-lg mb-4">Doanh thu từ học viên</h3>
                                    {wallet?.transactions && wallet.transactions.filter(t => t.transaction_type === 'Deposit').length > 0 ? (
                                        <div className="space-y-3">
                                            {wallet.transactions
                                                .filter(t => t.transaction_type === 'Deposit')
                                                .map((transaction) => (
                                                <div key={transaction.transaction_id} className="border rounded-lg p-4 hover:bg-gray-50 transition">
                                                    <div className="flex items-start justify-between">
                                                        <div className="flex-1">
                                                            <div className="flex items-center gap-2 mb-1">
                                                                <ArrowDownRight className="w-5 h-5 text-green-500" />
                                                                <span className="font-semibold text-gray-800">
                                                                    {transaction.description || 'Doanh thu bán khóa học'}
                                                                </span>
                                                            </div>
                                                            {transaction.course && (
                                                                <p className="text-sm text-gray-600 ml-7">
                                                                    Khóa học: {transaction.course.title}
                                                                </p>
                                                            )}
                                                            {transaction.user && (
                                                                <p className="text-sm text-gray-600 ml-7">
                                                                    Học viên: {transaction.user.fullName}
                                                                </p>
                                                            )}
                                                            <p className="text-xs text-gray-400 ml-7 mt-1">
                                                                {formatDate(transaction.createdAt)}
                                                            </p>
                                                        </div>
                                                        <div className="text-right">
                                                            <div className="text-lg font-bold text-green-600">
                                                                +{formatVND(transaction.amount)}
                                                            </div>
                                                            <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(transaction.status)}`}>
                                                                {getStatusIcon(transaction.status)}
                                                                {transaction.status}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="text-center py-12 text-gray-500">
                                            <p>Chưa có doanh thu nào</p>
                                        </div>
                                    )}
                                </TabsContent>

                                {/* Tab Rút tiền */}
                                <TabsContent value="withdraw" className="p-6 space-y-4">
                                    <h3 className="font-semibold text-lg mb-4">Lịch sử rút tiền</h3>
                                    {wallet?.transactions && wallet.transactions.filter(t => t.transaction_type === 'Withdraw' || t.transaction_type === 'Refund').length > 0 ? (
                                        <div className="space-y-3">
                                            {wallet.transactions
                                                .filter(t => t.transaction_type === 'Withdraw' || t.transaction_type === 'Refund')
                                                .map((transaction) => (
                                                <div key={transaction.transaction_id} className="border rounded-lg p-4 hover:bg-gray-50 transition">
                                                    <div className="flex items-start justify-between">
                                                        <div className="flex-1">
                                                            <div className="flex items-center gap-2 mb-1">
                                                                {transaction.transaction_type === 'Refund' ? (
                                                                    <ArrowDownRight className="w-5 h-5 text-blue-500" />
                                                                ) : (
                                                                    <ArrowUpRight className="w-5 h-5 text-red-500" />
                                                                )}
                                                                <span className="font-semibold text-gray-800">
                                                                    {transaction.transaction_type === 'Refund' ? 'Hoàn tiền từ yêu cầu rút tiền' : 'Rút tiền về ngân hàng'}
                                                                </span>
                                                            </div>
                                                            <p className="text-sm text-gray-600 ml-7">
                                                                {transaction.description || transaction.note}
                                                            </p>
                                                            <p className="text-xs text-gray-400 ml-7 mt-1">
                                                                {formatDate(transaction.createdAt)}
                                                            </p>
                                                        </div>
                                                        <div className="text-right">
                                                            <div className={`text-lg font-bold ${transaction.transaction_type === 'Refund' ? 'text-blue-600' : 'text-red-600'}`}>
                                                                {transaction.transaction_type === 'Refund' ? '+' : '-'}{formatVND(transaction.amount)}
                                                            </div>
                                                            <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(transaction.status)}`}>
                                                                {getStatusIcon(transaction.status)}
                                                                {transaction.status}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="text-center py-12 text-gray-500">
                                            <p>Chưa có lịch sử rút tiền</p>
                                        </div>
                                    )}
                                </TabsContent>
                            </Tabs>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}