import { useQuery } from '@tanstack/react-query';
import { getDrugs } from './APIDrugs';

const DRUGS_PER_PAGE = 12;

export function useDrugs({ keyword = '', page = 1 } = {}) {
  const { isLoading, data, isFetching } = useQuery({
    queryKey: ['drugs', keyword, page, DRUGS_PER_PAGE],
    queryFn: () => getDrugs(page, DRUGS_PER_PAGE, keyword),
    keepPreviousData: true,
  });

  // Handle both formats:
  // New backend: {data: [...], totalCount: N, totalPages: N}
  // Old backend: [...] (flat array)
  const isNewFormat = data && !Array.isArray(data) && data.data;
  const drugs = isNewFormat ? data.data : (Array.isArray(data) ? data : []);
  const totalCount = isNewFormat ? data.totalCount : drugs.length;
  const totalPages = isNewFormat
    ? data.totalPages
    : Math.ceil(totalCount / DRUGS_PER_PAGE);

  return {
    isLoading,
    isFetching,
    drugs,
    totalCount,
    totalPages,
    currentPage: page,
    pageSize: DRUGS_PER_PAGE,
  };
}
