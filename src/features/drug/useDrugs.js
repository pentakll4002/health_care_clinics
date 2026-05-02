import { useQuery } from '@tanstack/react-query';
import { useState, useEffect } from 'react';
import { getDrugs } from './APIDrugs';

export function useDrugs({ keyword = '', page = 1, limit = 100 } = {}) {
  const [curPage, setPage] = useState(page);
  const [drugs, setDrugs] = useState([]);
  const { isLoading, data } = useQuery({
    queryKey: ['drugs', keyword, curPage, limit],
    queryFn: () => getDrugs(curPage, limit, keyword),
  });

  // Backend returns array directly OR wrapped in {data, totalCount}
  const rawDrugs = Array.isArray(data) ? data : (data?.data || []);
  const totalCount = Array.isArray(data) ? data.length : (data?.totalCount || 0);

  useEffect(() => {
    setPage(page);
  }, [page]);

  // Reset về trang 1 khi keyword thay đổi
  useEffect(() => {
    setPage(1);
    setDrugs([]);
  }, [keyword]);

  useEffect(() => {
    if (!rawDrugs || rawDrugs.length === 0) return;
    
    // Nếu đang ở trang 1, thay thế danh sách
    // Nếu load more (trang > 1), append vào danh sách
    if (curPage === 1) {
      setDrugs(rawDrugs);
    } else {
      setDrugs((prev) => {
        // Tránh duplicate khi append
        const existingIds = new Set(prev.map(d => d.idThuoc || d.ID_Thuoc));
        const newDrugs = rawDrugs.filter(d => !existingIds.has(d.idThuoc || d.ID_Thuoc));
        return [...prev, ...newDrugs];
      });
    }
  }, [data, curPage]);

  function loadMore() {
    setPage((prev) => prev + 1);
  }

  const hasMore = drugs.length < totalCount;

  return { isLoading, drugs, totalCount, hasMore, loadMore };
}
