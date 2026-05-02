import { useForm } from 'react-hook-form';
import styled from 'styled-components';
import FormRow from '../../ui/FormRow';
import InputNew from '../../ui/InputNew';
import Button from '../../ui/Button';
import InputImage from '../../ui/InputImage';
import Select from '../../ui/Select';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateDoctor, createDoctor, fetchGroups } from './APIdoctors';
import { useEffect, useState } from 'react';

const Form = styled.form`
  display: grid;
  grid-template-columns: 1fr 1fr;
  row-gap: 16px;
  column-gap: 24px;
  margin: 0 auto;
  min-width: 600px;
`;

const CreateDoctorForm = ({
  doctor = null,
  onSuccess,
  onCloseModal,
  title = 'Thông tin bác sĩ',
  submitLabel = 'Thêm Bác sĩ',
}) => {
  const isEdit = !!doctor;

  // Normalize field names - support both camelCase (from DTO) and PascalCase (legacy)
  const docId = doctor?.idNhanVien || doctor?.ID_NhanVien;
  const docName = doctor?.hoTenNV || doctor?.HoTenNV || '';
  const docBirthday = doctor?.ngaySinh || doctor?.NgaySinh || '';
  const docPhone = doctor?.dienThoai || doctor?.DienThoai || '';
  const docCccd = doctor?.cccd || doctor?.CCCD || '';
  const docAddress = doctor?.diaChi || doctor?.DiaChi || '';
  const docGender = doctor?.gioiTinh || doctor?.GioiTinh || '';
  const docEmail = doctor?.email || doctor?.Email || '';
  const docAvatar = doctor?.hinhAnh || doctor?.HinhAnh || 'default_avatar.jpg';
  const docGroupId = doctor?.idNhom || doctor?.ID_Nhom;

  const { register, handleSubmit, reset, setValue, formState } = useForm({
    defaultValues: doctor ? {
      name: docName,
      birthday: docBirthday,
      sdt: docPhone,
      cccd: docCccd,
      address: docAddress,
      gender: docGender,
      email: docEmail,
      avatarUrl: docAvatar,
      id_nhom: docGroupId ? String(docGroupId) : '',
    } : {},
  });

  const { errors } = formState;

  const queryClient = useQueryClient();

  const { mutate, isLoading } = useMutation({
    mutationFn: isEdit
      ? (data) => updateDoctor(docId, data)
      : createDoctor,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['doctors'] });
      queryClient.invalidateQueries({ queryKey: ['employees'] });
      reset();
      if (onSuccess) onSuccess();
      if (onCloseModal) onCloseModal();
    },
    onError: (err) => alert(err.message),
  });

  const [groups, setGroups] = useState([]);
  useEffect(() => {
    fetchGroups().then((res) => {
      // NhomNguoiDungController wraps in ApiResponse: { success, data, message }
      const arr = Array.isArray(res) ? res : (res?.data || []);
      setGroups(arr);
    }).catch(() => setGroups([]));
  }, []);

  useEffect(() => {
    if (isEdit && doctor) {
      // Map dữ liệu từ API sang form fields (support both camelCase and PascalCase)
      setValue('name', docName);
      setValue('birthday', docBirthday);
      setValue('sdt', docPhone);
      setValue('cccd', docCccd);
      setValue('address', docAddress);
      setValue('gender', docGender);
      setValue('email', docEmail);
      setValue('avatarUrl', docAvatar);
      if (docGroupId) {
        setValue('id_nhom', String(docGroupId));
      }
      // Password không set khi edit (để trống, chỉ required khi tạo mới)
    }
  }, [isEdit, doctor, setValue, docName, docBirthday, docPhone, docCccd, docAddress, docGender, docEmail, docAvatar, docGroupId]);

  function onSubmit(data) {
    const payload = {
      email: data.email,
      password: data.password, 
      hoTenNV: data.name,
      ngaySinh: data.birthday,
      gioiTinh: data.gender,
      cccd: data.cccd,
      dienThoai: data.sdt,
      diaChi: data.address,
      hinhAnh: data.avatarUrl || 'default_avatar.jpg',
      idNhom: Number(data.id_nhom),
    };
    if (isEdit && !payload.password) delete payload.password; // Sửa không cần gửi password nếu bỏ trống
    mutate(payload);
  }

  return (
    <div>
      <div className='w-full pb-4 mb-10 border-b border-grey-transparent'>
        <h2 className='text-xl font-bold'>{title}</h2>
      </div>
      <Form onSubmit={handleSubmit(onSubmit)}>
        <InputImage />

        <FormRow label='Name*' error={errors.name?.message}>
          <InputNew
            type='text'
            id='name'
            disabled={isLoading}
            {...register('name', {
              required: 'Bắt buộc !',
            })}
          />
        </FormRow>

        <FormRow label={isEdit ? 'Password (để trống nếu không đổi)' : 'Password*'} error={errors.password?.message}>
          <InputNew
            type='password'
            id='password'
            disabled={isLoading}
            placeholder={isEdit ? 'Để trống nếu không đổi mật khẩu' : ''}
            {...register('password', {
              required: isEdit ? false : 'Bắt buộc !',
              minLength: isEdit ? undefined : {value: 8, message: 'Mật khẩu phải có ít nhất 8 ký tự'}
            })}
          />
        </FormRow>

        <FormRow label='Ngày sinh*' error={errors.birthday?.message}>
          <InputNew
            type='date'
            id='birthday'
            disabled={isLoading}
            {...register('birthday', {
              required: 'Bắt buộc !',
            })}
          />
        </FormRow>

        <FormRow label='Căn cước công dân*' error={errors.cccd?.message}>
          <InputNew
            type='text'
            id='cccd'
            disabled={isLoading}
            {...register('cccd', {
              required: 'Bắt buộc !',
            })}
          />
        </FormRow>

        <FormRow label='Số điện thoại*' error={errors.sdt?.message}>
          <InputNew
            id='sdt'
            type='text'
            disabled={isLoading}
            {...register('sdt', {
              required: 'Bắt buộc !',
            })}
          />
        </FormRow>

        <FormRow label='Email*' error={errors.email?.message}>
          <InputNew
            type='email'
            id='email'
            disabled={isLoading}
            {...register('email', {
              required: 'Bắt buộc !',
              pattern: {value: /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, message: 'Email không hợp lệ'}
            })}
          />
        </FormRow>

        <FormRow label='Giới tính' error={errors.gender?.message}>
          <InputNew
            type='text'
            id='gender'
            disabled={isLoading}
            {...register('gender', {
              required: 'Bắt buộc !',
            })}
          />
        </FormRow>

        <FormRow label='Địa chỉ' error={errors.address?.message}>
          <InputNew
            id='address'
            type='text'
            disabled={isLoading}
            {...register('address', {
              required: 'Bắt buộc !',
            })}
          />
        </FormRow>

        <FormRow label='URL Hình ảnh' error={errors.avatarUrl?.message}>
          <InputNew
            type='text'
            id='avatarUrl'
            disabled={isLoading}
            defaultValue='default_avatar.jpg'
            {...register('avatarUrl')}
          />
        </FormRow>

        <FormRow label='Nhóm người dùng*' error={errors.id_nhom?.message}>
          <Select
            id='id_nhom'
            disabled={isLoading}
            {...register('id_nhom', { required: 'Bắt buộc !' })}
            defaultValue=''
          >
            <option value='' disabled>
              -- Chọn nhóm --
            </option>
            {groups.map((g) => {
              const id = g.idNhom || g.ID_Nhom;
              const name = g.tenNhom || g.TenNhom;
              return (
                <option key={id} value={id}>
                  {name}
                </option>
              );
            })}
          </Select>
        </FormRow>

        <div className='flex items-end justify-end gap-x-3'>
          <Button
            className='bg-light text-grey-900 px-[10px] py-[6px]'
            type='reset'
            disabled={isLoading}
            onClick={() => {
              reset();
            }}
          >
            Huỷ
          </Button>
          <Button
            className='text-white bg-primary px-[10px] py-[6px] font-medium'
            type='submit'
            disabled={isLoading}
          >
            {isEdit
              ? isLoading
                ? 'Đang lưu...'
                : 'Lưu thay đổi'
              : isLoading
              ? 'Đang thêm...'
              : submitLabel}
          </Button>
        </div>
      </Form>
    </div>
  );
};

export default CreateDoctorForm;
