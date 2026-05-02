import { useForm } from 'react-hook-form';
import styled from 'styled-components';
import FormRow from '../../ui/FormRow';
import InputNew from '../../ui/InputNew';
import Button from '../../ui/Button';
import { useCreateLichKham } from './useCreateLichKham';
import { useQuery } from '@tanstack/react-query';
import axiosInstance from '../../utils/axiosInstance';

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 20px;
  width: 100%;
  max-width: 500px;
`;

const CreateLichKhamForm = ({ onCloseModal, onSuccess }) => {
  // Lấy ngày hôm nay theo múi giờ local (PC) làm default và min date
  const now = new Date();
  const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

  // Xác định ca khám mặc định dựa vào giờ hiện tại
  const currentHour = now.getHours();
  let defaultCaKham = 'Sáng';
  if (currentHour >= 12 && currentHour < 17) {
    defaultCaKham = 'Chiều';
  } else if (currentHour >= 17) {
    defaultCaKham = 'Tối';
  }

  const { register, handleSubmit, formState, reset, watch } = useForm({
    defaultValues: {
      NgayKhamDuKien: today,
      CaKham: defaultCaKham,
      ID_BacSi: '',
      GhiChu: '',
    },
  });
  const { errors } = formState;
  const { mutate: createLichKham, isLoading } = useCreateLichKham();

  // Fetch danh sách bác sĩ
  const { data: doctorsData, isLoading: isLoadingDoctors } = useQuery({
    queryKey: ['doctors-for-booking'],
    queryFn: async () => {
      const res = await axiosInstance.get('/nhanvien', {
        params: { ma_nhom: 'DOCTOR' },
      });
      return res.data;
    },
  });

  // Normalize doctors list - API returns array directly
  const doctors = Array.isArray(doctorsData) ? doctorsData : (doctorsData?.data || []);

  function onSubmit(data) {
    const payload = {
      NgayKhamDuKien: data.NgayKhamDuKien,
      CaKham: data.CaKham,
      GhiChu: data.GhiChu || null,
    };
    // Chỉ gửi ID_BacSi nếu đã chọn bác sĩ
    if (data.ID_BacSi) {
      payload.ID_BacSi = Number(data.ID_BacSi);
    }

    createLichKham(
      payload,
      {
        onSuccess: () => {
          reset();
          if (onCloseModal) onCloseModal();
          if (onSuccess) onSuccess();
        },
      }
    );
  }

  return (
    <Form onSubmit={handleSubmit(onSubmit)}>
      <h2 className='text-xl font-bold text-grey-900 mb-4'>Đặt lịch khám</h2>

      <FormRow label='Ngày khám dự kiến' error={errors.NgayKhamDuKien?.message}>
        <InputNew
          type='date'
          id='NgayKhamDuKien'
          min={today}
          {...register('NgayKhamDuKien', {
            required: 'Vui lòng chọn ngày khám',
            validate: (value) => {
              const selectedDate = new Date(value);
              const todayDate = new Date();
              todayDate.setHours(0, 0, 0, 0);
              if (selectedDate < todayDate) {
                return 'Ngày khám phải từ hôm nay trở đi';
              }
              return true;
            },
          })}
        />
      </FormRow>

      <FormRow label='Ca khám (Sáng/Chiều/Tối)' error={errors.CaKham?.message}>
        <select
          id='CaKham'
          className='w-full px-3 py-2 border border-grey-transparent rounded-md focus:outline-none focus:ring-2 focus:ring-primary'
          {...register('CaKham', {
            required: 'Vui lòng chọn ca khám',
          })}
        >
          <option value='Sáng'>Sáng</option>
          <option value='Chiều'>Chiều</option>
          <option value='Tối'>Tối</option>
        </select>
      </FormRow>

      <FormRow label='Chọn bác sĩ phụ trách' error={errors.ID_BacSi?.message}>
        <select
          id='ID_BacSi'
          className='w-full px-3 py-2 border border-grey-transparent rounded-md focus:outline-none focus:ring-2 focus:ring-primary'
          disabled={isLoadingDoctors}
          {...register('ID_BacSi')}
        >
          <option value=''>Chọn bác sĩ</option>
          {doctors.map((d) => {
            const id = d.idNhanVien || d.ID_NhanVien;
            const name = d.hoTenNV || d.HoTenNV;
            return (
              <option key={id} value={id}>
                {name}
              </option>
            );
          })}
        </select>
      </FormRow>

      <FormRow label='Ghi chú (tùy chọn)' error={errors.GhiChu?.message}>
        <textarea
          id='GhiChu'
          rows={4}
          className='w-full px-3 py-2 border border-grey-transparent rounded-md focus:outline-none focus:ring-2 focus:ring-primary'
          placeholder='Nhập ghi chú nếu có...'
          {...register('GhiChu', {
            maxLength: {
              value: 1000,
              message: 'Ghi chú không được vượt quá 1000 ký tự',
            },
          })}
        />
      </FormRow>

      <div className='flex gap-3 justify-end'>
        <Button
          type='button'
          onClick={() => reset()}
          className='bg-light text-grey-900 px-4 py-2'
          disabled={isLoading}
        >
          Hủy
        </Button>
        <Button
          type='submit'
          className='bg-primary text-white px-4 py-2'
          disabled={isLoading}
        >
          {isLoading ? 'Đang xử lý...' : 'Đặt lịch khám'}
        </Button>
      </div>
    </Form>
  );
};

export default CreateLichKhamForm;
