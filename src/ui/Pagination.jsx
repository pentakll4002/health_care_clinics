import { useSearchParams } from 'react-router-dom';
import { PAGE_SIZE } from '../constants/Global';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/16/solid';

const Pagination = ({ count, pageSize }) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const currentPage = !searchParams.get('page')
    ? 1
    : Number(searchParams.get('page'));

  const size = pageSize || PAGE_SIZE;
  const pageCount = Math.ceil(count / size);

  function nextPage() {
    const next = currentPage === pageCount ? currentPage : currentPage + 1;
    searchParams.set('page', next);
    setSearchParams(searchParams);
  }

  function prevPage() {
    const prev = currentPage === 1 ? currentPage : currentPage - 1;
    searchParams.set('page', prev);
    setSearchParams(searchParams);
  }

  if (pageCount <= 1) return null;

  return (
    <div className='w-full flex items-center justify-between mt-4'>
      <p className='text-sm ml-2' style={{ color: 'var(--text-secondary)' }}>
        Hiển thị{' '}
        <span className='font-semibold' style={{ color: 'var(--text-primary)' }}>
          {(currentPage - 1) * size + 1}
        </span>{' '}
        đến{' '}
        <span className='font-semibold' style={{ color: 'var(--text-primary)' }}>
          {currentPage === pageCount ? count : currentPage * size}
        </span>{' '}
        trong{' '}
        <span className='font-semibold' style={{ color: 'var(--text-primary)' }}>
          {count}
        </span>{' '}
        kết quả
      </p>

      <div className='flex gap-2'>
        <button
          onClick={prevPage}
          disabled={currentPage === 1}
          className='flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 disabled:opacity-40'
          style={{
            backgroundColor: 'var(--bg-card)',
            color: 'var(--text-primary)',
            border: '1px solid var(--border-color)',
          }}
          onMouseEnter={(e) => {
            if (!e.currentTarget.disabled) e.currentTarget.style.backgroundColor = 'var(--bg-hover)';
          }}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-card)'}
        >
          <ChevronLeftIcon className='w-4 h-4' />
          <span>Trước</span>
        </button>

        <div
          className='flex items-center px-3 py-1.5 rounded-lg text-sm font-semibold'
          style={{
            backgroundColor: 'var(--accent-light)',
            color: 'var(--accent)',
          }}
        >
          {currentPage} / {pageCount}
        </div>

        <button
          onClick={nextPage}
          disabled={currentPage === pageCount}
          className='flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 disabled:opacity-40'
          style={{
            backgroundColor: 'var(--bg-card)',
            color: 'var(--text-primary)',
            border: '1px solid var(--border-color)',
          }}
          onMouseEnter={(e) => {
            if (!e.currentTarget.disabled) e.currentTarget.style.backgroundColor = 'var(--bg-hover)';
          }}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-card)'}
        >
          <span>Sau</span>
          <ChevronRightIcon className='w-4 h-4' />
        </button>
      </div>
    </div>
  );
};

export default Pagination;
