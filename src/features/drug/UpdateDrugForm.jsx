import { useForm } from 'react-hook-form';
import { useEffect } from 'react';
import styled from 'styled-components';
import Button from '../../ui/Button';
import DrugFormFields from './DrugFormFields';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { updateDrug, getDVT, getCachDung } from './APIDrugs';
import toast from 'react-hot-toast';

const Form = styled.form`
  display: grid;
  grid-template-columns: 1fr 1fr;
  column-gap: 24px;
  margin: 0 auto;
  min-width: 600px;
`;

const UpdateDrugForm = ({ drug, onCloseModal }) => {
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

  // Set default values when drug data is loaded
  useEffect(() => {
    if (drug) {
      reset({
        tenThuoc: drug.tenThuoc || '',
        idDvt: drug.idDvt || '',
        idCachDung: drug.idCachDung || '',
        thanhPhan: drug.thanhPhan || '',
        xuatXu: drug.xuatXu || '',
        soLuongTon: drug.soLuongTon || 0,
        donGiaNhap: drug.donGiaNhap || '',
        tyLeGiaBan: drug.tyLeGiaBan || '',
        donGiaBan: drug.donGiaBan || '',
        hinhAnh: drug.hinhAnh || '',
      });
    }
  }, [drug, reset]);

  const { mutate: updateDrugMutation, isLoading } = useMutation({
    mutationFn: ({ id, data }) => updateDrug(id, data),
    onSuccess: () => {
      toast.success('Cập nhật thuốc thành công');
      queryClient.invalidateQueries({ queryKey: ['drugs'] });
      queryClient.invalidateQueries({ queryKey: ['drug', drug?.idThuoc] });
      if (onCloseModal) onCloseModal();
    },
    onError: (error) => {
      toast.error(
        error?.response?.data?.message || 'Cập nhật thuốc thất bại'
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
    updateDrugMutation({ id: drug.idThuoc, data: formData });
  }

  if (!drug) return null;

  return (
    <div>
      <div className='w-full pb-4 mb-10 border-b border-grey-transparent'>
        <h2 className='text-xl font-bold'>Cập nhật thông tin thuốc</h2>
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
              if (onCloseModal) onCloseModal();
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
            Cập nhật
          </Button>
        </div>
      </Form>
    </div>
  );
};

export default UpdateDrugForm;
