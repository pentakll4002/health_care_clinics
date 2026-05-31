import { useParams, useNavigate } from 'react-router-dom';
import { useDrug } from './useDrug';
import Spinner from '../../ui/Spinner';
import Button from '../../ui/Button';
import Modal from '../../ui/Modal';
import UpdateDrugForm from './UpdateDrugForm';
import ModalCenter from '../../ui/ModalCenter';
import ConfirmDelete from '../../ui/ConfirmDelete';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { deleteDrug, getDrugPackagings } from './APIDrugs';
import toast from 'react-hot-toast';
import { PencilIcon, TrashIcon, ArrowLeftIcon } from '@heroicons/react/24/outline';

const DrugDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isLoading, drug } = useDrug(id);
  const queryClient = useQueryClient();

  const { data: packagings = [] } = useQuery({
    queryKey: ['drug-packagings', drug?.tenThuoc],
    queryFn: () => getDrugPackagings(drug.tenThuoc),
    enabled: !!drug?.tenThuoc,
  });

  const { mutate: deleteDrugMutation, isLoading: isDeleting } = useMutation({
    mutationFn: deleteDrug,
    onSuccess: () => {
      toast.success('Xóa thuốc thành công');
      queryClient.invalidateQueries({ queryKey: ['drugs'] });
      navigate('/drugs');
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message || 'Xóa thuốc thất bại');
    },
  });

  function handleDelete() {
    deleteDrugMutation(id);
  }

  if (isLoading) return <Spinner />;

  if (!drug) {
    return (
      <div className='w-full h-full p-5' style={{ backgroundColor: 'var(--bg-secondary)' }}>
        <div
          className='rounded-xl p-6 border'
          style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)' }}
        >
          <div className='text-center py-10' style={{ color: 'var(--text-muted)' }}>
            Không tìm thấy thuốc
          </div>
        </div>
      </div>
    );
  }

  // Support both camelCase (DTO) and PascalCase (legacy)
  const tenThuoc = drug.tenThuoc || drug.TenThuoc || 'N/A';
  const soLuongTon = drug.soLuongTon ?? drug.SoLuongTon ?? 0;
  const donGiaBan = drug.donGiaBan || drug.DonGiaBan;
  const donGiaNhap = drug.donGiaNhap || drug.DonGiaNhap;
  const hinhAnh = drug.hinhAnh || drug.HinhAnh;
  const thanhPhan = drug.thanhPhan || drug.ThanhPhan;
  const xuatXu = drug.xuatXu || drug.XuatXu;
  const tyLeGiaBan = drug.tyLeGiaBan || drug.TyLeGiaBan;
  const tenDvt = drug.tenDvt || drug.dvt?.TenDVT || drug.dvt?.tenDvt || 'N/A';
  const moTaCachDung = drug.moTaCachDung || drug.cach_dung?.MoTaCachDung || drug.cachDung?.moTaCachDung || 'N/A';

  const formatPrice = (price) => {
    if (!price) return 'N/A';
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
  };

  return (
    <div className='w-full h-full p-5' style={{ backgroundColor: 'var(--bg-secondary)' }}>
      {/* Back button */}
      <div className='mb-4'>
        <button
          className='flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg border transition-colors'
          style={{
            backgroundColor: 'var(--bg-card)',
            borderColor: 'var(--border-color)',
            color: 'var(--text-primary)',
          }}
          onClick={() => navigate('/drugs')}
        >
          <ArrowLeftIcon className='w-4 h-4' />
          <span>Quay lại</span>
        </button>
      </div>

      {/* Drug Detail Card */}
      <div
        className='rounded-xl p-6 border'
        style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)' }}
      >
        {/* Header */}
        <div className='flex items-start justify-between mb-6'>
          <h1 className='text-xl font-bold' style={{ color: 'var(--text-primary)' }}>
            {tenThuoc}
          </h1>
          <div className='flex items-center gap-2'>
            <Modal>
              <Modal.Open opens='edit-drug'>
                <button
                  className='flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg text-white'
                  style={{ backgroundColor: 'var(--accent)' }}
                >
                  <PencilIcon className='w-4 h-4' />
                  <span>Chỉnh sửa</span>
                </button>
              </Modal.Open>
              <Modal.Window name='edit-drug'>
                <UpdateDrugForm drug={drug} />
              </Modal.Window>
            </Modal>

            <ModalCenter>
              <ModalCenter.Open opens='delete-drug'>
                <button className='flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg text-white bg-red-500'>
                  <TrashIcon className='w-4 h-4' />
                  <span>Xóa</span>
                </button>
              </ModalCenter.Open>
              <ModalCenter.Window name='delete-drug'>
                <ConfirmDelete
                  resourceName='Thuốc'
                  disabled={isDeleting}
                  onConfirm={handleDelete}
                  onCloseModal={() => {}}
                />
              </ModalCenter.Window>
            </ModalCenter>
          </div>
        </div>

        {/* Content */}
        <div className='flex gap-8'>
          {/* Image */}
          <div
            className='w-48 h-48 rounded-xl overflow-hidden flex-shrink-0 flex items-center justify-center'
            style={{ backgroundColor: 'var(--bg-secondary)' }}
          >
            <img
              src={hinhAnh || '/placeholder-drug.jpg'}
              alt={tenThuoc}
              className='w-full h-full object-contain p-3'
              onError={(e) => { e.target.src = '/placeholder-drug.jpg'; }}
            />
          </div>

          {/* Info Grid */}
          <div className='flex-1 grid grid-cols-2 gap-5'>
            {packagings.length > 1 ? (
              <div className='flex flex-col gap-1'>
                <span className='text-sm font-medium' style={{ color: 'var(--text-muted)' }}>
                  Đơn vị tính
                </span>
                <select
                  value={id}
                  onChange={(e) => navigate(`/drugs/${e.target.value}`)}
                  className='px-3 py-1.5 text-sm font-semibold rounded-lg border focus:outline-none focus:ring-1 focus:ring-accent transition-colors'
                  style={{
                    backgroundColor: 'var(--bg-input)',
                    borderColor: 'var(--border-color)',
                    color: 'var(--text-primary)',
                    maxWidth: '220px'
                  }}
                >
                  {packagings.map((pkg) => (
                    <option key={pkg.idThuoc} value={pkg.idThuoc}>
                      {pkg.tenDvt || pkg.TenDvt || 'N/A'} ({formatPrice(pkg.donGiaBan)})
                    </option>
                  ))}
                </select>
              </div>
            ) : (
              <InfoItem label='Đơn vị tính' value={tenDvt} />
            )}
            <InfoItem label='Cách dùng' value={moTaCachDung} />
            <InfoItem label='Thành phần' value={thanhPhan || 'N/A'} />
            <InfoItem label='Xuất xứ' value={xuatXu || 'N/A'} />
            <InfoItem label='Số lượng tồn' value={soLuongTon} highlight={soLuongTon <= 10 ? 'error' : 'success'} />
            <InfoItem label='Giá nhập' value={formatPrice(donGiaNhap)} />
            <InfoItem label='Tỷ lệ giá bán' value={tyLeGiaBan ? `${tyLeGiaBan}%` : 'N/A'} />
            <InfoItem label='Giá bán' value={formatPrice(donGiaBan)} highlight='accent' />
          </div>
        </div>
      </div>
    </div>
  );
};

const InfoItem = ({ label, value, highlight }) => {
  const colorMap = {
    accent: 'var(--accent)',
    success: 'var(--success)',
    error: 'var(--error)',
  };

  return (
    <div className='flex flex-col gap-1'>
      <span className='text-sm font-medium' style={{ color: 'var(--text-muted)' }}>
        {label}
      </span>
      <span
        className='text-base font-semibold'
        style={{ color: highlight ? colorMap[highlight] : 'var(--text-primary)' }}
      >
        {value}
      </span>
    </div>
  );
};

export default DrugDetail;
