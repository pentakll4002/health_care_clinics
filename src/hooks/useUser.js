import { useQuery } from '@tanstack/react-query';
import axiosInstance from '../utils/axiosInstance';

async function getUserProfile() {
  try {
    const response = await axiosInstance.get('/user-profile');
    return response.data;
  } catch (error) {
    // Nếu lỗi 401, clear token và redirect về login
    if (error?.response?.status === 401) {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('token');
      window.location.href = '/sign-in';
    }
    throw error;
  }
}

export function useUser() {
  const token = localStorage.getItem('auth_token') || localStorage.getItem('token');
  
  const { data, isLoading, error } = useQuery({
    queryKey: ['user-profile'],
    queryFn: getUserProfile,
    retry: (failureCount, error) => {
      // Không retry nếu lỗi 401 (Unauthorized)
      if (error?.response?.status === 401) {
        return false;
      }
      return failureCount < 1;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    enabled: !!token, // Chỉ enable khi có token
  });

  // Backend returns UserProfileDTO directly, not wrapped in {user: ...}
  const user = data;
  
  const nhanVien = user?.nhanVien;
  const isNhanVien = (nhanVien !== null && nhanVien !== undefined) || user?.role === 'nhan_vien';

  return {
    user,
    isLoading,
    isNhanVien,
    nhanVien,
    error,
  };
}
