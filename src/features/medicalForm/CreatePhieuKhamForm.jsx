import { useForm } from 'react-hook-form';
import styled from 'styled-components';
import FormRow from '../../ui/FormRow';
import InputNew from '../../ui/InputNew';
import Button from '../../ui/Button';
import { useCreatePhieuKham } from './useCreatePhieuKham';
import Spinner from '../../ui/Spinner';

const Grid2Col = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  column-gap: 24px;
  row-gap: 24px;
  margin: 20px auto;
  min-width: 600px;
`;

const CreatePhieuKhamForm = ({ tiepNhan, onCloseModal, onSuccess }) => {
  const { register, handleSubmit, formState } = useForm();
  const { errors } = formState;
  const { mutate: createPhieuKham, isLoading } = useCreatePhieuKham();

  if (!tiepNhan) {
    return <div>Không có thông tin tiếp nhận</div>;
  }

  function onSubmit(data) {
    createPhieuKham(
      {
        ID_TiepNhan: tiepNhan.ID_TiepNhan,
        CaKham: tiepNhan.CaTN,
      },
      {
        onSuccess: () => {
          if (onCloseModal) onCloseModal();
          if (onSuccess) onSuccess();
        },
      }
    );
  }

  const benhNhan = tiepNhan.benhNhan || tiepNhan.benh_nhan || {
    HoTenBN: tiepNhan.HoTenBN || tiepNhan.tenBenhNhan,
    ID_BenhNhan: tiepNhan.ID_BenhNhan || tiepNhan.idBenhNhan,
    DienThoai: tiepNhan.dienThoaiBenhNhan || tiepNhan.DienThoai || tiepNhan.dienThoai,
    CCCD: tiepNhan.cccdBenhNhan || tiepNhan.CCCD
  };

  return (
    <div>
      <h2 className='mb-5 text-xl font-bold leading-6 text-grey-900'>
        Lập phiếu khám mới
      </h2>

      <div className='mb-4 p-4 bg-grey-50 rounded-lg'>
        <p className='text-sm text-grey-600 mb-2'>
          <strong>Bệnh nhân:</strong> {benhNhan?.HoTenBN || 'N/A'}
        </p>
        <p className='text-sm text-grey-600 mb-2'>
          <strong>Ngày tiếp nhận:</strong> {tiepNhan.NgayTN}
        </p>
        <p className='text-sm text-grey-600'>
          <strong>Ca:</strong> {tiepNhan.CaTN}
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        <Grid2Col>
          <FormRow inline={true} label='Ghi chú (tuỳ chọn): ' error={errors.GhiChu?.message}>
            <InputNew
              type='text'
              name='GhiChu'
              placeholder='Ghi chú...'
              {...register('GhiChu')}
            />
          </FormRow>
        </Grid2Col>

        <div className='flex gap-3 justify-end mt-6'>
          <Button
            type='button'
            onClick={() => onCloseModal && onCloseModal()}
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
            {isLoading ? 'Đang tạo...' : 'Tạo phiếu khám'}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default CreatePhieuKhamForm;

