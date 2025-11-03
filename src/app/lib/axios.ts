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
    // Lấy token từ sessionStorage  
    const token = sessionStorage.getItem('accessToken');

    if (token) {
      // Nếu có token, gắn nó vào header
      config.headers.Authorization = `Bearer ${token}`;
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
    // Nếu lỗi 401 (Hết hạn) VÀ chưa thử lại
    if (error.response.status === 401 && !originalRequest._retry && !isRefreshRequest) {
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
        window.location.href = '/login'; // Buộc tải lại trang login
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);

export default api;