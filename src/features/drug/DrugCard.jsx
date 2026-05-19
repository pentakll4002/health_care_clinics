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

const DrugCard = ({ drug }) => {
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

  const formatPrice = (price) => {
    if (!price) return 'N/A';
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
  };

  return (
    <div
      className='flex flex-col rounded-xl border overflow-hidden transition-all duration-200 hover:shadow-md'
      style={{
        backgroundColor: 'var(--bg-card)',
        borderColor: 'var(--border-color)',
      }}
    >
      {/* Image - clickable */}
      <div
        className='h-28 flex items-center justify-center overflow-hidden cursor-pointer'
        style={{ backgroundColor: 'var(--bg-secondary)' }}
        onClick={() => navigate(`/drugs/${idThuoc}`)}
      >
        <img
          src={hinhAnh || '/placeholder-drug.jpg'}
          alt={tenThuoc}
          className='h-full w-full object-contain p-2'
          onError={(e) => { e.target.src = '/placeholder-drug.jpg'; }}
        />
      </div>

      {/* Content */}
      <div className='flex flex-col flex-1 p-3'>
        <div className='flex items-start justify-between gap-1'>
          <h3
            className='text-sm font-semibold leading-tight line-clamp-2 cursor-pointer hover:underline'
            style={{ color: 'var(--text-primary)' }}
            onClick={() => navigate(`/drugs/${idThuoc}`)}
          >
            {tenThuoc}
          </h3>

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

        <div className='flex items-center gap-2 mt-1'>
          <span className='text-xs' style={{ color: 'var(--text-muted)' }}>
            ĐVT: {tenDvt || 'N/A'}
          </span>
          <span className='text-xs' style={{ color: 'var(--text-muted)' }}>
            • {moTaCachDung || 'Uống'}
          </span>
        </div>

        {/* Price & Stock */}
        <div
          className='flex items-center justify-between mt-auto pt-2 border-t'
          style={{ borderColor: 'var(--border-light)' }}
        >
          <div className='flex flex-col'>
            <span className='text-xs' style={{ color: 'var(--text-muted)' }}>Giá bán</span>
            <span className='text-sm font-bold' style={{ color: 'var(--accent)' }}>
              {formatPrice(donGiaBan)}
            </span>
          </div>
          <div className='flex flex-col items-end'>
            <span className='text-xs' style={{ color: 'var(--text-muted)' }}>Tồn kho</span>
            <span
              className='text-sm font-semibold'
              style={{ color: soLuongTon > 10 ? 'var(--success)' : 'var(--error)' }}
            >
              {soLuongTon || 0}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DrugCard;
