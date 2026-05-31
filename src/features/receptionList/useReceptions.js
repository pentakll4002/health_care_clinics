import { useQuery } from '@tanstack/react-query';
import { getReceptions } from './APIReception';

export function useReceptions(params = {}) {
  const { isLoading, data, refetch } = useQuery({
    queryKey: ['receptions', params],
    queryFn: () => getReceptions(params),
    refetchInterval: 5000,
  });

  return {
    isLoading,
    data: data?.data || data || [],
    totalCount: data?.totalCount || (Array.isArray(data) ? data.length : 0),
    refetch,
  };
}
