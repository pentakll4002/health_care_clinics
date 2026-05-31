import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import styled from 'styled-components';
import FormRow from '../../ui/FormRow';
import InputNew from '../../ui/InputNew';
import Button from '../../ui/Button';

const Form = styled.form`
  display: grid;
  grid-template-columns: 1fr;
  row-gap: 16px;
  min-width: 420px;
`;

function ServiceForm({ initialValues, onSubmit, isSubmitting, onCloseModal }) {
  const { register, handleSubmit, reset, formState } = useForm({
    defaultValues: {
      TenDichVu: '',
      DonGia: '',
    },
  });

  const { errors } = formState;

  useEffect(() => {
    if (!initialValues) return;
    reset({
      TenDichVu: initialValues.TenDichVu ?? initialValues.tenDichVu ?? '',
      DonGia: initialValues.DonGia ?? initialValues.donGia ?? '',
    });
  }, [initialValues, reset]);

  function submit(values) {
    const payload = {
      tenDichVu: values.TenDichVu,
      donGia: parseFloat(values.DonGia),
      TenDichVu: values.TenDichVu,
      DonGia: parseFloat(values.DonGia),
    };
    onSubmit(payload);
  }

  return (
    <Form onSubmit={handleSubmit(submit)}>
      <FormRow label='Tên dịch vụ*' error={errors.TenDichVu?.message}>
        <InputNew
          type='text'
          id='TenDichVu'
          {...register('TenDichVu', { required: 'Bắt buộc' })}
        />
      </FormRow>

      <FormRow label='Đơn giá (VND)*' error={errors.DonGia?.message}>
        <InputNew
          type='number'
          min={0}
          step='1000'
          id='DonGia'
          {...register('DonGia', {
            required: 'Bắt buộc',
            min: { value: 0, message: 'Không nhỏ hơn 0' },
          })}
        />
      </FormRow>

      <div className='flex items-center justify-end gap-2'>
        <Button
          type='button'
          className='bg-light text-grey-900 px-[10px] py-[6px]'
          onClick={() => onCloseModal && onCloseModal()}
        >
          Huỷ
        </Button>
        <Button
          type='submit'
          className='text-white bg-primary px-[10px] py-[6px] font-medium'
          isLoading={isSubmitting}
        >
          Lưu
        </Button>
      </div>
    </Form>
  );
}

export default ServiceForm;
