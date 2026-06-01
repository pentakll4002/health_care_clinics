import Table from '../../ui/Table';
import styled from 'styled-components';
import ModalCenter from '../../ui/ModalCenter';
import { EyeIcon } from '@heroicons/react/24/outline';
import InvoiceDetail from './InvoiceDetail';

const Text = styled.span`
  color: #0a1b39;
  font-size: 14px;
  font-weight: 500;
  margin: auto;
`;

const InvoiceRow = ({ invoice }) => {
  const {
    ID_HoaDon,
    NgayHoaDon,
    TienKham,
    TienThuoc,
    TongTien,
    nhanVien,
    nhan_vien,
    phieuKham,
    phieu_kham,
  } = invoice;

  const staff = nhanVien || nhan_vien;
  const medicalForm = phieuKham || phieu_kham;
  const tiepNhan = medicalForm?.tiepNhan || medicalForm?.tiep_nhan;
  const benhNhan = tiepNhan?.benhNhan || tiepNhan?.benh_nhan || (tiepNhan ? {
    HoTenBN: tiepNhan.HoTenBN || tiepNhan.tenBenhNhan,
    ID_BenhNhan: tiepNhan.ID_BenhNhan || tiepNhan.idBenhNhan,
    DienThoai: tiepNhan.dienThoaiBenhNhan || tiepNhan.DienThoai || tiepNhan.dienThoai,
    CCCD: tiepNhan.cccdBenhNhan || tiepNhan.CCCD
  } : null);

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN');
  };

  const formatCurrency = (amount) =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(
      amount || 0
    );

  return (
    <Table.Row>
      <Text>#{ID_HoaDon}</Text>
      <Text>
        #{medicalForm?.ID_PhieuKham || 'N/A'}
        {benhNhan?.HoTenBN ? ` - ${benhNhan.HoTenBN}` : ''}
      </Text>
      <Text>{staff?.HoTenNV || 'N/A'}</Text>
      <Text>{formatDate(NgayHoaDon)}</Text>
      <Text>{formatCurrency(TienKham)}</Text>
      <Text>{formatCurrency(TienThuoc)}</Text>
      <Text>{formatCurrency(TongTien)}</Text>

      <ModalCenter>
        <ModalCenter.Open opens={`invoice-detail-${ID_HoaDon}`}>
          <button className='text-primary bg-primary-transparent border border-primary/20 hover:bg-primary hover:text-white transition-colors w-[40px] h-[36px] flex items-center justify-center rounded-lg font-semibold mx-auto'>
            <EyeIcon className='w-5 h-5' />
          </button>
        </ModalCenter.Open>
        <ModalCenter.Window name={`invoice-detail-${ID_HoaDon}`}>
          <InvoiceDetail ID_HoaDon={ID_HoaDon} />
        </ModalCenter.Window>
      </ModalCenter>
    </Table.Row>
  );
};

export default InvoiceRow;


