import EmployeesContainer from '../features/employee/EmployeesContainer';
import Search from '../features/Search/Search';
import { FunnelIcon } from '@heroicons/react/24/outline';
import Spinner from '../ui/Spinner';
import { useEmployees } from '../features/employee/useEmployees';
import AddEmployee from '../features/employee/AddEmployee';
import { useSearchParams } from 'react-router-dom';

function Employees() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { totalCount, isLoading } = useEmployees();

  if (isLoading) {
    return (
      <div className='flex items-center justify-center w-full h-full'>
        <Spinner />
      </div>
    );
  }

  return (
    <div className='w-full h-full p-5' style={{ backgroundColor: 'var(--bg-secondary)' }}>
      <div className='flex items-center justify-between mb-5'>
        <div className='flex items-center gap-3'>
          <h2 className='text-lg font-bold' style={{ color: 'var(--text-primary)' }}>
            Nhân viên
          </h2>
          <div
            className='flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-md'
            style={{ backgroundColor: 'var(--accent-light)', color: 'var(--accent)' }}
          >
            <span>Tổng:</span>
            <strong>{totalCount ?? 0}</strong>
          </div>
          <Search
            onSearch={(value) => {
              const next = new URLSearchParams(searchParams);
              const keyword = value.trim();
              next.delete('page');
              if (!keyword) {
                next.delete('search');
              } else {
                next.set('search', keyword);
              }
              setSearchParams(next);
            }}
          />
        </div>
        <div className='flex items-center gap-3'>
          <button
            className='flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg border transition-colors'
            style={{
              backgroundColor: 'var(--bg-card)',
              borderColor: 'var(--border-color)',
              color: 'var(--text-primary)',
            }}
          >
            <FunnelIcon className='w-4 h-4' />
            <span>Bộ lọc</span>
          </button>
          <AddEmployee />
        </div>
      </div>

      <EmployeesContainer />
    </div>
  );
}

export default Employees;
