import styled from 'styled-components';
import Button from '../../ui/Button';
import { useCancelLichKham } from './useCancelLichKham';
import { CalendarIcon, ClockIcon, XMarkIcon } from '@heroicons/react/24/outline';

const Card = styled.div`
  background: #fff;
  border: 1px solid #e7e8eb;
  border-radius: 6px;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const StatusBadge = styled.span`
  display: inline-block;
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
`;

const LichKhamCard = ({ lichKham }) => {
  const { mutate: cancelLichKham, isLoading } = useCancelLichKham();

  // Support both camelCase (DTO) and PascalCase (legacy) field names
  const lkId = lichKham.idLichKham || lichKham.ID_LichKham;
  const lkNgayKham = lichKham.ngayKhamDuKien || lichKham.NgayKhamDuKien;
  const lkCaKham = lichKham.caKham || lichKham.CaKham;
  const lkTrangThai = lichKham.trangThai || lichKham.TrangThai;
  const lkGhiChu = lichKham.ghiChu || lichKham.GhiChu;
  const lkTenBacSi = lichKham.tenBacSi || lichKham.TenBacSi;

  const getStatusBadge = (trangThai) => {
    switch (trangThai) {
      case 'ChoXacNhan':
        return (
          <StatusBadge className='bg-warning-100 text-warning-900'>
            Chờ xác nhận
          </StatusBadge>
        );
      case 'DaXacNhan':
        return (
          <StatusBadge className='bg-success-100 text-success-900'>
            Đã xác nhận
          </StatusBadge>
        );
      case 'Huy':
        return (
          <StatusBadge className='bg-error-100 text-error-900'>
            Đã hủy
          </StatusBadge>
        );
      default:
        return <StatusBadge className='bg-grey-100 text-grey-700'>{trangThai || '—'}</StatusBadge>;
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '—';
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const handleCancel = () => {
    if (window.confirm('Bạn có chắc chắn muốn hủy lịch khám này?')) {
      cancelLichKham(lkId);
    }
  };

  return (
    <Card>
      <div className='flex items-start justify-between'>
        <div className='flex-1'>
          <div className='flex items-center gap-2 mb-2'>
            <h3 className='text-lg font-semibold text-grey-900'>
              Lịch khám #{lkId}
            </h3>
            {getStatusBadge(lkTrangThai)}
          </div>

          <div className='flex flex-col gap-2 text-sm text-grey-600'>
            <div className='flex items-center gap-2'>
              <CalendarIcon className='w-5 h-5 text-primary' />
              <span>{formatDate(lkNgayKham)}</span>
            </div>
            <div className='flex items-center gap-2'>
              <ClockIcon className='w-5 h-5 text-primary' />
              <span>Ca: {lkCaKham}</span>
            </div>
            {lkTenBacSi && (
              <div className='flex items-center gap-2'>
                <span className='text-sm text-grey-600'>Bác sĩ: <strong>{lkTenBacSi}</strong></span>
              </div>
            )}
          </div>

          {lkGhiChu && (
            <div className='mt-3 p-3 bg-grey-50 rounded-md'>
              <p className='text-sm text-grey-700'>
                <strong>Ghi chú:</strong> {lkGhiChu}
              </p>
            </div>
          )}
        </div>
      </div>

      {lkTrangThai === 'ChoXacNhan' && (
        <div className='flex justify-end pt-2 border-t border-grey-transparent'>
          <Button
            onClick={handleCancel}
            disabled={isLoading}
            className='flex items-center gap-2 bg-error-100 text-error-900 hover:bg-error-200 px-3 py-1.5 text-sm'
          >
            <XMarkIcon className='w-4 h-4' />
            {isLoading ? 'Đang hủy...' : 'Hủy lịch khám'}
          </Button>
        </div>
      )}
    </Card>
  );
};

export default LichKhamCard;
