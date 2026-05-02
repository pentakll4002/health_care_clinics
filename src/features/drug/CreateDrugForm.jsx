import { useForm } from 'react-hook-form';
import styled from 'styled-components';
import Button from '../../ui/Button';
import DrugFormFields from './DrugFormFields';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createDrug, getDVT, getCachDung } from './APIDrugs';
import toast from 'react-hot-toast';

const Form = styled.form`
  display: grid;
  grid-template-columns: 1fr 1fr;
  column-gap: 24px;
  margin: 0 auto;
  min-width: 600px;
`;

const CreateDrugForm = ({ onCloseModal }) => {
  const { register, handleSubmit, reset, formState } = useForm();
  const { errors } = formState;
  const queryClient = useQueryClient();

  const { data: dvtData = [] } = useQuery({
    queryKey: ['dvt'],
    queryFn: getDVT,
  });
  const dvtList = Array.isArray(dvtData) ? dvtData : (dvtData?.data || []);

  const { data: cachDungData = [] } = useQuery({
    queryKey: ['cach-dung'],
    queryFn: getCachDung,
  });
  const cachDungList = Array.isArray(cachDungData) ? cachDungData : (cachDungData?.data || []);

  const { mutate: createDrugMutation, isLoading } = useMutation({
    mutationFn: createDrug,
    onSuccess: () => {
      toast.success('Thêm thuốc thành công');
      queryClient.invalidateQueries({ queryKey: ['drugs'] });
      reset();
      if (onCloseModal) onCloseModal();
    },
    onError: (error) => {
      toast.error(
        error?.response?.data?.message || 'Thêm thuốc thất bại'
      );
    },
  });

  function onSubmit(data) {
    const formData = {
      tenThuoc: data.tenThuoc,
      idDvt: parseInt(data.idDvt),
      idCachDung: parseInt(data.idCachDung),
      thanhPhan: data.thanhPhan || null,
      xuatXu: data.xuatXu || null,
      soLuongTon: parseInt(data.soLuongTon) || 0,
      donGiaNhap: parseFloat(data.donGiaNhap) || null,
      hinhAnh: data.hinhAnh || null,
      tyLeGiaBan: parseFloat(data.tyLeGiaBan) || null,
      donGiaBan: parseFloat(data.donGiaBan) || null,
    };
    createDrugMutation(formData);
  }

  return (
    <div>
      <div className='w-full pb-4 mb-10 border-b border-grey-transparent'>
        <h2 className='text-xl font-bold'>Thông tin thuốc</h2>
      </div>
      <Form onSubmit={handleSubmit(onSubmit)}>
        <DrugFormFields
          register={register}
          errors={errors}
          dvtList={dvtList}
          cachDungList={cachDungList}
        />

        <div />

        <div className='flex items-end justify-end gap-x-3'>
          <Button
            className='bg-light text-grey-900 px-[10px] py-[6px]'
            onClick={() => {
              reset();
            }}
            type='button'
          >
            Huỷ
          </Button>
          <Button
            className='text-white bg-primary px-[10px] py-[6px] font-medium'
            type='submit'
            isLoading={isLoading}
          >
            Thêm Thuốc
          </Button>
        </div>
      </Form>
    </div>
  );
};

export default CreateDrugForm;
