"use client";

import { useEffect, useState, useCallback } from "react";
import api from "@/app/lib/axios";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/context/AuthContext";

export type AccountStatus = 'Active' | 'Locked' | 'Freezed';

interface AccountSecurity {
  status: AccountStatus;
  account_noted?: string;
}

export function useAccountStatus() {
  const [accountStatus, setAccountStatus] = useState<AccountSecurity | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { user, logout } = useAuth();
  const router = useRouter();
  const fetchAccountStatus = useCallback(async () => {
    try {
      setIsLoading(true);
      if (!user?.id) {
        setAccountStatus({ status: 'Active' });
        return;
      }
      try {
        const response = await api.get("/account-securities/my-status");
        const statusData = response.data.data || response.data;
        setAccountStatus(statusData as AccountSecurity);
        return;
      } catch {
        console.log("New endpoint not available, using fallback");
      }
      const response = await api.post("/account-securities/check-active", {
        user_id: user.id
      });
      const isActive = response.data.data;
      const statusData: AccountSecurity = { 
        status: (isActive ? 'Active' : 'Locked') as AccountStatus,
        account_noted: response.data.message || ""
      };
      setAccountStatus(statusData);
    } catch (error) {
      console.error("Error fetching account status:", error);
      setAccountStatus({ status: 'Active' });
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      fetchAccountStatus();
    } else {
      setAccountStatus(null);
      setIsLoading(false);
    }
  }, [fetchAccountStatus, user]);

  const handleLogout = async () => {
    await logout();
    router.push("/login");
  };

  return {
    accountStatus,
    isLoading,
    handleLogout,
    refetch: fetchAccountStatus,
  };
}
