import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: 'http://localhost:8080/api',
});

axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token') || localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    if (config.data instanceof FormData) {
      delete config.headers['Content-Type'];
    } else if (!config.headers['Content-Type'] && config.method !== 'get') {
      config.headers['Content-Type'] = 'application/json';
    }
    config.headers.Accept = 'application/json';
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor để xử lý lỗi 401 (Unauthorized)
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token không hợp lệ hoặc đã hết hạn
      localStorage.removeItem('auth_token');
      localStorage.removeItem('token');
      // Redirect về trang login nếu không đang ở đó
      if (window.location.pathname !== '/sign-in' && !window.location.pathname.startsWith('/forgot-password')) {
        window.location.href = '/sign-in';
      }
    }
    return Promise.reject(error);
  }
);

export const axiosChatbot = axios.create({
  baseURL: 'http://localhost:8002/api/chat',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});

export default axiosInstance;
