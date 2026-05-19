import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import DrugCardContainer from '../features/drug/DrugCardContainer';
import DrugReportsContainer from '../features/drug/DrugReportsContainer';
import DrugImportContainer from '../features/drug/DrugImportContainer';
import { FunnelIcon } from '@heroicons/react/24/outline';
import AddDrug from '../features/drug/AddDrug';
import AddDrugReport from '../features/drug/AddDrugReport';
import AddDrugImport from '../features/drug/AddDrugImport';
import { useDrugReports } from '../features/drug/useDrugReports';
import Select from '../ui/Select';
import { useQuery } from '@tanstack/react-query';
import { getDrugs } from '../features/drug/APIDrugs';
import Spinner from '../ui/Spinner';
import Search from '../features/Search/Search';
import { useRolePermissions } from '../hooks/useRolePermissions';

const Drugs = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const tabFromUrl = searchParams.get('tab') || 'drugs';
  const [activeTab, setActiveTab] = useState(tabFromUrl);
  const [thang, setThang] = useState('');
  const [nam, setNam] = useState('');
  const [idThuoc, setIdThuoc] = useState('');
  const [searchKeyword, setSearchKeyword] = useState("");
  const [tuNgay, setTuNgay] = useState('');
  const [denNgay, setDenNgay] = useState('');
  const { isRole } = useRolePermissions();
  const isManager = isRole('@managers');

  useEffect(() => {
    const tab = searchParams.get('tab') || 'drugs';
    setActiveTab(tab);
  }, [searchParams]);

  const drugReportsHook = useDrugReports({
    thang: thang || undefined,
    nam: nam || undefined,
    id_thuoc: idThuoc || undefined,
  });
  const { totalCount: reportsCount } = drugReportsHook;

  const { data: drugsData } = useQuery({
    queryKey: ['drugs-list'],
    queryFn: () => getDrugs(1, 100),
  });
  const drugs = drugsData?.data || [];

  const months = Array.from({ length: 12 }, (_, i) => i + 1);
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 12 }, (_, i) => currentYear - 5 + i);

  function handleResetFilter() {
    setThang('');
    setNam('');
    setIdThuoc('');
  }

  const tabs = [
    { key: 'drugs', label: 'Danh Sách Thuốc' },
    { key: 'reports', label: 'Báo Cáo Sử Dụng Thuốc' },
    ...(isManager ? [{ key: 'imports', label: 'Nhập Kho' }] : []),
  ];

  return (
    <div className='w-full h-full p-5' style={{ backgroundColor: 'var(--bg-secondary)' }}>
      {/* Tabs */}
      <div
        className='flex gap-1 mb-5 border-b'
        style={{ borderColor: 'var(--border-color)' }}
      >
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => {
              setActiveTab(tab.key);
              const next = new URLSearchParams(searchParams);
              if (tab.key === 'drugs') next.delete('tab');
              else next.set('tab', tab.key);
              setSearchParams(next);
            }}
            className='px-5 py-2.5 text-sm font-medium transition-all duration-200 -mb-px'
            style={{
              color: activeTab === tab.key ? 'var(--accent)' : 'var(--text-muted)',
              borderBottom: activeTab === tab.key
                ? '2px solid var(--accent)'
                : '2px solid transparent',
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'drugs' ? (
        <>
          <div className='flex items-center justify-between mb-5'>
            <div className='flex items-center gap-3'>
              <h2 className='text-lg font-bold' style={{ color: 'var(--text-primary)' }}>
                Quản Lý Thuốc
              </h2>
              <Search onSearch={setSearchKeyword} />
            </div>
            <div className='flex items-center gap-3'>
              <AddDrug />
            </div>
          </div>
          <DrugCardContainer searchKeyword={searchKeyword} />
        </>
      ) : activeTab === 'reports' ? (
        <>
          <div className='flex items-center justify-between mb-5'>
            <div className='flex items-center gap-3'>
              <h2 className='text-lg font-bold' style={{ color: 'var(--text-primary)' }}>
                Báo Cáo Sử Dụng Thuốc
              </h2>
              <div
                className='flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-md'
                style={{
                  backgroundColor: 'var(--accent-light)',
                  color: 'var(--accent)',
                }}
              >
                <span>Tổng:</span>
                <span>{reportsCount}</span>
              </div>
            </div>
            <div className='flex items-center gap-2'>
              <div style={{ minWidth: '120px' }}>
                <Select value={thang} onChange={(e) => setThang(e.target.value)}>
                  <option value=''>Tất cả tháng</option>
                  {months.map((m) => (
                    <option key={m} value={m}>Tháng {m}</option>
                  ))}
                </Select>
              </div>
              <div style={{ minWidth: '120px' }}>
                <Select value={nam} onChange={(e) => setNam(e.target.value)}>
                  <option value=''>Tất cả năm</option>
                  {years.map((y) => (
                    <option key={y} value={y}>{y}</option>
                  ))}
                </Select>
              </div>
              <div style={{ minWidth: '150px' }}>
                <Select value={idThuoc} onChange={(e) => setIdThuoc(e.target.value)}>
                  <option value=''>Tất cả thuốc</option>
                  {drugs.map((d) => (
                    <option key={d.idThuoc} value={d.idThuoc}>{d.tenThuoc}</option>
                  ))}
                </Select>
              </div>
              {(thang || nam || idThuoc) && (
                <button
                  onClick={handleResetFilter}
                  className='px-3 py-2 text-sm font-medium rounded-lg border transition-colors'
                  style={{
                    backgroundColor: 'var(--bg-card)',
                    borderColor: 'var(--border-color)',
                    color: 'var(--text-secondary)',
                  }}
                >
                  Xóa bộ lọc
                </button>
              )}
              <AddDrugReport />
            </div>
          </div>
          <DrugReportsContainer
            {...drugReportsHook}
            thang={thang || undefined}
            nam={nam || undefined}
            id_thuoc={idThuoc || undefined}
          />
        </>
      ) : activeTab === 'imports' && isManager ? (
        <>
          <div className='flex items-center justify-between mb-5'>
            <h2 className='text-lg font-bold' style={{ color: 'var(--text-primary)' }}>
              Quản Lý Nhập Kho
            </h2>
            <div className='flex items-center gap-2'>
              <input
                type='date'
                value={tuNgay}
                onChange={(e) => setTuNgay(e.target.value)}
                className='px-3 py-2 text-sm rounded-lg border'
                style={{
                  backgroundColor: 'var(--bg-input)',
                  borderColor: 'var(--border-color)',
                  color: 'var(--text-primary)',
                }}
              />
              <input
                type='date'
                value={denNgay}
                onChange={(e) => setDenNgay(e.target.value)}
                className='px-3 py-2 text-sm rounded-lg border'
                style={{
                  backgroundColor: 'var(--bg-input)',
                  borderColor: 'var(--border-color)',
                  color: 'var(--text-primary)',
                }}
              />
              {(tuNgay || denNgay) && (
                <button
                  onClick={() => { setTuNgay(''); setDenNgay(''); }}
                  className='px-3 py-2 text-sm font-medium rounded-lg border transition-colors'
                  style={{
                    backgroundColor: 'var(--bg-card)',
                    borderColor: 'var(--border-color)',
                    color: 'var(--text-secondary)',
                  }}
                >
                  Xóa bộ lọc
                </button>
              )}
              <AddDrugImport />
            </div>
          </div>
          <DrugImportContainer
            tu_ngay={tuNgay || undefined}
            den_ngay={denNgay || undefined}
          />
        </>
      ) : null}
    </div>
  );
};

export default Drugs;
