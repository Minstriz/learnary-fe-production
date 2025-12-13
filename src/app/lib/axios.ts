  // app/lib/axios.ts
  import axios from 'axios';

  const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL; 

  const api = axios.create({
    baseURL: `${BACKEND_URL}/api`,
    withCredentials: true,
  });

  // Bộ chặn (Interceptor)
  api.interceptors.request.use(
    (config) => {

      if (typeof window === 'undefined') return config;
      if (config.url?.includes('/auth/refresh')) return config;
      // Lấy token từ sessionStorage  
      const token = sessionStorage.getItem('accessToken');

      if (token) {
        // Nếu có token, gắn nó vào header
        config.headers.Authorization = `Bearer ${token}`;
        
      }else {
        // Quan trọng: Nếu không có token, xóa header này đi để tránh gửi rác
        delete config.headers.Authorization;
      }
      return config; 
    },
    (error) => {
      // Xử lý lỗi
      return Promise.reject(error);
    }
  );

  api.interceptors.response.use(
    (response) => response, // Nếu OK, trả về
    async (error) => {
      const originalRequest = error.config;
      //  KIỂM TRA XEM CÓ PHẢI CHÍNH LÀ REQUEST /refresh BỊ LỖI KHÔNG
      const isRefreshRequest = originalRequest.url.endsWith('/auth/refresh');
      
      // CHỈ thử refresh nếu ĐÃ CÓ token trong sessionStorage
      const hasToken = sessionStorage.getItem('accessToken');
      
      // Nếu lỗi 401 (Hết hạn) VÀ chưa thử lại VÀ đã có token
      if (error.response?.status === 401 && !originalRequest._retry && !isRefreshRequest && hasToken) {
        originalRequest._retry = true; // Đánh dấu đã thử lại
        
        try {
          // Gọi API /refresh
          const response = await api.post('/auth/refresh');
          const { accessToken: newAccessToken } = response.data;

          // LƯU VÉ MỚI VÀO sessionStorage
          sessionStorage.setItem('accessToken', newAccessToken);
          
          // Cập nhật header và thử lại request cũ
          api.defaults.headers.common['Authorization'] = `Bearer ${newAccessToken}`;
          originalRequest.headers['Authorization'] = `Bearer ${newAccessToken}`;
          
          return api(originalRequest); // Thử lại request
        } catch (refreshError) {
          // Nếu "két sắt" (RT) cũng hết hạn -> Đẩy về trang login
          sessionStorage.removeItem('accessToken');
          // CHỈ redirect nếu user đang ở trang yêu cầu authentication
          const protectedRoutes = ['/profile', '/learn-area', '/instructor', '/admin'];
          const currentPath = window.location.pathname;
          const isProtectedPage = protectedRoutes.some(route => currentPath.includes(route));
          if (isProtectedPage) {
            // Nếu trang bắt buộc -> Redirect về Login
            window.location.href = '/login';
            return Promise.reject(refreshError);
          } else {
            // Nếu trang KHÔNG bắt buộc (Ví dụ: Trang chủ, Trang Combo)
            // -> Xóa header Authorization và gọi lại API gốc một lần nữa dưới tư cách Khách (Guest)
            delete originalRequest.headers['Authorization'];
            return api(originalRequest);
          }
        }
      }
      return Promise.reject(error);
    }
  );

  export default api;