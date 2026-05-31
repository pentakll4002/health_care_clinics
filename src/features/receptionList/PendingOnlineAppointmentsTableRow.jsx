import styled from 'styled-components';
import Table from '../../ui/Table';
import Button from '../../ui/Button';
import { useCreateReceptionFromLichKham } from './useCreateReceptionFromLichKham';
import { useRejectLichKham } from './useRejectLichKham';

const Text = styled.span`
  color: #0a1b39;
  font-size: 14px;
  font-weight: 500;
  margin: auto;
`;

const PendingOnlineAppointmentsTableRow = ({ lichKham }) => {
  const { mutate: createReception, isPending: isConfirming } = useCreateReceptionFromLichKham();
  const { mutate: rejectLichKham, isPending: isRejecting } = useRejectLichKham();

  const isWorking = isConfirming || isRejecting;

  const formatDate = (dateString) => {
    if (!dateString) return '—';
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN');
  };

  const handleConfirm = () => {
    if (window.confirm(`Xác nhận lịch hẹn #${lichKham.idLichKham || lichKham.ID_LichKham} của bệnh nhân ${lichKham.tenBenhNhan || 'N/A'}?`)) {
      createReception(lichKham.idLichKham || lichKham.ID_LichKham);
    }
  };

  const handleReject = () => {
    if (window.confirm(`Không xác nhận (từ chối) lịch hẹn #${lichKham.idLichKham || lichKham.ID_LichKham} của bệnh nhân ${lichKham.tenBenhNhan || 'N/A'}?`)) {
      rejectLichKham(lichKham.idLichKham || lichKham.ID_LichKham);
    }
  };

  return (
    <Table.Row>
      <Text className='text-center'>#{lichKham.idLichKham || lichKham.ID_LichKham}</Text>
      <Text className='text-center'>{lichKham.tenBenhNhan || '—'}</Text>
      <Text className='text-center'>{formatDate(lichKham.ngayKhamDuKien)}</Text>
      <Text className='text-center'>{lichKham.caKham || '—'}</Text>
      <Text className='text-center'>{lichKham.tenBacSi || '—'}</Text>
      <div className='flex items-center justify-center gap-2'>
        <Button
          className='bg-success-600 text-white text-sm px-3 py-1.5'
          disabled={isWorking}
          onClick={handleConfirm}
        >
          {isConfirming ? '...' : 'Xác nhận'}
        </Button>
        <Button
          className='bg-error-600 text-white text-sm px-3 py-1.5'
          disabled={isWorking}
          onClick={handleReject}
        >
          {isRejecting ? '...' : 'Không xác nhận'}
        </Button>
      </div>
    </Table.Row>
  );
};

export default PendingOnlineAppointmentsTableRow;
