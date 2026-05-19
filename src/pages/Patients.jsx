import { useState } from 'react';
import PatientsCardContainer from '../features/patients/PatientsCardContainer';
import AddPatient from '../features/patients/AddPatient';
import PatientSearchForm from '../features/patients/PatientSearchForm';
import { usePatients } from '../features/patients/usePatients';
import Spinner from '../ui/Spinner';
import Search from '../features/Search/Search';
import Filter from '../ui/Filter';

const Patients = () => {
  const [searchKeyword, setSearchKeyword] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchParams, setSearchParams] = useState({});

  const { totalCount, isLoading } = usePatients({
    ...searchParams,
    keyword: searchKeyword,
  });

  if (isLoading) return <Spinner />;

  function handleSearch(params) {
    setSearchParams(params);
    setIsSearchOpen(false);
  }

  function handleReset() {
    setSearchKeyword('');
    setSearchParams({});
    setIsSearchOpen(false);
  }

  return (
    <div className='w-full h-full p-5' style={{ backgroundColor: 'var(--bg-secondary)' }}>
      <div className='flex items-center justify-between mb-5'>
        <div className='flex items-center gap-3'>
          <h2 className='text-lg font-bold' style={{ color: 'var(--text-primary)' }}>
            Bệnh Nhân
          </h2>
          <div
            className='flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-md'
            style={{ backgroundColor: 'var(--accent-light)', color: 'var(--accent)' }}
          >
            <span>Tổng bệnh nhân:</span>
            <span>{totalCount || 0}</span>
          </div>
          <Search
            onSearch={(value) => {
              const keyword = value.trim();
              if (!keyword) return;
              setSearchKeyword(keyword);
              setSearchParams({ exact: true });
            }}
          />
        </div>

        <div className='flex items-center gap-3'>
          <Filter
            filterField='status'
            options={[
              { value: 'Tất cả', label: 'Tất cả' },
            ]}
          />
          <AddPatient />
        </div>
      </div>

      <PatientSearchForm
        isOpen={isSearchOpen}
        onSearch={handleSearch}
        onReset={handleReset}
      />

      <PatientsCardContainer
        searchParams={{ ...searchParams, keyword: searchKeyword }}
      />
    </div>
  );
};

export default Patients;
