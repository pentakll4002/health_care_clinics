import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import PatientImg from '../../assets/patient.jpg';
import Button from '../../ui/Button';

const Container = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 18px;
  align-items: flex-start;
  border-radius: 6px;
  border: 1px solid #e7e8eb;
  background: #fff;
`;

const Image = styled.img`
  width: 48px;
  height: 48px;
  flex-shrink: 0;
  border-radius: 48px;
  object-fit: cover;
`;

const DoctorQueueItem = ({ tiepNhan }) => {
  const navigate = useNavigate();

  const benhNhan = tiepNhan?.benhNhan || tiepNhan?.benh_nhan || {
    HoTenBN: tiepNhan?.HoTenBN || tiepNhan?.tenBenhNhan,
    ID_BenhNhan: tiepNhan?.ID_BenhNhan || tiepNhan?.idBenhNhan,
    DienThoai: tiepNhan?.dienThoaiBenhNhan || tiepNhan?.DienThoai || tiepNhan?.dienThoai,
    CCCD: tiepNhan?.cccdBenhNhan || tiepNhan?.CCCD
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN');
  };

  return (
    <Container>
      <div className='flex items-start justify-between w-full gap-4'>
        <div className='flex items-center gap-x-3'>
          <Image src={PatientImg} alt='patient' />
          <div className='flex flex-col items-start justify-center'>
            <h3 className='text-sm font-semibold text-grey-900'>
              {benhNhan?.HoTenBN || 'N/A'}
            </h3>
            <p className='text-[13px] text-grey-500'>
              {formatDate(tiepNhan?.NgayTN)} - {tiepNhan?.CaTN}
            </p>
          </div>
        </div>

        {(() => {
          const status = tiepNhan?.TrangThaiTiepNhan || tiepNhan?.trangThaiTiepNhan || 'CHO_KHAM';
          if (status === 'DANG_KHAM') {
            return (
              <span className='px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-900'>
                Đang khám
              </span>
            );
          }
          if (status === 'DA_KHAM') {
            return (
              <span className='px-2 py-1 rounded-full text-xs font-medium bg-success-100 text-success-900'>
                Đã khám
              </span>
            );
          }
          return (
            <span className='px-2 py-1 rounded-full text-xs font-medium bg-warning-100 text-warning-900'>
              Chờ khám
            </span>
          );
        })()}
      </div>

      <div className='text-sm text-grey-600'>
        <div>
          <span className='font-semibold'>Mã tiếp nhận:</span> {tiepNhan?.ID_TiepNhan}
        </div>
        <div>
          <span className='font-semibold'>Điện thoại:</span> {benhNhan?.DienThoai || 'N/A'}
        </div>
      </div>

      <div className='flex items-center justify-end w-full gap-2'>
        <Button
          className='bg-light text-grey-900 px-3 py-2 text-sm'
          onClick={() => navigate(`/patients/${benhNhan?.ID_BenhNhan}`)}
        >
          Xem bệnh nhân
        </Button>
        <Button
          className='bg-primary text-white px-3 py-2 text-sm'
          onClick={() => navigate(`/doctor/exam/${tiepNhan?.ID_TiepNhan}`)}
        >
          Khám
        </Button>
      </div>
    </Container>
  );
};

export default DoctorQueueItem;
