// user.type.ts

export type UserRole = 'ADMIN' | 'INSTRUCTOR' | 'LEARNER';
export type UserGender = 'MALE' | 'FEMALE' | 'OTHER';

export type User = {
  user_id: string;
  wallet_id: string;
  email: string;
  password: string;
  fullName: string;
  gender: UserGender;
  role: UserRole; // Default: LEARNER
  phone: string;
  avatar?: string;
  date_of_birth?: string; 
  address?: string;
  city?: string;
  country?: string;
  nation?: string;
  bio?: string;
  last_login?: string; 
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type Learner = {
  learner_id: string;
  user_id: string;
  created_at: string;
  updated_at: string;
};

export type InstructorStatus = 'Active' | 'Inactive' | 'Suspended';
export type InstructorWithData = Instructor & { user? : User}
export type Instructor = {
  instructor_id: string;
  user_id: string;
  is_verified: boolean;
  status: InstructorStatus; // Default: Inactive
  created_at: string;
  updated_at: string;
};

export type LearnerCourseStatus = 'enrolled' | 'completed' | 'cancelled';

export type LearnerCourse = {
  learner_id: string;
  course_id: string;
  status: LearnerCourseStatus; // Default: enrolled
  progress: number;  // DECIMAL(5,2)
  rating?: number;   // 1-5
  created_at: string;
  updated_at: string;
};

export type TransactionType = 'withdraw' | 'deposit' | 'pay';
export type PaymentMethod = 'credit_card' | 'paypal' | 'bank_transfer' | 'voucher';
export type TransactionStatus = 'pending' | 'success' | 'failed' | 'refunded';

export type Transaction = {
  transaction_id: string;
  course_id: string;
  user_id: string;
  wallet_id: string;
  transactions_type: TransactionType;
  commision_rate: number;
  payment_method: PaymentMethod;
  amount: number;  // DECIMAL(10,2)
  currency: string;
  status: TransactionStatus;
  note?: string;
  created_at: string;
  updated_at: string;
};
