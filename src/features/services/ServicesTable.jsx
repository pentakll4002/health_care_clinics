import { useSearchParams } from 'react-router-dom';
import Table from '../../ui/Table';
import Modal from '../../ui/Modal';
import ConfirmDelete from '../../ui/ConfirmDelete';
import Button from '../../ui/Button';
import ServiceForm from './ServiceForm';
import Pagination from '../../ui/Pagination';

function formatVnd(value) {
  const num = Number(value || 0);
  return num.toLocaleString('vi-VN');
}

function ServicesTable({ services, onUpdate, onDelete, isSubmitting }) {
  const [searchParams] = useSearchParams();
  const currentPage = !searchParams.get('page') ? 1 : Number(searchParams.get('page'));
  const pageSize = 10;

  const totalCount = services.length;
  const paginatedServices = services.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  return (
    <div className='flex flex-col gap-3'>
      <Table columns='1fr 1fr 160px'>
        <Table.Header>
          <div>Tên dịch vụ</div>
          <div>Đơn giá</div>
          <div />
        </Table.Header>

        <Table.Body
          data={paginatedServices}
          render={(s) => {
            const idDichVu = s.idDichVu ?? s.ID_DichVu;
            const tenDichVu = s.tenDichVu ?? s.TenDichVu;
            const donGia = s.donGia ?? s.DonGia;

            return (
              <Table.Row key={idDichVu}>
                <div className='font-medium text-grey-900'>{tenDichVu}</div>
                <div>{formatVnd(donGia)} đ</div>
                <div className='flex items-center justify-end gap-2'>
                  <Modal>
                    <Modal.Open opens={`edit-service-${idDichVu}`}>
                      <Button className='bg-light text-grey-900 px-[10px] py-[6px]'>Sửa</Button>
                    </Modal.Open>
                    <Modal.Window name={`edit-service-${idDichVu}`}>
                      <ServiceForm
                        initialValues={{
                          idDichVu,
                          tenDichVu,
                          donGia,
                          ID_DichVu: idDichVu,
                          TenDichVu: tenDichVu,
                          DonGia: donGia,
                        }}
                        isSubmitting={isSubmitting}
                        onSubmit={(payload) => onUpdate(idDichVu, payload)}
                      />
                    </Modal.Window>
                  </Modal>

                  <Modal>
                    <Modal.Open opens={`delete-service-${idDichVu}`}>
                      <Button className='bg-error-900 text-white px-[10px] py-[6px]'>Xoá</Button>
                    </Modal.Open>
                    <Modal.Window name={`delete-service-${idDichVu}`}>
                      <ConfirmDelete
                        resourceName='dịch vụ'
                        onConfirm={() => onDelete(idDichVu)}
                        disabled={isSubmitting}
                      />
                    </Modal.Window>
                  </Modal>
                </div>
              </Table.Row>
            );
          }}
        />
      </Table>

      <Pagination count={totalCount} pageSize={pageSize} />
    </div>
  );
}

export default ServicesTable;
