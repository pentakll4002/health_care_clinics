import { useReceptions } from './useReceptions';
import { useNavigate } from 'react-router-dom';
import ModalCenter from '../../ui/ModalCenter';
import CreatePhieuKhamForm from '../medicalForm/CreatePhieuKhamForm';

import Spinner from '../../ui/Spinner';
import Table from '../../ui/Table';
import Menus from '../../ui/Menus';
import styled from 'styled-components';

const Text = styled.span`
  color: #0a1b39;
  font-size: 14px;
  font-weight: 500;
  margin: auto;
`;

const ReiceptionList = () => {
  const navigate = useNavigate();
  const { data: receptions, isLoading } = useReceptions();

  if (isLoading) return <Spinner />;

  if (!receptions || receptions.length === 0) {
    return (
      <div className='text-center py-10 text-grey-500 bg-white rounded-lg border border-grey-transparent'>
        Không có bệnh nhân nào đã được tiếp nhận
      </div>
    );
  }

  return (
    <Table columns='2fr 2fr 2fr 1fr 1fr'>
      <Table.Header>
        <div className='text-center'>Tên bệnh nhân</div>
        <div className='text-center'>Ngày tiếp nhận</div>
        <div className='text-center'>Ca</div>
        <div className='text-center'>Trạng thái</div>
        <div className='text-center'>Hành động</div>
      </Table.Header>

      <Table.Body
        data={receptions || []}
        render={(item) => {
          // Lấy thông tin bệnh nhân từ relationship
          const benhNhan = item.benhNhan || item.benh_nhan;
          const hoTenBN = benhNhan?.HoTenBN || item.HoTenBN || 'N/A';
          
          // Format ngày
          const formatDate = (dateString) => {
            if (!dateString) return '—';
            const date = new Date(dateString);
            return date.toLocaleDateString('vi-VN');
          };
          
          // Format trạng thái
          const getTrangThaiText = (tt) => {
            switch (tt) {
              case 'CHO_XAC_NHAN':
                return 'Chờ xác nhận';
              case 'CHO_KHAM':
              case 'da_duyet':
              case 'cho_duyet':
                return 'Chờ khám';
              case 'DANG_KHAM':
                return 'Đang khám';
              case 'DA_KHAM':
                return 'Đã khám';
              case 'HUY':
                return 'Đã hủy';
              default:
                return '—';
            }
          };

          const getTrangThaiClass = (tt) => {
            switch (tt) {
              case 'CHO_XAC_NHAN':
                return 'bg-warning-100 text-warning-900';
              case 'CHO_KHAM':
              case 'da_duyet':
              case 'cho_duyet':
                return 'bg-warning-100 text-warning-900';
              case 'DANG_KHAM':
                return 'bg-info-100 text-info-900';
              case 'DA_KHAM':
                return 'bg-success-100 text-success-900';
              case 'HUY':
                return 'bg-error-100 text-error-900';
              default:
                return 'bg-grey-100 text-grey-700';
            }
          };
          
          return (
            <Table.Row key={item.ID_TiepNhan}>
              <Text>{hoTenBN}</Text>
              <Text>{formatDate(item.NgayTN)}</Text>
              <Text>{item.CaTN}</Text>

              <Text>
                <span
                  className={`px-2 py-[2px] rounded-full text-sm font-medium ${getTrangThaiClass(item.TrangThaiTiepNhan)}`}
                >
                  {getTrangThaiText(item.TrangThaiTiepNhan)}
                </span>
              </Text>

              <div className='flex justify-center'>
                <ModalCenter>
                  <Menus>
                    <Menus.Toggle id={item.ID_BenhNhan} />
                    <Menus.List id={item.ID_BenhNhan}>
                      <Menus.Button
                        onClick={() =>
                          navigate(`/patients/${benhNhan?.ID_BenhNhan || item.ID_BenhNhan}`)
                        }
                      >
                        Xem thông tin bệnh nhân
                      </Menus.Button>

                      <ModalCenter.Open opens={`medical-form-${item.ID_TiepNhan}`}>
                        <Menus.Button>Tạo phiếu khám</Menus.Button>
                      </ModalCenter.Open>
                      <ModalCenter.Window name={`medical-form-${item.ID_TiepNhan}`}>
                        <CreatePhieuKhamForm 
                          tiepNhan={item}
                          onCloseModal={() => {}}
                          onSuccess={() => {}}
                        />
                      </ModalCenter.Window>
                    </Menus.List>
                  </Menus>
                </ModalCenter>
              </div>
            </Table.Row>
          );
        }}
      />
    </Table>
  );
};

export default ReiceptionList;
