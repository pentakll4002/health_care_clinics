import { useQuery } from '@tanstack/react-query';
import { useState, useEffect } from 'react';
import { getPhieuKhamList } from './API_PhieuKham';
import { PAGE_SIZE_LOAD_MORE } from '../../constants/Global';

export function usePhieuKhamList() {
  const [page, setPage] = useState(1);
  const [phieuKhams, setPhieuKhams] = useState([]);

  const { isLoading, data } = useQuery({
    queryKey: ['phieukham-list'],
    queryFn: getPhieuKhamList,
  });

  // Backend returns either a flat array or {data, totalCount}
  const rawData = Array.isArray(data) ? data : (data?.data || []);
  const totalCount = Array.isArray(data) ? data.length : (data?.totalCount || 0);

  useEffect(() => {
    if (!rawData || rawData.length === 0) return;
    const slice = rawData.slice(0, page * PAGE_SIZE_LOAD_MORE);
    setPhieuKhams(slice);
  }, [rawData, page]);

  function loadMore() {
    setPage((prev) => prev + 1);
  }

  const hasMore = phieuKhams.length < totalCount;

  return { isLoading, phieuKhams, totalCount, hasMore, loadMore };
}
