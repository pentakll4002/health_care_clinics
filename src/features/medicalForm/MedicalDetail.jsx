import styled from 'styled-components';
import FormRow from '../../ui/FormRow';
import InputNew from '../../ui/InputNew';
import { useForm } from 'react-hook-form';
import Table from '../../ui/Table';
import { useEffect, useState } from 'react';
import { useChiTietPhieuKham } from './useChiTietPhieuKham';
import Spinner from '../../ui/Spinner';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import axiosInstance from '../../utils/axiosInstance';
import toast from 'react-hot-toast';
import { addToaThuoc, completePhieuKham, removeToaThuoc, updatePhieuKham } from './API_PhieuKham';
import { getCachDung } from '../drug/APIDrugs';

const LayoutMedicalDetail = styled.div`
  padding: 20px;
  background-color: #f5f6f8;
  width: 1400px;
  max-width: 100%;
  height: 100%;
`;

const Grid2Col = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  column-gap: 24px;
  row-gap: 24px;
  margin: 20px auto;
  min-width: 600px;
`;

const Text = styled.span`
  font-size: 14px;
  font-weight: 400;
  color: #091833;
  margin: auto;
`;

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('vi-VN').format(amount || 0);
};

const MedicalDetail = ({ ID_PhieuKham, readOnly = false, onCloseModal }) => {
  const { phieuKham, isLoading } = useChiTietPhieuKham(ID_PhieuKham);
  const [isEditting, setIsEditting] = useState(false);
  const { register, handleSubmit, getValues, reset, formState } = useForm();

  const queryClient = useQueryClient();

  const { errors } = formState;

  const { data: loaiBenhData } = useQuery({
    queryKey: ['loai-benh'],
    queryFn: async () => {
      const res = await axiosInstance.get('/loai-benh');
      return res.data;
    },
  });

  const { data: dichVuData } = useQuery({
    queryKey: ['dich-vu'],
    queryFn: async () => {
      const res = await axiosInstance.get('/dich-vu');
      return res.data;
    },
  });

  const claimMutation = useMutation({
    mutationFn: () => updatePhieuKham(ID_PhieuKham, { TrangThai: 'DangKham' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['phieuKham', ID_PhieuKham] });
      queryClient.invalidateQueries({ queryKey: ['phieukham-list'] });
    },
    onError: (error) => {
      const status = error.response?.status;
      if (status === 409) {
        toast.error(error.response?.data?.message || 'Không thể bắt đầu khám do xung đột');
        return;
      }
      toast.error(error.response?.data?.message || 'Không thể bắt đầu khám');
    },
  });

  const completeMutation = useMutation({
    mutationFn: () => completePhieuKham(ID_PhieuKham),
    onSuccess: () => {
      toast.success('Đã hoàn tất khám');
      queryClient.invalidateQueries({ queryKey: ['phieuKham', ID_PhieuKham] });
      queryClient.invalidateQueries({ queryKey: ['phieukham-list'] });
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Hoàn tất khám thất bại');
    },
  });

  const loaiBenhList = loaiBenhData?.data || [];
  const dichVuList = dichVuData?.data || [];

  const { data: drugsData } = useQuery({
    queryKey: ['thuoc-mini'],
    queryFn: async () => {
      const res = await axiosInstance.get('/thuoc', { params: { page: 0, size: 1000 } });
      return res.data;
    },
  });

  const { data: cachDungData } = useQuery({
    queryKey: ['cach-dung'],
    queryFn: getCachDung,
  });

  const drugs = Array.isArray(drugsData) ? drugsData : (drugsData?.data || []);
  const cachDungList = Array.isArray(cachDungData) ? cachDungData : (cachDungData?.data || []);

  const updateMutation = useMutation({
    mutationFn: (payload) => updatePhieuKham(ID_PhieuKham, payload),
    onSuccess: () => {
      toast.success('Cập nhật phiếu khám thành công');
      queryClient.invalidateQueries({ queryKey: ['phieuKham', ID_PhieuKham] });
      queryClient.invalidateQueries({ queryKey: ['phieukham-list'] });
      setIsEditting(false);
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Cập nhật phiếu khám thất bại');
    },
  });

  const addDrugMutation = useMutation({
    mutationFn: ({ ID_Thuoc, SoLuong, CachDung }) =>
      addToaThuoc(ID_PhieuKham, { ID_Thuoc, SoLuong, CachDung }),
    onSuccess: () => {
      toast.success('Đã thêm thuốc');
      queryClient.invalidateQueries({ queryKey: ['phieuKham', ID_PhieuKham] });
      queryClient.invalidateQueries({ queryKey: ['phieukham-list'] });
    },
    onError: (error) => {
      const status = error.response?.status;
      if (status === 409) {
        toast.error(error.response?.data?.message || 'Không thể kê toa do xung đột');
        return;
      }
      toast.error(error.response?.data?.message || 'Thêm thuốc thất bại');
    },
  });

  const removeDrugMutation = useMutation({
    mutationFn: (thuocId) => removeToaThuoc(ID_PhieuKham, thuocId),
    onSuccess: () => {
      toast.success('Đã xoá thuốc');
      queryClient.invalidateQueries({ queryKey: ['phieuKham', ID_PhieuKham] });
      queryClient.invalidateQueries({ queryKey: ['phieukham-list'] });
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Xoá thuốc thất bại');
    },
  });

  function onSubmit(data) {
    const payload = {
      TrieuChung: data.TrieuChung || null,
      ID_LoaiBenh: data.ID_LoaiBenh ? parseInt(data.ID_LoaiBenh) : null,
      ID_DichVu: data.ID_DichVu ? parseInt(data.ID_DichVu) : null,
    };
    updateMutation.mutate(payload);
  }

  useEffect(() => {
    if (phieuKham) {
      reset(phieuKham);
    }
  }, [phieuKham, reset]);

  useEffect(() => {
    if (!phieuKham) return;
    if (readOnly) return;
    if (phieuKham.TrangThai !== 'ChoKham') return;
    if (claimMutation.isLoading) return;
    claimMutation.mutate();
  }, [phieuKham, readOnly]);

  const tiepNhan = phieuKham?.tiepNhan || phieuKham?.tiep_nhan;
  const benhNhan = tiepNhan?.benhNhan || tiepNhan?.benh_nhan;
  const toaThuocList = phieuKham?.toaThuoc || phieuKham?.toa_thuoc || [];
  const selectedDichVu = phieuKham?.dichVu || phieuKham?.dich_vu;

  if (isLoading) return <Spinner />;

  return (
    <LayoutMedicalDetail>
      <div className='sticky top-0 z-10 -mx-5 mb-5 flex items-start justify-between gap-4 border-b border-grey-transparent bg-[#f5f6f8] px-5 py-4'>
        <div>
          <h2 className='text-xl font-bold leading-6 text-grey-900'>
            Thông Tin Phiếu khám #{phieuKham.ID_PhieuKham}
          </h2>
          <p className='mt-1 text-sm text-grey-600'>
            {benhNhan?.HoTenBN || phieuKham.HoTenBN || 'Bệnh nhân'}
          </p>
        </div>

        <div className='flex items-center gap-2'>
          <span className='rounded-full bg-grey-100 px-3 py-1 text-xs font-semibold text-grey-700'>
            Trạng thái: {phieuKham.TrangThai}
          </span>

          {!readOnly && phieuKham.TrangThai === 'DangKham' && (
            <button
              type='button'
              className='rounded-md bg-success-900 px-3 py-2 text-sm font-semibold text-white'
              onClick={() => {
                if (!phieuKham?.ID_DichVu) {
                  toast.error('Vui lòng chọn dịch vụ khám trước khi hoàn tất khám');
                  return;
                }
                completeMutation.mutate();
              }}
              disabled={completeMutation.isLoading}
            >
              Hoàn tất khám
            </button>
          )}

          <button
            type='button'
            className='rounded-md bg-grey-100 px-3 py-2 text-sm font-semibold text-grey-700'
            onClick={() => onCloseModal && onCloseModal()}
          >
            Đóng
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        <div className='grid grid-cols-12 gap-4'>
          <div className='col-span-8 rounded-xl border border-grey-transparent bg-white p-5'>
            <div className='mb-4 flex items-center justify-between'>
              <h3 className='text-sm font-bold uppercase tracking-wide text-grey-700'>Thông tin khám</h3>
              {!isEditting ? (
                <button
                  className='rounded-md bg-primary px-3 py-2 text-sm font-semibold text-white'
                  onClick={() => setIsEditting(true)}
                  disabled={readOnly}
                  style={readOnly ? { opacity: 0.5, cursor: 'not-allowed' } : undefined}
                  type='button'
                >
                  Chỉnh sửa
                </button>
              ) : (
                <div className='flex items-center gap-2'>
                  <button
                    className='rounded-md bg-success-900 px-3 py-2 text-sm font-semibold text-white'
                    disabled={updateMutation.isLoading}
                    type='submit'
                  >
                    Lưu
                  </button>
                  <button
                    className='rounded-md bg-error-900 px-3 py-2 text-sm font-semibold text-white'
                    onClick={() => setIsEditting(false)}
                    type='button'
                  >
                    Huỷ
                  </button>
                </div>
              )}
            </div>

            <Grid2Col>
              <FormRow inline={true} label='Ngày khám:'>
                <Text>{tiepNhan?.NgayTN || phieuKham.NgayTN}</Text>
              </FormRow>

              <FormRow inline={true} label='Ca khám:'>
                <Text>{tiepNhan?.CaTN || phieuKham.CaTN || phieuKham.CaKham}</Text>
              </FormRow>

              <FormRow inline={true} label='Mã bệnh nhân:'>
                <Text>{tiepNhan?.ID_BenhNhan || phieuKham.ID_BenhNhan}</Text>
              </FormRow>

              <FormRow inline={true} label='Họ tên:'>
                <Text>{benhNhan?.HoTenBN || phieuKham.HoTenBN}</Text>
              </FormRow>

              <FormRow inline={true} label='Triệu chứng:' error={errors.TrieuChung?.message}>
                {isEditting ? (
                  <InputNew
                    type='text'
                    name='TrieuChung'
                    defauValues={getValues('TrieuChung')}
                    {...register('TrieuChung', {
                      required: 'Bắt buộc !',
                    })}
                  />
                ) : (
                  <Text>{phieuKham.TrieuChung || 'Chưa cập nhật'}</Text>
                )}
              </FormRow>

              <FormRow inline={true} label='Dịch vụ khám:' error={errors.ID_DichVu?.message}>
                {isEditting ? (
                  <select
                    className='w-full rounded-md border border-grey-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary'
                    {...register('ID_DichVu', {
                      required: 'Bắt buộc !',
                    })}
                    defaultValue={getValues('ID_DichVu') ?? phieuKham.ID_DichVu ?? ''}
                  >
                    <option value=''>Chọn dịch vụ</option>
                    {dichVuList.map((dv) => (
                      <option key={dv.ID_DichVu} value={dv.ID_DichVu}>
                        {dv.TenDichVu}
                      </option>
                    ))}
                  </select>
                ) : (
                  <Text>{selectedDichVu?.TenDichVu || 'Chưa chọn'}</Text>
                )}
              </FormRow>

              <FormRow inline={true} label='Chẩn đoán:' error={errors.ID_LoaiBenh?.message}>
                {isEditting ? (
                  <select
                    className='w-full rounded-md border border-grey-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary'
                    {...register('ID_LoaiBenh', {
                      required: 'Bắt buộc !',
                    })}
                    defaultValue={getValues('ID_LoaiBenh') || phieuKham.ID_LoaiBenh || ''}
                  >
                    <option value=''>-- Chọn loại bệnh --</option>
                    {loaiBenhList.map((loai) => (
                      <option key={loai.ID_LoaiBenh} value={loai.ID_LoaiBenh}>
                        {loai.TenLoaiBenh}
                      </option>
                    ))}
                  </select>
                ) : (
                  <Text>{phieuKham.loaiBenh?.TenLoaiBenh || 'Chưa chẩn đoán'}</Text>
                )}
              </FormRow>
            </Grid2Col>
          </div>

          <div className='col-span-4 space-y-4'>
            <div className='rounded-xl border border-primary bg-white p-5'>
              <p className='text-xs font-semibold uppercase text-grey-500'>Tiền khám</p>
              <div className='mt-2'>
                <p className='text-lg font-bold text-grey-900'>
                  {formatCurrency(phieuKham.TienKham)} Đồng
                </p>
                <p className='mt-1 text-xs text-grey-500'>
                  {selectedDichVu 
                    ? `(Quy định + ${selectedDichVu.TenDichVu})`
                    : '(Từ quy định)'}
                </p>
              </div>
            </div>

            <div className='rounded-xl border border-primary bg-white p-5'>
              <p className='text-xs font-semibold uppercase text-grey-500'>Tiền thuốc</p>
              <p className='mt-2 text-lg font-bold text-grey-900'>
                {formatCurrency(phieuKham.TongTienThuoc)} Đồng
              </p>
              <p className='mt-1 text-xs text-grey-500'>Tự động cập nhật theo toa thuốc</p>
            </div>
          </div>
        </div>
      </form>

      {!readOnly && (
        <div className='mt-4 rounded-xl border border-grey-transparent bg-white p-5'>
          <h3 className='mb-4 text-sm font-bold uppercase tracking-wide text-grey-700'>Kê toa thuốc</h3>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const thuocId = parseInt(e.currentTarget.ID_Thuoc.value);
              const soLuong = parseInt(e.currentTarget.SoLuong.value || '1');
              const cachDung = e.currentTarget.CachDung.value || null;
              if (!thuocId) return;
              addDrugMutation.mutate({ ID_Thuoc: thuocId, SoLuong: soLuong, CachDung: cachDung });
              e.currentTarget.reset();
            }}
            className='grid grid-cols-4 gap-3 items-end'
          >
            <div>
              <label className='block text-xs font-semibold text-grey-500 mb-1'>Thuốc</label>
              <select name='ID_Thuoc' className='w-full rounded-md border border-grey-transparent px-3 py-2 text-sm'>
                <option value=''>-- Chọn thuốc --</option>
                {drugs.map((d) => (
                  <option key={d.idThuoc} value={d.idThuoc}>
                    {d.tenThuoc} {d.donGiaBan ? `- ${new Intl.NumberFormat('vi-VN').format(d.donGiaBan)}đ` : ''}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className='block text-xs font-semibold text-grey-500 mb-1'>Số lượng</label>
              <input
                name='SoLuong'
                type='number'
                min='1'
                defaultValue='1'
                className='w-full rounded-md border border-grey-transparent px-3 py-2 text-sm'
              />
            </div>
            <div>
              <label className='block text-xs font-semibold text-grey-500 mb-1'>Cách dùng</label>
              <select
                name='CachDung'
                className='w-full rounded-md border border-grey-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary'
              >
                <option value=''>-- Chọn cách dùng --</option>
                {cachDungList.map((cachDung) => (
                  <option key={cachDung.idCachDung} value={cachDung.moTaCachDung}>
                    {cachDung.moTaCachDung}
                  </option>
                ))}
              </select>
            </div>
            <button
              type='submit'
              className='rounded-md bg-primary px-3 py-2 text-sm font-semibold text-white'
              disabled={addDrugMutation.isLoading}
            >
              Thêm thuốc
            </button>
          </form>
        </div>
      )}

      <div className='mt-4 rounded-xl border border-grey-transparent bg-white p-5'>
        <h3 className='mb-4 text-sm font-bold uppercase tracking-wide text-grey-700'>Danh sách thuốc đã kê</h3>
        <Table columns='1fr 2fr 1fr 1fr 2fr 1fr 1fr'>
          <Table.Header>
            <div className='mx-auto'>Ảnh</div>
            <div className='mx-auto'>Tên thuốc</div>
            <div className='mx-auto'>ĐVT</div>
            <div className='mx-auto'>Số lượng</div>
            <div className='mx-auto'>Cách dùng</div>
            <div className='mx-auto'>Đơn giá</div>
            <div className='mx-auto'>Thành tiền</div>
          </Table.Header>

          <Table.Body
            data={toaThuocList}
            render={(toa) => {
              const thuoc = toa.thuoc;
              const donGia = toa.DonGiaBan_LuocMua ?? thuoc?.DonGiaBan;
              return (
                <Table.Row key={`${toa.ID_PhieuKham}-${toa.ID_Thuoc}`}>
                  <div className='mx-auto flex items-center justify-center'>
                    {thuoc?.HinhAnh || thuoc?.hinhAnh ? (
                      <img src={thuoc.HinhAnh || thuoc.hinhAnh} alt={thuoc.TenThuoc || thuoc.tenThuoc} style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '4px' }} />
                    ) : (
                      <span className="text-xs text-grey-400">Không có</span>
                    )}
                  </div>
                  <Text>{thuoc?.TenThuoc || thuoc?.tenThuoc || '—'}</Text>
                  <Text>{thuoc?.dvt?.TenDVT || thuoc?.dvt?.TenDvt || thuoc?.tenDvt || '—'}</Text>
                  <Text>{toa.SoLuong}</Text>
                  <Text>{toa.CachDung || '—'}</Text>
                  <Text>{formatCurrency(donGia ?? 0)}</Text>
                  <div className='flex items-center justify-end gap-2'>
                    <Text>{formatCurrency(toa.TienThuoc ?? 0)}</Text>
                    {!readOnly && (
                      <button
                        type='button'
                        className='rounded bg-error-900 px-2 py-1 text-xs font-semibold text-white'
                        onClick={() => removeDrugMutation.mutate(toa.ID_Thuoc)}
                        disabled={removeDrugMutation.isLoading}
                      >
                        Xóa
                      </button>
                    )}
                  </div>
                </Table.Row>
              );
            }}
          />
        </Table>
      </div>
    </LayoutMedicalDetail>
  );
};

export default MedicalDetail;
