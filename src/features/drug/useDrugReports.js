import { useQuery } from '@tanstack/react-query';
import { getDrugReports } from './APIDrugs';

export function useDrugReports({ thang, nam, id_thuoc } = {}) {
  const { isLoading, data } = useQuery({
    queryKey: ['drugReports', thang, nam, id_thuoc],
    queryFn: () => getDrugReports({ page: 1, limit: 100, thang, nam, id_thuoc }),
    keepPreviousData: true,
    retry: false,
  });

  const reports = data?.data || (Array.isArray(data) ? data : []);
  const totalCount = data?.totalCount || reports.length || 0;

  return { isLoading, reports, totalCount };
}
