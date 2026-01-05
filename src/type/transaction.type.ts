export type TransactionType = 'course' | 'combo';
export type TransactionStatus = 'Success' | 'Pending' | 'Cancel';
export type PaymentMethod = 'Bank_Transfer';

export interface User {
  user_id: string;
  email: string;
  fullName: string;
  avatar: string | null;
}

export interface TransactionStats {
  totalTransactions: number;
  successfulTransactions: number;
  pendingTransactions: number;
  cancelledTransactions: number;
  totalSpent: number;
}

export interface CourseInfo {
  course_id: string;
  title: string;
  thumbnail: string;
  price: number;
  instructor: {
    fullName: string;
    avatar: string | null;
  };
}

export interface Transaction {
  transaction_id: string;
  type: TransactionType;
  amount: number;
  currency: string;
  status: TransactionStatus;
  payment_method: PaymentMethod;
  description: string | null;
  note: string;
  payment_code: string;
  createdAt: string;
  course: CourseInfo | null;
  comboName: string | null;
}

export interface TransactionHistoryData {
  user: User;
  stats: TransactionStats;
  transactions: Transaction[];
}

export interface TransactionHistoryResponse {
  success: boolean;
  data: TransactionHistoryData;
}
