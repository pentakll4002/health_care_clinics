import { useEffect } from 'react';
import styled from 'styled-components';
import { useForm } from 'react-hook-form';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';

import FormRow from '../../ui/FormRow';
import InputNew from '../../ui/InputNew';
import Button from '../../ui/Button';
import { useRegulations } from './useRegulations';
import { updateRegulations } from './APIRegulations';
import Spinner from '../../ui/Spinner';

const Form = styled.form`
  display: grid;
  grid-template-columns: 1fr 1fr;
  column-gap: 24px;
  row-gap: 24px;
  max-width: 800px;
  background: #fff;
  padding: 32px;
  border-radius: 12px;
  border: 1px solid #e7e8eb;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.04);
`;

const Actions = styled.div`
  grid-column: span 2;
  display: flex;
  justify-content: flex-end;
  gap: 12px;
`;

const RegulationsForm = () => {
  const queryClient = useQueryClient();
  const { regulations, isLoading } = useRegulations();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      SoBenhNhanToiDa: '',
      TienKham: '',
      TyLeGiaBan: '',
      GioLamViec_Sang_BatDau: '07:00',
      GioLamViec_Sang_KetThuc: '11:30',
      GioLamViec_Chieu_BatDau: '13:30',
      GioLamViec_Chieu_KetThuc: '17:00',
      GioLamViec_Toi_BatDau: '18:00',
      GioLamViec_Toi_KetThuc: '21:00',
    },
  });

  function minutesToTime(value) {
    const minutes = Number(value);
    if (!Number.isFinite(minutes)) return '';
    const hh = String(Math.floor(minutes / 60)).padStart(2, '0');
    const mm = String(minutes % 60).padStart(2, '0');
    return `${hh}:${mm}`;
  }

  function timeToMinutes(value) {
    if (!value || typeof value !== 'string') return null;
    const [hh, mm] = value.split(':').map((x) => Number(x));
    if (!Number.isFinite(hh) || !Number.isFinite(mm)) return null;
    return hh * 60 + mm;
  }

  useEffect(() => {
    if (!regulations) return;

    reset({
      SoBenhNhanToiDa: regulations.SoBenhNhanToiDa ?? '',
      TienKham: regulations.TienKham ?? '',
      TyLeGiaBan: regulations.TyLeGiaBan ?? '',
      GioLamViec_Sang_BatDau: minutesToTime(regulations.GioLamViec_Sang_BatDau ?? 420) || '07:00',
      GioLamViec_Sang_KetThuc: minutesToTime(regulations.GioLamViec_Sang_KetThuc ?? 690) || '11:30',
      GioLamViec_Chieu_BatDau: minutesToTime(regulations.GioLamViec_Chieu_BatDau ?? 810) || '13:30',
      GioLamViec_Chieu_KetThuc: minutesToTime(regulations.GioLamViec_Chieu_KetThuc ?? 1020) || '17:00',
      GioLamViec_Toi_BatDau: minutesToTime(regulations.GioLamViec_Toi_BatDau ?? 1080) || '18:00',
      GioLamViec_Toi_KetThuc: minutesToTime(regulations.GioLamViec_Toi_KetThuc ?? 1260) || '21:00',
    });
  }, [regulations, reset]);

  const { mutate: updateMutation, isLoading: isSubmitting } = useMutation({
    mutationFn: updateRegulations,
    onSuccess: () => {
      toast.success('Cập nhật quy định thành công');
      queryClient.invalidateQueries({ queryKey: ['regulations'] });
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message || 'Cập nhật thất bại');
    },
  });

  function onSubmit(values) {
    const payload = [];

    if (values.SoBenhNhanToiDa !== '') {
      payload.push({
        idQuyDinh: 1,
        tenQuyDinh: 'Số bệnh nhân tối đa trong ngày',
        giaTri: parseInt(values.SoBenhNhanToiDa, 10)
      });
    }
    if (values.TienKham !== '') {
      payload.push({
        idQuyDinh: 2,
        tenQuyDinh: 'Giá khám cơ bản',
        giaTri: parseFloat(values.TienKham)
      });
    }
    if (values.TyLeGiaBan !== '') {
      payload.push({
        idQuyDinh: 3,
        tenQuyDinh: 'Số thuốc tối đa trong toa',
        giaTri: parseFloat(values.TyLeGiaBan)
      });
    }

    const keys = [
      'GioLamViec_Sang_BatDau',
      'GioLamViec_Sang_KetThuc',
      'GioLamViec_Chieu_BatDau',
      'GioLamViec_Chieu_KetThuc',
      'GioLamViec_Toi_BatDau',
      'GioLamViec_Toi_KetThuc',
    ];

    keys.forEach((k, index) => {
      if (values[k] !== '') {
        const minutes = timeToMinutes(values[k]);
        if (minutes !== null) {
          payload.push({
            idQuyDinh: 4 + index,
            tenQuyDinh: k,
            giaTri: minutes
          });
        }
      }
    });

    updateMutation(payload);
  }

  if (isLoading) return <Spinner />;

  return (
    <Form onSubmit={handleSubmit(onSubmit)}>
      <FormRow
        label='Số bệnh nhân khám tối đa mỗi ngày'
        error={errors.SoBenhNhanToiDa?.message}
      >
        <InputNew
          type='number'
          min={1}
          id='SoBenhNhanToiDa'
          {...register('SoBenhNhanToiDa', {
            required: 'Bắt buộc',
            min: { value: 1, message: 'Ít nhất 1 bệnh nhân' },
            max: { value: 1000, message: 'Không vượt quá 1000' },
          })}
        />
      </FormRow>

      <div className='col-span-2'>
        <p className='text-sm font-semibold text-grey-900'>Giờ làm việc theo ca</p>
        <p className='text-xs text-grey-500 mt-1'>Thiết lập khung giờ để hệ thống chặn đặt lịch ngoài giờ làm việc.</p>
      </div>

      <FormRow label='Ca sáng - Bắt đầu' error={errors.GioLamViec_Sang_BatDau?.message}>
        <InputNew
          type='time'
          id='GioLamViec_Sang_BatDau'
          {...register('GioLamViec_Sang_BatDau', { required: 'Bắt buộc' })}
        />
      </FormRow>

      <FormRow label='Ca sáng - Kết thúc' error={errors.GioLamViec_Sang_KetThuc?.message}>
        <InputNew
          type='time'
          id='GioLamViec_Sang_KetThuc'
          {...register('GioLamViec_Sang_KetThuc', { required: 'Bắt buộc' })}
        />
      </FormRow>

      <FormRow label='Ca chiều - Bắt đầu' error={errors.GioLamViec_Chieu_BatDau?.message}>
        <InputNew
          type='time'
          id='GioLamViec_Chieu_BatDau'
          {...register('GioLamViec_Chieu_BatDau', { required: 'Bắt buộc' })}
        />
      </FormRow>

      <FormRow label='Ca chiều - Kết thúc' error={errors.GioLamViec_Chieu_KetThuc?.message}>
        <InputNew
          type='time'
          id='GioLamViec_Chieu_KetThuc'
          {...register('GioLamViec_Chieu_KetThuc', { required: 'Bắt buộc' })}
        />
      </FormRow>

      <FormRow label='Ca tối - Bắt đầu' error={errors.GioLamViec_Toi_BatDau?.message}>
        <InputNew
          type='time'
          id='GioLamViec_Toi_BatDau'
          {...register('GioLamViec_Toi_BatDau', { required: 'Bắt buộc' })}
        />
      </FormRow>

      <FormRow label='Ca tối - Kết thúc' error={errors.GioLamViec_Toi_KetThuc?.message}>
        <InputNew
          type='time'
          id='GioLamViec_Toi_KetThuc'
          {...register('GioLamViec_Toi_KetThuc', { required: 'Bắt buộc' })}
        />
      </FormRow>

      <FormRow label='Tiền khám (VND)' error={errors.TienKham?.message}>
        <InputNew
          type='number'
          min={0}
          step='1000'
          id='TienKham'
          {...register('TienKham', {
            required: 'Bắt buộc',
            min: { value: 0, message: 'Không nhỏ hơn 0' },
          })}
        />
      </FormRow>

      <FormRow label='Tỷ lệ đơn giá bán (%)' error={errors.TyLeGiaBan?.message}>
        <InputNew
          type='number'
          min={0}
          step='0.1'
          id='TyLeGiaBan'
          {...register('TyLeGiaBan', {
            required: 'Bắt buộc',
            min: { value: 0, message: 'Không nhỏ hơn 0' },
          })}
        />
      </FormRow>

      <Actions>
        <Button
          type='button'
          className='bg-light text-grey-900 px-[12px] py-[8px]'
          onClick={() =>
            reset({
              SoBenhNhanToiDa: regulations.SoBenhNhanToiDa ?? '',
              TienKham: regulations.TienKham ?? '',
              TyLeGiaBan: regulations.TyLeGiaBan ?? '',
              GioLamViec_Sang_BatDau: minutesToTime(regulations.GioLamViec_Sang_BatDau ?? 420) || '07:00',
              GioLamViec_Sang_KetThuc: minutesToTime(regulations.GioLamViec_Sang_KetThuc ?? 690) || '11:30',
              GioLamViec_Chieu_BatDau: minutesToTime(regulations.GioLamViec_Chieu_BatDau ?? 810) || '13:30',
              GioLamViec_Chieu_KetThuc: minutesToTime(regulations.GioLamViec_Chieu_KetThuc ?? 1020) || '17:00',
              GioLamViec_Toi_BatDau: minutesToTime(regulations.GioLamViec_Toi_BatDau ?? 1080) || '18:00',
              GioLamViec_Toi_KetThuc: minutesToTime(regulations.GioLamViec_Toi_KetThuc ?? 1260) || '21:00',
            })
          }
        >
          Đặt lại
        </Button>
        <Button
          type='submit'
          className='text-white bg-primary px-[12px] py-[8px] font-medium'
          isLoading={isSubmitting}
        >
          Lưu thay đổi
        </Button>
      </Actions>
    </Form>
  );
};

export default RegulationsForm;


