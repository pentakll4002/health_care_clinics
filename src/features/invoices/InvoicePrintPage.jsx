import { useEffect, useMemo, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useParams, useSearchParams } from 'react-router-dom';
import styled from 'styled-components';
import Spinner from '../../ui/Spinner';
import { getInvoice } from './APIInvoices';

const Page = styled.div`
  background: #ffffff;
  min-height: 100vh;
  padding: 24px;

  @media print {
    padding: 0;
    min-height: auto;
  }
`;

const Paper = styled.div`
  max-width: 920px;
  margin: 0 auto;
  background: #ffffff;
  border: 1px solid #111827;
  overflow: hidden;

  @media print {
    border: none;
    max-width: none;
  }
`;

const HeaderBanner = styled.div`
  background: #ffffff;
  color: #111827;
  padding: 20px;
  position: relative;
  overflow: hidden;

  &::before {
    content: none;
  }

  &::after {
    content: none;
  }

  @media print {
    background: #ffffff;
  }
`;

const HeaderContent = styled.div`
  position: relative;
  z-index: 1;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 24px;
`;

const ClinicInfo = styled.div`
  flex: 1;
`;

const ClinicName = styled.div`
  font-weight: 800;
  font-size: 16px;
  margin-bottom: 6px;
`;

const ClinicSub = styled.div`
  font-size: 12px;
  line-height: 1.3;
`;

const InvoiceBadge = styled.div`
  padding: 0;
  border: none;
  text-align: right;
`;

const InvoiceLabel = styled.div`
  font-size: 12px;
  margin-bottom: 4px;
  text-transform: uppercase;
  letter-spacing: 1px;
  color: #111827;
`;

const InvoiceNumber = styled.div`
  font-size: 20px;
  font-weight: 800;
`;

const Content = styled.div`
  padding: 20px;

  @media print {
    padding: 0;
  }
`;

const Title = styled.div`
  text-align: center;
  font-weight: 900;
  font-size: 22px;
  margin: 10px 0 12px;
  letter-spacing: 0.6px;
`;

const Section = styled.div`
  margin-bottom: 32px;
`;

const SectionHeader = styled.div`
  font-size: 14px;
  font-weight: 700;
  color: #111827;
  text-transform: uppercase;
  letter-spacing: 1px;
  margin-bottom: 16px;
  padding-bottom: 8px;
  border-bottom: 1px solid #111827;
`;

const MetaGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
  background: #ffffff;
  padding: 12px;
  border: 1px solid #111827;
`;

const MetaItem = styled.div`
  display: flex;
  gap: 12px;
  align-items: flex-start;
`;

const MetaLabel = styled.div`
  min-width: 80px;
  font-weight: 700;
  color: #111827;
  font-size: 14px;
`;

const MetaValue = styled.div`
  color: #111827;
  font-size: 14px;
  flex: 1;
`;

const TableContainer = styled.div`
  overflow: hidden;
  border: 1px solid #111827;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;

  thead {
    background: #ffffff;
    color: #111827;
  }

  th {
    border: 1px solid #111827;
    padding: 8px;
    font-size: 12px;
    font-weight: 800;
    text-align: center;
  }

  tbody tr {
    border-bottom: none;
  }

  td {
    border: 1px solid #111827;
    padding: 8px;
    font-size: 12px;
    color: #111827;
  }

  td.right {
    text-align: right;
  }

  td.center {
    text-align: center;
  }

  td.bold {
    font-weight: 600;
    color: #111827;
  }
`;

const TotalsSection = styled.div`
  display: grid;
  grid-template-columns: 1fr 400px;
  gap: 32px;
  margin-top: 32px;
  align-items: start;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const TotalsBox = styled.div`
  background: #ffffff;
  color: #111827;
  padding: 12px;
  border: 1px solid #111827;
`;

const TotalLine = styled.div`
  display: flex;
  justify-content: space-between;
  padding: 6px 0;
  font-size: 13px;
  border-bottom: 1px solid #111827;

  &:last-child {
    border-bottom: none;
    margin-top: 6px;
    padding-top: 10px;
    border-top: 2px solid #111827;
  }

  &.grand-total {
    font-size: 14px;
    font-weight: 800;
  }
`;

const InfoBox = styled.div`
  background: #ffffff;
  padding: 12px;
  border: 1px solid #111827;
`;

const InfoLine = styled.div`
  display: flex;
  gap: 8px;
  margin-bottom: 8px;
  font-size: 14px;

  &:last-child {
    margin-bottom: 0;
  }
`;

const Actions = styled.div`
  display: flex;
  justify-content: center;
  gap: 12px;
  margin-bottom: 24px;

  @media print {
    display: none;
  }
`;

const Button = styled.button`
  padding: 8px 14px;
  border-radius: 6px;
  font-weight: 700;
  font-size: 13px;
  border: 1px solid #111827;
  cursor: pointer;
  background: #ffffff;
  color: #111827;
`;

const FooterSign = styled.div`
  display: flex;
  justify-content: space-between;
  width: 100%;
`;

const SignBox = styled.div`
  text-align: center;
`;

const SignLabel = styled.div`
  font-weight: 700;
  font-size: 14px;
  color: #111827;
  margin-bottom: 8px;
`;

const SignHint = styled.div`
  color: #111827;
  font-size: 12px;
  font-style: italic;
  margin-bottom: 48px;
`;

function formatCurrency(amount) {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(Number(amount || 0));
}

function formatDateTime(dateString) {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  const d = date.toLocaleDateString('vi-VN');
  const t = date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
  return `${d} ${t}`;
}

const InvoicePrintPage = () => {
  const { id } = useParams();
  const [params] = useSearchParams();
  const printedRef = useRef(false);

  const { data: invoice, isLoading } = useQuery({
    queryKey: ['invoice', id],
    queryFn: () => getInvoice(id),
    enabled: !!id,
  });

  const normalized = useMemo(() => {
    if (!invoice) return null;

    const staff = invoice.nhanVien || invoice.nhan_vien;
    const medicalForm = invoice.phieuKham || invoice.phieu_kham;
    const tiepNhan = medicalForm?.tiepNhan || medicalForm?.tiep_nhan;
    const benhNhan = tiepNhan?.benhNhan || tiepNhan?.benh_nhan || (tiepNhan ? {
      HoTenBN: tiepNhan.HoTenBN || tiepNhan.tenBenhNhan,
      ID_BenhNhan: tiepNhan.ID_BenhNhan || tiepNhan.idBenhNhan,
      DienThoai: tiepNhan.dienThoaiBenhNhan || tiepNhan.DienThoai || tiepNhan.dienThoai,
      CCCD: tiepNhan.cccdBenhNhan || tiepNhan.CCCD,
      DiaChi: tiepNhan.diaChiBenhNhan || tiepNhan.DiaChi
    } : null);
    const mainService = medicalForm?.dichVu || medicalForm?.dich_vu;
    const extraServices = medicalForm?.ctDichVuPhu || medicalForm?.ct_dich_vu_phu || [];
    const prescriptions = medicalForm?.toaThuoc || medicalForm?.toa_thuoc || [];

    return {
      invoice,
      staff,
      medicalForm,
      benhNhan,
      mainService,
      extraServices,
      prescriptions,
    };
  }, [invoice]);

  useEffect(() => {
    const autoprint = params.get('autoprint') === '1';
    if (!autoprint) return;
    if (!normalized) return;
    if (printedRef.current) return;

    printedRef.current = true;
    const t = setTimeout(() => {
      window.print();
    }, 300);

    return () => clearTimeout(t);
  }, [params, normalized]);

  if (isLoading) return <Spinner />;
  if (!normalized) return <div>Không tìm thấy hoá đơn</div>;

  const { staff, medicalForm, benhNhan, mainService, extraServices, prescriptions } = normalized;

  const rows = [];
  let stt = 1;

  if (mainService?.TenDichVu) {
    rows.push({
      stt: stt++,
      ten: mainService.TenDichVu,
      sl: 1,
      dv: 'Lượt',
      donGia: Number(invoice.TienKham || 0),
      thanhTien: Number(invoice.TienKham || 0),
      ghiChu: 'Dịch vụ chính',
    });
  }

  (extraServices || [])
    .filter((x) => !x?.Is_Deleted)
    .forEach((x) => {
      const dv = x?.dichVu || x?.dich_vu;
      rows.push({
        stt: stt++,
        ten: dv?.TenDichVu || 'Dịch vụ',
        sl: Number(x?.SoLuong || 0),
        dv: 'Lượt',
        donGia: Number(x?.DonGiaApDung || 0),
        thanhTien: Number(x?.ThanhTien || 0),
        ghiChu: 'Dịch vụ phụ',
      });
    });

  (prescriptions || []).forEach((x) => {
    const thuoc = x?.thuoc;
    rows.push({
      stt: stt++,
      ten: thuoc?.TenThuoc || 'Thuốc',
      sl: Number(x?.SoLuong || 0),
      dv: thuoc?.DonViTinh || 'Viên',
      donGia: Number(x?.DonGiaBan_LuocMua || 0),
      thanhTien: Number(x?.TienThuoc || 0),
      ghiChu: x?.CachDung || '',
    });
  });

  const totalSL = rows.reduce((sum, r) => sum + (Number(r.sl) || 0), 0);
  const totalItems = rows.length;

  return (
    <Page>
      <Actions>
        <Button type='button' onClick={() => window.print()}>
          In / Lưu PDF
        </Button>
      </Actions>

      <Paper>
        <HeaderBanner>
          <HeaderContent>
            <ClinicInfo>
              <ClinicName>Phòng khám - Mạch tư 4 thành viên UIT</ClinicName>
              <ClinicSub>
                Đường Hàn Thuyên, Phường Linh Trung, Quận Thủ Đức, TP.HCM
                <br />
                0982.285.374 - 0899.184.440
              </ClinicSub>
            </ClinicInfo>

            <InvoiceBadge>
              <InvoiceLabel>Mã hoá đơn</InvoiceLabel>
              <InvoiceNumber>HD-{invoice.ID_HoaDon}</InvoiceNumber>
              <InvoiceLabel style={{ marginTop: 8 }}>
                {formatDateTime(invoice.NgayHoaDon)}
              </InvoiceLabel>
            </InvoiceBadge>
          </HeaderContent>
        </HeaderBanner>

        <Content>
          <Title>HÓA ĐƠN</Title>

          <Section>
            <SectionHeader>THÔNG TIN KHÁCH HÀNG</SectionHeader>
            <MetaGrid>
              <MetaItem>
                <MetaLabel>Khách hàng:</MetaLabel>
                <MetaValue>{benhNhan?.HoTenBN || 'N/A'}</MetaValue>
              </MetaItem>

              <MetaItem>
                <MetaLabel>Điện thoại:</MetaLabel>
                <MetaValue>{benhNhan?.DienThoai || 'N/A'}</MetaValue>
              </MetaItem>
              <MetaItem>
                <MetaLabel>Địa chỉ:</MetaLabel>
                <MetaValue>{benhNhan?.DiaChi || 'N/A'}</MetaValue>
              </MetaItem>
              <MetaItem>
                <MetaLabel>Nhân viên:</MetaLabel>
                <MetaValue>{staff?.HoTenNV || 'N/A'}</MetaValue>
              </MetaItem>
            </MetaGrid>
          </Section>

          <Section>
            <SectionHeader>CHI TIẾT ĐƠN HÀNG</SectionHeader>
            <TableContainer>
              <Table>
                <thead>
                  <tr>
                    <th style={{ width: 50 }}>STT</th>
                    <th>Mặt hàng</th>
                    <th style={{ width: 80 }}>SL</th>
                    <th style={{ width: 80 }}>ĐV</th>
                    <th style={{ width: 130 }}>Đơn giá</th>
                    <th style={{ width: 140 }}>Thành tiền</th>
                    <th style={{ width: 180 }}>Ghi chú</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.length === 0 ? (
                    <tr>
                      <td colSpan={7} className='center'>
                        Không có dữ liệu
                      </td>
                    </tr>
                  ) : (
                    rows.map((r) => (
                      <tr key={r.stt}>
                        <td className='center bold'>{r.stt}</td>
                        <td className='bold'>{r.ten}</td>
                        <td className='right'>{r.sl}</td>
                        <td className='center'>{r.dv}</td>
                        <td className='right'>{formatCurrency(r.donGia)}</td>
                        <td className='right bold'>{formatCurrency(r.thanhTien)}</td>
                        <td>{r.ghiChu}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </Table>
            </TableContainer>
          </Section>

          <TotalsSection>
            <InfoBox>
              <InfoLine>
                <strong>Số mặt hàng:</strong> {totalItems}
              </InfoLine>
              <InfoLine>
                <strong>Tổng số lượng:</strong> {totalSL}
              </InfoLine>
              <InfoLine>
                <strong>Phiếu khám:</strong> #{medicalForm?.ID_PhieuKham || 'N/A'}
              </InfoLine>
              <InfoLine>
                <strong>Ngày lập:</strong> {formatDateTime(invoice.NgayHoaDon)}
              </InfoLine>
            </InfoBox>

            <TotalsBox>
              <TotalLine>
                <div>Tiền khám bệnh</div>
                <div>{formatCurrency(invoice.TienKham)}</div>
              </TotalLine>

              <TotalLine>
                <div>Tiền thuốc</div>
                <div>{formatCurrency(invoice.TienThuoc)}</div>
              </TotalLine>
              <TotalLine>
                <div>Tiền dịch vụ</div>
                <div>{formatCurrency(invoice.TienDichVu)}</div>
              </TotalLine>
              <TotalLine className='grand-total'>
                <div>TỔNG CỘNG</div>
                <div>{formatCurrency(invoice.TongTien)}</div>
              </TotalLine>
            </TotalsBox>
          </TotalsSection>

          <FooterSign>
            <SignBox>
              <SignLabel>Khách hàng</SignLabel>
              <SignHint>(Ký và ghi rõ họ tên)</SignHint>
            </SignBox>
            <SignBox>
              <SignLabel>Người bán hàng</SignLabel>
              <SignHint>(Ký và ghi rõ họ tên)</SignHint>
            </SignBox>
          </FooterSign>
        </Content>
      </Paper>
    </Page>
  );
};

export default InvoicePrintPage;