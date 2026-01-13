// "use client";

// /**
//  * Example Usage: Account Access Control
//  * 
//  * This file demonstrates how to use the AccountAccessControl component
//  * to protect features based on account status
//  */

// import AccountAccessControl from "@/components/AccountAccessControl";
// import { Button } from "@/components/ui/button";
// import { useAccountStatus } from "@/hooks/useAccountStatus";
// import { toast } from "sonner";

// // Example 1: Protecting Purchase Button
// export function PurchaseButtonExample() {
//   const handlePurchase = () => {
//     // Purchase logic
//   };

//   return (
//     <AccountAccessControl 
//       requiredStatus="ACTIVE"
//       showToast={true}
//     >
//       <Button onClick={handlePurchase}>
//         Mua khóa học
//       </Button>
//     </AccountAccessControl>
//   );
// }

// // Example 2: Protecting Entire Page (with redirect)
// export function EnrollmentPageExample() {
//   return (
//     <AccountAccessControl 
//       requiredStatus="ACTIVE"
//       redirectOnRestricted="/learn-area"
//       showToast={true}
//     >
//       <div>
//         <h1>Đăng ký khóa học</h1>
//         {/* Enrollment form */}
//       </div>
//     </AccountAccessControl>
//   );
// }

// // Example 3: Conditional Rendering Based on Status
// export function CourseCatalogExample() {
//   const { accountStatus } = useAccountStatus();

//   const handleAddToCart = () => {
//     if (accountStatus?.status === 'FREEZED') {
//       toast.error('Tài khoản của bạn đang bị đóng băng. Không thể thêm khóa học mới.');
//       return;
//     }
//     // Add to cart logic
//   };

//   return (
//     <div>
//       <h2>Khóa học</h2>
//       {accountStatus?.status === 'ACTIVE' && (
//         <Button onClick={handleAddToCart}>
//           Thêm vào giỏ hàng
//         </Button>
//       )}
//       {accountStatus?.status === 'FREEZED' && (
//         <p className="text-orange-600">
//           Tài khoản đang bị đóng băng. Bạn chỉ có thể xem các khóa học đã mua.
//         </p>
//       )}
//     </div>
//   );
// }

// // Example 4: Instructor Area Protection
// export function InstructorDashboardExample() {
//   const { accountStatus } = useAccountStatus();

//   if (accountStatus?.status === 'FREEZED') {
//     return (
//       <div className="p-8">
//         <h1 className="text-2xl font-bold text-orange-600">
//           Khu vực giảng viên tạm thời không khả dụng
//         </h1>
//         <p className="mt-4">
//           Tài khoản của bạn đang bị đóng băng. Vui lòng liên hệ quản trị viên 
//           để biết thêm chi tiết.
//         </p>
//       </div>
//     );
//   }

//   return (
//     <AccountAccessControl requiredStatus="ACTIVE">
//       <div>
//         <h1>Bảng điều khiển giảng viên</h1>
//         {/* Instructor dashboard content */}
//       </div>
//     </AccountAccessControl>
//   );
// }

// // Example 5: Checking Status Manually
// export function ManualCheckExample() {
//   const { accountStatus, isLoading } = useAccountStatus();

//   if (isLoading) {
//     return <div>Đang kiểm tra trạng thái tài khoản...</div>;
//   }

//   const isActive = accountStatus?.status === 'ACTIVE';
//   const isFrozen = accountStatus?.status === 'FREEZED';
//   const isLocked = accountStatus?.status === 'LOCKED';

//   return (
//     <div>
//       {isActive && <div>✅ Tài khoản hoạt động bình thường</div>}
//       {isFrozen && <div>⚠️ Tài khoản bị đóng băng: {accountStatus.account_noted}</div>}
//       {isLocked && <div>🔒 Tài khoản bị khóa: {accountStatus.account_noted}</div>}
//     </div>
//   );
// }

// // Example 6: Favorites/Cart Access
// export function FavoritesButtonExample() {
//   const { accountStatus } = useAccountStatus();

//   // Don't show favorites button if account is frozen
//   if (accountStatus?.status === 'FREEZED') {
//     return null;
//   }

//   return (
//     <Button variant="outline">
//       ❤️ Yêu thích
//     </Button>
//   );
// }

// // Example 7: Course Purchase Checkout
// export function CheckoutPageExample() {
//   const { accountStatus } = useAccountStatus();

//   if (accountStatus?.status !== 'ACTIVE') {
//     return (
//       <div className="p-8 bg-orange-50 border border-orange-200 rounded">
//         <h2 className="text-xl font-bold text-orange-800">
//           Không thể thanh toán
//         </h2>
//         <p className="mt-2 text-orange-700">
//           {accountStatus?.status === 'FREEZED' 
//             ? 'Tài khoản của bạn đang bị đóng băng. Bạn không thể mua khóa học mới.'
//             : 'Tài khoản của bạn đang bị khóa. Vui lòng liên hệ quản trị viên.'}
//         </p>
//         {accountStatus?.account_noted && (
//           <p className="mt-2 text-sm">
//             <strong>Lý do:</strong> {accountStatus.account_noted}
//           </p>
//         )}
//       </div>
//     );
//   }

//   return (
//     <div>
//       <h1>Thanh toán</h1>
//       {/* Checkout form */}
//     </div>
//   );
// }
