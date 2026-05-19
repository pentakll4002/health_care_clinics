import DrugCard from './DrugCard';
import Spinner from '../../ui/Spinner';
import { useDrugs } from './useDrugs';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/16/solid';

const DrugCardContainer = ({ searchKeyword = '' }) => {
  const {
    isLoading,
    drugs,
    totalCount,
    totalPages,
    currentPage,
    setPage,
  } = useDrugsWithPage({ keyword: searchKeyword });

  if (isLoading) return <Spinner />;

  if (drugs.length === 0) {
    return (
      <div
        className='text-center py-10 text-sm font-medium'
        style={{ color: 'var(--text-muted)' }}
      >
        {searchKeyword
          ? `Không tìm thấy thuốc nào với từ khóa "${searchKeyword}"`
          : 'Không có thuốc nào'}
      </div>
    );
  }

  return (
    <>
      {/* Drug Grid - 4 columns, compact cards */}
      <div className='grid grid-cols-4 gap-4'>
        {drugs.map((drug) => (
          <DrugCard key={drug.idThuoc} drug={drug} />
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <DrugPagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalCount={totalCount}
          onPageChange={setPage}
        />
      )}
    </>
  );
};

/* ── Drug Pagination Component ── */
const DrugPagination = ({ currentPage, totalPages, totalCount, onPageChange }) => {
  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible + 2) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);

      let start = Math.max(2, currentPage - 1);
      let end = Math.min(totalPages - 1, currentPage + 1);

      if (currentPage <= 3) {
        start = 2;
        end = Math.min(maxVisible, totalPages - 1);
      } else if (currentPage >= totalPages - 2) {
        start = Math.max(2, totalPages - maxVisible + 1);
        end = totalPages - 1;
      }

      if (start > 2) pages.push('...');
      for (let i = start; i <= end; i++) pages.push(i);
      if (end < totalPages - 1) pages.push('...');

      pages.push(totalPages);
    }
    return pages;
  };

  return (
    <div className='flex items-center justify-between mt-5'>
      <p className='text-sm' style={{ color: 'var(--text-secondary)' }}>
        Trang{' '}
        <span className='font-semibold' style={{ color: 'var(--text-primary)' }}>
          {currentPage}
        </span>{' '}
        / {totalPages} ({totalCount} thuốc)
      </p>

      <div className='flex items-center gap-1'>
        {/* Prev */}
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className='p-1.5 rounded-lg transition-colors disabled:opacity-30'
          style={{
            backgroundColor: 'var(--bg-card)',
            border: '1px solid var(--border-color)',
            color: 'var(--text-primary)',
          }}
        >
          <ChevronLeftIcon className='w-4 h-4' />
        </button>

        {/* Page Numbers */}
        {getPageNumbers().map((page, idx) =>
          page === '...' ? (
            <span
              key={`dots-${idx}`}
              className='px-2 text-sm'
              style={{ color: 'var(--text-muted)' }}
            >
              ...
            </span>
          ) : (
            <button
              key={page}
              onClick={() => onPageChange(page)}
              className='min-w-[32px] h-8 rounded-lg text-sm font-medium transition-all duration-150'
              style={{
                backgroundColor: page === currentPage ? 'var(--accent)' : 'var(--bg-card)',
                color: page === currentPage ? '#fff' : 'var(--text-primary)',
                border: page === currentPage ? 'none' : '1px solid var(--border-color)',
              }}
              onMouseEnter={(e) => {
                if (page !== currentPage) e.currentTarget.style.backgroundColor = 'var(--bg-hover)';
              }}
              onMouseLeave={(e) => {
                if (page !== currentPage) e.currentTarget.style.backgroundColor = 'var(--bg-card)';
              }}
            >
              {page}
            </button>
          )
        )}

        {/* Next */}
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className='p-1.5 rounded-lg transition-colors disabled:opacity-30'
          style={{
            backgroundColor: 'var(--bg-card)',
            border: '1px solid var(--border-color)',
            color: 'var(--text-primary)',
          }}
        >
          <ChevronRightIcon className='w-4 h-4' />
        </button>
      </div>
    </div>
  );
};

/* ── Wrapper hook that manages page state ── */
import { useState, useEffect } from 'react';

function useDrugsWithPage({ keyword = '' } = {}) {
  const [page, setPage] = useState(1);

  // Reset to page 1 when keyword changes
  useEffect(() => {
    setPage(1);
  }, [keyword]);

  const result = useDrugs({ keyword, page });

  return { ...result, currentPage: page, setPage };
}

export default DrugCardContainer;
