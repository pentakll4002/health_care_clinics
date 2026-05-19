import { useMemo, useState } from 'react';
import Spinner from '../ui/Spinner';
import Search from '../features/Search/Search';
import { useReceptionsToday } from '../features/receptionList/useReceptionsToday';
import DoctorQueueList from '../features/doctorWorkflow/DoctorQueueList';
import { ClipboardDocumentListIcon } from '@heroicons/react/24/outline';

const DoctorQueue = () => {
  const [searchKeyword, setSearchKeyword] = useState('');

  const params = useMemo(() => {
    return {
      ngay: new Date(new Date().getTime() - new Date().getTimezoneOffset() * 60000)
        .toISOString()
        .split('T')[0],
    };
  }, []);

  const { receptions, isLoading, totalCount, refetch } = useReceptionsToday(params);

  if (isLoading) return <Spinner />;

  return (
    <div className='w-full h-full p-5' style={{ backgroundColor: 'var(--bg-secondary)' }}>
      <div className='flex items-center justify-between mb-5'>
        <div className='flex items-center gap-3'>
          <h2 className='text-lg font-bold' style={{ color: 'var(--text-primary)' }}>
            Danh sách chờ khám
          </h2>
          <div
            className='flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-md'
            style={{ backgroundColor: 'var(--accent-light)', color: 'var(--accent)' }}
          >
            <span>Tổng:</span>
            <span>{totalCount || 0}</span>
          </div>
          <Search onSearch={setSearchKeyword} />
        </div>
      </div>

      {(!receptions || receptions.length === 0) ? (
        <EmptyState
          icon={ClipboardDocumentListIcon}
          title='Không có bệnh nhân nào đang chờ khám'
          description='Danh sách bệnh nhân chờ khám sẽ hiển thị ở đây khi có tiếp nhận mới trong ngày.'
        />
      ) : (
        <DoctorQueueList receptions={receptions} keyword={searchKeyword} onRefresh={refetch} />
      )}
    </div>
  );
};

const EmptyState = ({ icon: Icon, title, description }) => (
  <div
    className='flex flex-col items-center justify-center py-20 rounded-xl border'
    style={{
      backgroundColor: 'var(--bg-card)',
      borderColor: 'var(--border-color)',
    }}
  >
    <div
      className='w-16 h-16 rounded-full flex items-center justify-center mb-4'
      style={{ backgroundColor: 'var(--accent-light)' }}
    >
      <Icon className='w-8 h-8' style={{ color: 'var(--accent)' }} />
    </div>
    <h3 className='text-base font-semibold mb-1' style={{ color: 'var(--text-primary)' }}>
      {title}
    </h3>
    <p className='text-sm max-w-md text-center' style={{ color: 'var(--text-muted)' }}>
      {description}
    </p>
  </div>
);

export default DoctorQueue;
