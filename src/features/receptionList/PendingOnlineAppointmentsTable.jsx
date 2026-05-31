import Table from '../../ui/Table';
import Spinner from '../../ui/Spinner';
import styled from 'styled-components';
import { useAllLichKhams } from '../lichKham/useAllLichKhams';
import PendingOnlineAppointmentsTableRow from './PendingOnlineAppointmentsTableRow';

const Container = styled.div`
  background-color: #fff;
  border-radius: 6px;
  border: 1px solid #e7e8eb;
  overflow: hidden;
`;

const PendingOnlineAppointmentsTable = ({ filterDate }) => {
  const { isLoading, lichKhams } = useAllLichKhams();

  if (isLoading) return <Spinner />;

  // Filter lich khams that are pending online approval
  let pendingLichKhams = (lichKhams || []).filter(
    (lk) => lk.trangThai === 'ChoXacNhan' || lk.TrangThai === 'ChoXacNhan'
  );

  if (filterDate) {
    pendingLichKhams = pendingLichKhams.filter(
      (lk) => lk.ngayKhamDuKien === filterDate || lk.NgayKhamDuKien === filterDate
    );
  }

  if (pendingLichKhams.length === 0) {
    return (
      <div className='text-center py-10 text-grey-500 bg-white rounded-lg border border-grey-transparent'>
        Không có lịch hẹn online chờ duyệt
      </div>
    );
  }

  return (
    <Container>
      <Table columns='1fr 2fr 2fr 1fr 2fr 2fr'>
        <Table.Header>
          <div className='text-center'>ID</div>
          <div className='text-center'>Bệnh nhân</div>
          <div className='text-center'>Ngày khám</div>
          <div className='text-center'>Ca</div>
          <div className='text-center'>Bác sĩ</div>
          <div className='text-center'>Thao tác</div>
        </Table.Header>

        <Table.Body
          data={pendingLichKhams}
          render={(lichKham) => (
            <PendingOnlineAppointmentsTableRow key={lichKham.idLichKham || lichKham.ID_LichKham} lichKham={lichKham} />
          )}
        />
      </Table>
    </Container>
  );
};

export default PendingOnlineAppointmentsTable;
