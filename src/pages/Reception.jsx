import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { FunnelIcon } from '@heroicons/react/24/outline';
import styled from 'styled-components';
import AddReception from '../features/receptionList/AddReception';
import ReiceptionList from '../features/receptionList/ReiceptionList';
import { useReceptions } from '../features/receptionList/useReceptions';
import { useAllLichKhams } from '../features/lichKham/useAllLichKhams';
import PendingOnlineAppointmentsTable from '../features/receptionList/PendingOnlineAppointmentsTable';
import ReceptionsCardContainer from '../features/receptionList/ReceptionsCardContainer';

const LayoutReception = styled.div`
  width: 100%;
  height: 100%;
  padding: 20px;
  background-color: #f5f6f8;
`;

const LayoutFlex = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
`;

const TabContainer = styled.div`
  display: flex;
  gap: 8px;
  margin-bottom: 20px;
  border-bottom: 2px solid #e7e8eb;
`;

const Tab = styled.button`
  padding: 12px 24px;
  font-size: 14px;
  font-weight: 500;
  color: ${(props) => (props.active ? '#3b82f6' : '#6b7280')};
  background: none;
  border: none;
  border-bottom: 2px solid
    ${(props) => (props.active ? '#3b82f6' : 'transparent')};
  cursor: pointer;
  margin-bottom: -2px;
  transition: all 0.2s;

  &:hover {
    color: ${(props) => (props.active ? '#3b82f6' : '#374151')};
  }
`;

const Reception = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const tabFromUrl = searchParams.get('tab') || 'reception';
  const [activeTab, setActiveTab] = useState(tabFromUrl);
  const [filterDate, setFilterDate] = useState('');

  useEffect(() => {
    const tab = searchParams.get('tab') || 'reception';
    setActiveTab(tab);
  }, [searchParams]);

  const { lichKhams } = useAllLichKhams();
  const pendingCount = (lichKhams || []).filter(
    (lk) => lk.trangThai === 'ChoXacNhan' || lk.TrangThai === 'ChoXacNhan'
  ).length;

  const { totalCount: totalReceptions } = useReceptions();

  return (
    <LayoutReception>
      <TabContainer>
        <Tab
          active={activeTab === 'reception'}
          onClick={() => {
            setActiveTab('reception');
            const newSearchParams = new URLSearchParams(searchParams);
            newSearchParams.delete('tab');
            setSearchParams(newSearchParams);
          }}
        >
          Danh sách tiếp nhận
        </Tab>

        <Tab
          active={activeTab === 'online'}
          onClick={() => {
            setActiveTab('online');
            const newSearchParams = new URLSearchParams(searchParams);
            newSearchParams.set('tab', 'online');
            setSearchParams(newSearchParams);
          }}
        >
          Lịch hẹn online chờ duyệt
          {pendingCount > 0 && (
            <span className='ml-2 px-2 py-0.5 bg-warning-100 text-warning-900 rounded-full text-xs font-semibold'>
              {pendingCount}
            </span>
          )}
        </Tab>

        <Tab
          active={activeTab === 'waiting-today'}
          onClick={() => {
            setActiveTab('waiting-today');
            const newSearchParams = new URLSearchParams(searchParams);
            newSearchParams.set('tab', 'waiting-today');
            setSearchParams(newSearchParams);
          }}
        >
          Danh sách chờ khám (hôm nay)
        </Tab>
      </TabContainer>

      {activeTab === 'reception' ? (
        <>
          <LayoutFlex>
            <div className='flex items-center justify-center gap-x-3'>
              <h2 className='text-xl font-bold leading-6 text-grey-900'>
                Danh sách tiếp nhận
              </h2>

              <div className='flex items-center justify-center gap-1 px-2 py-1 text-xs font-medium border rounded-md text-primary border-primary bg-primary-transparent'>
                <span>Tổng hồ sơ:</span>
                <span>{totalReceptions}</span>
              </div>
            </div>

            <div className='flex items-center justify-center gap-x-4'>
              <div className='flex items-center justify-center p-2 text-sm font-medium bg-white border rounded-md border-grey-transparent shadow-1 gap-x-2 text-grey-900'>
                <FunnelIcon className='w-5 h-5' />
                <span>Filter</span>
              </div>

              <AddReception />
            </div>
          </LayoutFlex>

          <ReiceptionList />
        </>
      ) : activeTab === 'online' ? (
        <>
          <LayoutFlex>
            <div className='flex items-center justify-center gap-x-3'>
              <h2 className='text-xl font-bold leading-6 text-grey-900'>
                Lịch hẹn online chờ duyệt
              </h2>

              <div className='flex items-center justify-center gap-1 px-2 py-1 text-xs font-medium border rounded-md text-primary border-primary bg-primary-transparent'>
                <span>Tổng lịch hẹn:</span>
                <span>{pendingCount}</span>
              </div>
            </div>

            <div className='flex items-center justify-center gap-x-4'>
              <input
                type='date'
                value={filterDate}
                onChange={(e) => setFilterDate(e.target.value)}
                className='px-3 py-2 border border-grey-transparent rounded-md focus:outline-none focus:ring-2 focus:ring-primary text-sm'
              />

              {filterDate && (
                <button
                  onClick={() => setFilterDate('')}
                  className='px-3 py-2 text-sm text-grey-600 hover:text-grey-900'
                >
                  Xóa bộ lọc ngày
                </button>
              )}
            </div>
          </LayoutFlex>

          <PendingOnlineAppointmentsTable filterDate={filterDate || undefined} />
        </>
      ) : (
        <>
          <LayoutFlex>
            <h2 className='text-xl font-bold leading-6 text-grey-900'>
              Danh sách chờ khám (hôm nay)
            </h2>
          </LayoutFlex>

          <ReceptionsCardContainer />
        </>
      )}
    </LayoutReception>
  );
};

export default Reception;
