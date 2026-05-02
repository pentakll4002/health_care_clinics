import styled from 'styled-components';
import LichKhamCard from './LichKhamCard';
import { useLichKhams } from './useLichKhams';
import Spinner from '../../ui/Spinner';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const LichKhamContainer = ({ filterStatus }) => {
  const params = filterStatus ? { TrangThai: filterStatus } : {};
  const { isLoading, lichKhams } = useLichKhams(params);

  if (isLoading) return <Spinner />;

  if (lichKhams.length === 0) {
    return (
      <div className='text-center py-10 text-grey-500 bg-white rounded-lg border border-grey-transparent'>
        Chưa có lịch khám nào
      </div>
    );
  }

  return (
    <Container>
      {lichKhams.map((lichKham) => (
        <LichKhamCard key={lichKham.idLichKham || lichKham.ID_LichKham} lichKham={lichKham} />
      ))}
    </Container>
  );
};

export default LichKhamContainer;















