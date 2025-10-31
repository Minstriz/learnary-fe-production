"use client"; 

import ProtectedRoute from "@/components/ProtectedRoute";
import { useAuth } from "@/app/context/AuthContext"; 

export default function ProfilePage() {
  const { user } = useAuth();

  return (
    <ProtectedRoute>
      <div className="container mx-auto p-8">
        <h1 className="text-3xl font-bold">Hồ sơ cá nhân</h1>
        
        {user && (
          <div className="mt-6">
            <p><strong>Xin chào, {user.fullName}!</strong></p>
            <p><strong>Email:</strong> {user.email}</p>
            <p><strong>Vai trò:</strong> {user.role}</p>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}