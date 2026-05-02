import styled from 'styled-components';
import { useMemo } from 'react';
import Table from '../../ui/Table';
import { useAllLichKhams } from './useAllLichKhams';
import Spinner from '../../ui/Spinner';
import LichKhamTableRow from './LichKhamTableRow';

const Container = styled.div`
  background-color: #fff;
  border-radius: 6px;
  border: 1px solid #e7e8eb;
  overflow: hidden;
`;

// filterRange: { from: 'YYYY-MM-DD', to: 'YYYY-MM-DD' }
const LichKhamTableContainer = ({ filterStatus, filterDate, filterRange }) => {
  const params = {};
  if (filterStatus) params.TrangThai = filterStatus;
  if (filterDate) params.NgayKhamDuKien = filterDate;

  const { isLoading, lichKhams: rawLichKhams } = useAllLichKhams(params);

  const lichKhams = useMemo(() => {
    if (!filterRange || !filterRange.from || !filterRange.to) {
      return rawLichKhams || [];
    }
    const from = new Date(filterRange.from);
    const to = new Date(filterRange.to);
    return (rawLichKhams || []).filter((lk) => {
      const ngay = lk.ngayKhamDuKien || lk.NgayKhamDuKien;
      if (!ngay) return false;
      const d = new Date(ngay);
      return d >= from && d <= to;
    });
  }, [rawLichKhams, filterRange]);

  if (isLoading) return <Spinner />;

  if (!lichKhams || lichKhams.length === 0) {
    return (
      <div className='text-center py-10 text-grey-500 bg-white rounded-lg border border-grey-transparent'>
        Không có lịch khám nào
      </div>
    );
  }

  return (
    <Container>
      <Table columns='1fr 2fr 2fr 1fr 1.5fr 2fr 1.5fr'>
        <Table.Header>
          <div className='text-center'>ID</div>
          <div className='text-center'>Bệnh nhân</div>
          <div className='text-center'>Ngày khám</div>
          <div className='text-center'>Ca khám</div>
          <div className='text-center'>Trạng thái</div>
          <div className='text-center'>Ghi chú</div>
          <div className='text-center'>Thao tác</div>
        </Table.Header>

        <Table.Body
          data={lichKhams}
          render={(lichKham) => (
            <LichKhamTableRow key={lichKham.idLichKham || lichKham.ID_LichKham} lichKham={lichKham} />
          )}
        />
      </Table>
    </Container>
  );
};

export default LichKhamTableContainer;


