import { useQuery } from '@tanstack/react-query';
import { getAllLichKhams } from './APILichKham';

export function useAllLichKhams(params = {}) {
  const { isLoading, data, refetch } = useQuery({
    queryKey: ['allLichKhams', params],
    queryFn: () => getAllLichKhams(params),
    refetchInterval: 5000,
  });

  return {
    isLoading,
    lichKhams: data?.data || [],
    totalCount: data?.totalCount || 0,
    refetch,
  };
}















