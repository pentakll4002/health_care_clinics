import styled from 'styled-components';
import ModalCenter from '../../ui/ModalCenter';
import Menus from '../../ui/Menus';
import {
  PencilIcon,
  TrashIcon,
} from '@heroicons/react/16/solid';
import ConfirmDelete from '../../ui/ConfirmDelete';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { deleteDrug } from './APIDrugs';
import toast from 'react-hot-toast';

const Container = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 20px;
  align-items: flex-start;
  border-radius: 6px;
  border: 1px solid #e7e8eb;
  background: #fff;
`;

const Image = styled.img`
  width: 80px;
  height: 80px;
  flex-shrink: 0;
  border-radius: 8px;
  object-fit: cover;
  background: #f5f6f8;
`;

const DrugCard = ({ drug }) => {
  // Backend returns camelCase: idThuoc, tenThuoc, tenDvt, moTaCachDung, etc.
  const {
    idThuoc,
    tenThuoc,
    soLuongTon,
    donGiaBan,
    donGiaNhap,
    hinhAnh,
    tenDvt,
    moTaCachDung,
  } = drug;
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { mutate: deleteDrugMutation, isLoading: isDeleting } = useMutation({
    mutationFn: deleteDrug,
    onSuccess: () => {
      toast.success('Xóa thuốc thành công');
      queryClient.invalidateQueries({ queryKey: ['drugs'] });
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message || 'Xóa thuốc thất bại');
    },
  });

  function handleDelete() {
    deleteDrugMutation(idThuoc);
  }

  return (
    <Container>
      <div className='flex items-start justify-between w-full'>
        <div className='flex items-center gap-x-4'>
          <Image
            src={hinhAnh || '/placeholder-drug.jpg'}
            alt={tenThuoc}
            onError={(e) => {
              e.target.src = '/placeholder-drug.jpg';
            }}
          />
          <div className='flex flex-col items-start justify-center gap-1'>
            <h3 className='text-base font-semibold text-grey-900'>
              {tenThuoc}
            </h3>
            <p className='text-sm text-grey-500'>
              Đơn vị: {tenDvt || 'N/A'}
            </p>
            <p className='text-sm text-grey-500'>
              Cách dùng: {moTaCachDung || 'N/A'}
            </p>
          </div>
        </div>
        <ModalCenter>
          <Menus>
            <Menus.Menu>
              <Menus.Toggle id={idThuoc} />

              <Menus.List id={idThuoc}>
                <Menus.Button
                  icon={<PencilIcon className='w-4 h-4' />}
                  onClick={() => navigate(`/drugs/${idThuoc}`)}
                >
                  Chi tiết
                </Menus.Button>

                <ModalCenter.Open opens={`delete-${idThuoc}`}>
                  <Menus.Button icon={<TrashIcon className='w-4 h-4' />}>
                    Xoá
                  </Menus.Button>
                </ModalCenter.Open>
              </Menus.List>

              <ModalCenter.Window name={`delete-${idThuoc}`}>
                <ConfirmDelete
                  resourceName='Thuốc'
                  disabled={isDeleting}
                  onConfirm={handleDelete}
                  onCloseModal={() => {}}
                />
              </ModalCenter.Window>
            </Menus.Menu>
          </Menus>
        </ModalCenter>
      </div>

      <div className='grid grid-cols-2 gap-4 w-full pt-2 border-t border-grey-transparent'>
        <div className='flex flex-col gap-1'>
          <span className='text-xs text-grey-500'>Số lượng tồn</span>
          <span className='text-sm font-semibold text-grey-900'>
            {soLuongTon || 0}
          </span>
        </div>
        <div className='flex flex-col gap-1'>
          <span className='text-xs text-grey-500'>Giá bán</span>
          <span className='text-sm font-semibold text-primary'>
            {donGiaBan
              ? new Intl.NumberFormat('vi-VN', {
                  style: 'currency',
                  currency: 'VND',
                }).format(donGiaBan)
              : 'N/A'}
          </span>
        </div>
        <div className='flex flex-col gap-1'>
          <span className='text-xs text-grey-500'>Giá nhập</span>
          <span className='text-sm font-semibold text-grey-900'>
            {donGiaNhap
              ? new Intl.NumberFormat('vi-VN', {
                  style: 'currency',
                  currency: 'VND',
                }).format(donGiaNhap)
              : 'N/A'}
          </span>
        </div>
      </div>
    </Container>
  );
};

export default DrugCard;
