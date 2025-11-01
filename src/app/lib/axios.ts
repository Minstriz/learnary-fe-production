// app/lib/axios.ts
import axios from 'axios';

const BACKEND_URL = 'http://localhost:4000'; 

const api = axios.create({
  baseURL: `${BACKEND_URL}/api`,
});

// Bộ chặn (Interceptor)
api.interceptors.request.use(
  (config) => {
    // Lấy token từ localStorage
    const token = localStorage.getItem('authToken');

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

export default api;