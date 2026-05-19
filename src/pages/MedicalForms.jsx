import MedicalFormsContainer from '../features/medicalForm/MedicalFormsContainer';
import { usePhieuKhamList } from '../features/medicalForm/usePhieuKhamList';
import Spinner from '../ui/Spinner';
import Search from '../features/Search/Search';
import { useState } from 'react';
import Filter from '../ui/Filter';
import { DocumentTextIcon } from '@heroicons/react/24/outline';

const MedicalForms = () => {
  const [searchKeyword, setSearchKeyword] = useState("");
  const { totalCount, isLoading } = usePhieuKhamList({ keyword: searchKeyword });

  if (isLoading) return <Spinner />;

  return (
    <div className='w-full h-full p-5' style={{ backgroundColor: 'var(--bg-secondary)' }}>
      <div className='flex items-center justify-between mb-5'>
        <div className='flex items-center gap-3'>
          <h2 className='text-lg font-bold' style={{ color: 'var(--text-primary)' }}>
            Phiếu Khám
          </h2>
          <div
            className='flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-md'
            style={{ backgroundColor: 'var(--accent-light)', color: 'var(--accent)' }}
          >
            <span>Tổng phiếu khám:</span>
            <span>{totalCount}</span>
          </div>
          <Search onSearch={setSearchKeyword} />
        </div>

        <div className='flex items-center gap-3'>
          <Filter
            filterField='status'
            options={[
              { value: 'All', label: 'Tất cả' },
              { value: '', label: 'Ca' },
            ]}
          />
        </div>
      </div>

      {totalCount === 0 ? (
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
            <DocumentTextIcon className='w-8 h-8' style={{ color: 'var(--accent)' }} />
          </div>
          <h3 className='text-base font-semibold mb-1' style={{ color: 'var(--text-primary)' }}>
            Không có phiếu khám nào
          </h3>
          <p className='text-sm max-w-md text-center' style={{ color: 'var(--text-muted)' }}>
            Phiếu khám sẽ được tạo khi bác sĩ khám bệnh nhân. Bạn có thể tìm kiếm hoặc lọc phiếu khám ở trên.
          </p>
        </div>
      ) : (
        <MedicalFormsContainer searchKeyword={searchKeyword} />
      )}
    </div>
  );
};

export default MedicalForms;
