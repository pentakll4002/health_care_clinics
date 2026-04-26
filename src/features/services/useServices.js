import { useQuery } from '@tanstack/react-query';
import { getServices } from './APIServices';

export function useServices() {
  const { isLoading, data } = useQuery({
    queryKey: ['services'],
    queryFn: getServices,
  });

  return { isLoading, services: Array.isArray(data) ? data : (data?.data || []) };
}
