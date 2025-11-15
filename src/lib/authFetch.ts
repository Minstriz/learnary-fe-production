// lib/authFetch.ts
import { apiFetch } from './api';
import { useSession } from 'next-auth/react';

export function useAuthFetch() {
  const { data: session } = useSession();
  return async (url: string, options: RequestInit = {}) => {
    const headers = {
      ...options.headers,
      'Content-Type': 'application/json',
      'Authorization': session?.accessToken ? `Bearer ${session.accessToken}` : '',
    };

    try {
      const response = await apiFetch(url, { ...options, headers });

      // Xử lý lỗi 401 (Unauthorized) - token hết hạn
      if (response.status === 401) {
        // Có thể thêm logic để refresh token hoặc đăng xuất
        // signOut();
      }

      return response;
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  };
}