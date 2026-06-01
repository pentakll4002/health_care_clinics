import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import styled from 'styled-components';
import FormRow from '../../ui/FormRow';
import InputNew from '../../ui/InputNew';
import Select from '../../ui/Select';
import Button from '../../ui/Button';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createInvoice } from './APIInvoices';
import toast from 'react-hot-toast';
import axiosInstance from '../../utils/axiosInstance';
import { useUser } from '../../hooks/useUser';

const Form = styled.form`
  display: grid;
  grid-template-columns: 1fr 1fr;
  column-gap: 24px;
  margin: 0 auto;
  min-width: 600px;
`;

async function getPhieuKhamList() {
  const response = await axiosInstance.get('/phieu-kham', {
    params: { limit: 100, only_without_invoice: true, only_completed: true },
  });
  return response.data;
}

const CreateInvoiceForm = ({ onCloseModal }) => {
  const { nhanVien } = useUser();
  const { register, handleSubmit, reset, formState, watch, setError } = useForm({
    defaultValues: {
      NgayHoaDon: new Date().toISOString().slice(0, 10),
    },
  });
  const { errors } = formState;
  const queryClient = useQueryClient();
  const [preview, setPreview] = useState(null);

  const { data: phieuKhamData } = useQuery({
    queryKey: ['phieukham-list-for-invoice'],
    queryFn: getPhieuKhamList,
  });

  const phieuKhamList = phieuKhamData?.data || [];
  const selectedPhieuKham = watch('ID_PhieuKham');

  useEffect(() => {
    let ignore = false;
    async function fetchPreview(id) {
      try {
        const response = await axiosInstance.get(`/invoices/preview/${id}`);
        if (!ignore) {
          setPreview(response.data);
          setError('ID_PhieuKham', undefined);
        }
      } catch (error) {
        if (!ignore) {
          setPreview(null);
          if (error.response?.status === 409) {
            toast.error('Phiếu khám đã được lập hoá đơn');
            setError('ID_PhieuKham', {
              type: 'manual',
              message: 'Phiếu khám đã được lập hoá đơn',
            });
          } else if (error.response?.status === 404) {
            toast.error('Phiếu khám không tồn tại');
          } else {
            toast.error('Không tải được dữ liệu xem trước');
          }
        }
      }
    }

    if (selectedPhieuKham) {
      fetchPreview(selectedPhieuKham);
    } else {
      setPreview(null);
    }

    return () => {
      ignore = true;
    };
  }, [selectedPhieuKham, setError]);

  const { mutate: createInvoiceMutation, isLoading } = useMutation({
    mutationFn: createInvoice,
    onSuccess: () => {
      toast.success('Tạo hoá đơn thành công');
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      reset({
        ID_PhieuKham: '',
        NgayHoaDon: new Date().toISOString().slice(0, 10),
      });
      setPreview(null);
      if (onCloseModal) onCloseModal();
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message || 'Tạo hoá đơn thất bại');
    },
  });

  function onSubmit(data) {
    const payload = {
      ID_PhieuKham: parseInt(data.ID_PhieuKham),
      NgayHoaDon: data.NgayHoaDon,
    };
    createInvoiceMutation(payload);
  }

  return (
    <div>
      <div className='w-full pb-4 mb-10 border-b border-grey-transparent'>
        <h2 className='text-xl font-bold'>Thông tin hoá đơn</h2>
      </div>
      <Form onSubmit={handleSubmit(onSubmit)}>
        <FormRow label='Phiếu khám*' error={errors.ID_PhieuKham?.message}>
          <Select
            id='ID_PhieuKham'
            {...register('ID_PhieuKham', {
              required: 'Bắt buộc !',
            })}
          >
            <option value=''>Chọn phiếu khám</option>
            {phieuKhamList.map((p) => (
              <option key={p.ID_PhieuKham} value={p.ID_PhieuKham}>
                {(() => {
                  const tiepNhan = p.tiepNhan || p.tiep_nhan;
                  const benhNhan = tiepNhan?.benhNhan || tiepNhan?.benh_nhan || (tiepNhan ? {
                    HoTenBN: tiepNhan.HoTenBN || tiepNhan.tenBenhNhan,
                    ID_BenhNhan: tiepNhan.ID_BenhNhan || tiepNhan.idBenhNhan,
                    DienThoai: tiepNhan.dienThoaiBenhNhan || tiepNhan.DienThoai || tiepNhan.dienThoai,
                    CCCD: tiepNhan.cccdBenhNhan || tiepNhan.CCCD
                  } : null);
                  const ten = benhNhan?.HoTenBN || 'N/A';
                  const idBN = benhNhan?.ID_BenhNhan;
                  return `#${p.ID_PhieuKham} - ${ten}${idBN ? ` (BN#${idBN})` : ''}`;
                })()}
              </option>
            ))}
          </Select>
        </FormRow>

        <FormRow label='Nhân viên lập'>
          <InputNew type='text' value={nhanVien?.HoTenNV ?? ''} readOnly disabled />
        </FormRow>

        <FormRow label='Ngày hoá đơn*' error={errors.NgayHoaDon?.message}>
          <InputNew
            type='date'
            id='NgayHoaDon'
            {...register('NgayHoaDon', {
              required: 'Bắt buộc !',
            })}
          />
        </FormRow>

        <FormRow label='Dịch vụ'>
          <InputNew
            type='text'
            id='DichVuPreview'
            value={preview?.DichVu?.TenDichVu ?? ''}
            readOnly
            disabled
          />
        </FormRow>

        <FormRow label='Tiền khám'>
          <InputNew
            type='number'
            id='TienKhamPreview'
            value={preview?.TienKham ?? ''}
            readOnly
            disabled
          />
        </FormRow>

        <FormRow label='Tiền thuốc'>
          <InputNew
            type='number'
            id='TienThuocPreview'
            value={preview?.TienThuoc ?? ''}
            readOnly
            disabled
          />
        </FormRow>

        <FormRow label='Tổng tiền'>
          <InputNew
            type='number'
            id='TongTienPreview'
            value={preview?.TongTien ?? ''}
            readOnly
            disabled
          />
        </FormRow>

        <div />

        <div className='col-span-2 flex items-center justify-end gap-3 pt-4 border-t border-grey-transparent'>
          <Button
            className='bg-grey-100 text-grey-700 px-5 py-2.5 min-h-[44px] font-semibold hover:bg-grey-200 transition-colors duration-200'
            onClick={() => {
              reset({
                ID_PhieuKham: '',
                NgayHoaDon: new Date().toISOString().slice(0, 10),
              });
              setPreview(null);
            }}
            type='button'
          >
            Huỷ
          </Button>
          <Button
            className='text-white bg-primary px-5 py-2.5 min-h-[44px] font-semibold hover:bg-primary/90 transition-all duration-200 shadow-md hover:shadow-lg'
            type='submit'
            isLoading={isLoading}
          >
            Tạo Hoá Đơn
          </Button>
        </div>
      </Form>
    </div>
  );
};

export default CreateInvoiceForm;


