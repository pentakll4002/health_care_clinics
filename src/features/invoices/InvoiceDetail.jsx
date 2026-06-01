import styled from 'styled-components';
import { useQuery } from '@tanstack/react-query';
import { getInvoice } from './APIInvoices';
import Spinner from '../../ui/Spinner';
import { DocumentArrowDownIcon } from '@heroicons/react/24/outline';

const LayoutInvoiceDetail = styled.div`
  padding: 24px;
  background-color: #f5f6f8;
  width: 1000px;
  max-width: 100%;
  height: 100%;
`;

const Text = styled.span`
  font-size: 14px;
  font-weight: 400;
  color: #091833;
  margin: auto;
`;

const Grid2Col = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  column-gap: 32px;
  row-gap: 16px;
  margin: 24px 0;
`;

const Row = ({ label, value }) => (
  <div className='flex items-center gap-4'>
    <span className='text-sm font-semibold text-grey-700 min-w-[180px]'>{label}</span>
    <Text className='text-grey-900 font-medium'>{value}</Text>
  </div>
);

const InvoiceDetail = ({ ID_HoaDon }) => {
  const { data: invoice, isLoading } = useQuery({
    queryKey: ['invoice', ID_HoaDon],
    queryFn: () => getInvoice(ID_HoaDon),
    enabled: !!ID_HoaDon,
  });

  if (isLoading) return <Spinner />;
  if (!invoice) return <div>Không tìm thấy hoá đơn</div>;

  const formatCurrency = (amount) =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(
      amount || 0
    );

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN');
  };

  const staff = invoice.nhanVien || invoice.nhan_vien;
  const medicalForm = invoice.phieuKham || invoice.phieu_kham;
  const tiepNhan = medicalForm?.tiepNhan || medicalForm?.tiep_nhan;
  const benhNhan = tiepNhan?.benhNhan || tiepNhan?.benh_nhan || (tiepNhan ? {
    HoTenBN: tiepNhan.HoTenBN || tiepNhan.tenBenhNhan,
    ID_BenhNhan: tiepNhan.ID_BenhNhan || tiepNhan.idBenhNhan,
    DienThoai: tiepNhan.dienThoaiBenhNhan || tiepNhan.DienThoai || tiepNhan.dienThoai,
    CCCD: tiepNhan.cccdBenhNhan || tiepNhan.CCCD
  } : null);
  const openPrintWindow = () => {
    window.open(`/invoices/${invoice.ID_HoaDon}/print?autoprint=1`, '_blank', 'noopener,noreferrer');
  };

  return (
    <LayoutInvoiceDetail>
      <div className='flex items-center justify-between mb-6 pb-4 border-b border-grey-transparent'>
        <div>
          <h2 className='text-2xl font-bold leading-7 text-grey-900'>
            Hoá Đơn #{invoice.ID_HoaDon}
          </h2>
          <p className='mt-1 text-sm text-grey-600'>
            {benhNhan?.HoTenBN || 'Bệnh nhân'}
          </p>
        </div>
        <button
          type='button'
          onClick={openPrintWindow}
          className='flex items-center gap-2 px-5 py-2.5 rounded-lg bg-primary text-white font-semibold text-sm hover:bg-primary/90 transition-all duration-200 shadow-md hover:shadow-lg'
        >
          <DocumentArrowDownIcon className='w-5 h-5' />
          Xuất PDF
        </button>
      </div>

      <Grid2Col>
        <Row label='Mã phiếu khám' value={medicalForm?.ID_PhieuKham || 'N/A'} />
        <Row label='Ngày hoá đơn' value={formatDate(invoice.NgayHoaDon)} />
        <Row label='Bệnh nhân' value={benhNhan?.HoTenBN || 'N/A'} />
        <Row label='Bác sĩ/nhân viên' value={staff?.HoTenNV || 'N/A'} />
        <Row label='Tiền khám' value={formatCurrency(invoice.TienKham)} />
        <Row label='Tiền thuốc' value={formatCurrency(invoice.TienThuoc)} />
        <Row label='Tiền dịch vụ' value={formatCurrency(invoice.TienDichVu)} />
        <Row label='Tổng tiền' value={formatCurrency(invoice.TongTien)} />
      </Grid2Col>
    </LayoutInvoiceDetail>
  );
};

export default InvoiceDetail;


