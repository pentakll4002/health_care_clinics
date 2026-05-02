import FormRow from '../../ui/FormRow';
import InputNew from '../../ui/InputNew';
import Select from '../../ui/Select';
import InputImage from '../../ui/InputImage';

const DrugFormFields = ({ register, errors, dvtList = [], cachDungList = [] }) => {
  return (
    <>
      <InputImage />
      <div />

      <FormRow label='Tên thuốc*' error={errors.tenThuoc?.message}>
        <InputNew
          type='text'
          id='tenThuoc'
          {...register('tenThuoc', {
            required: 'Bắt buộc !',
          })}
        />
      </FormRow>

      <FormRow label='Đơn vị tính*' error={errors.idDvt?.message}>
        <Select
          id='idDvt'
          {...register('idDvt', {
            required: 'Bắt buộc !',
          })}
        >
          <option value=''>Chọn đơn vị tính</option>
          {dvtList.map((dvt) => (
            <option key={dvt.idDvt} value={dvt.idDvt}>
              {dvt.tenDvt}
            </option>
          ))}
        </Select>
      </FormRow>

      <FormRow label='Cách dùng*' error={errors.idCachDung?.message}>
        <Select
          id='idCachDung'
          {...register('idCachDung', {
            required: 'Bắt buộc !',
          })}
        >
          <option value=''>Chọn cách dùng</option>
          {cachDungList.map((cachDung) => (
            <option key={cachDung.idCachDung} value={cachDung.idCachDung}>
              {cachDung.moTaCachDung}
            </option>
          ))}
        </Select>
      </FormRow>

      <FormRow label='Thành phần' error={errors.thanhPhan?.message}>
        <InputNew
          type='text'
          id='thanhPhan'
          {...register('thanhPhan')}
        />
      </FormRow>

      <FormRow label='Xuất xứ' error={errors.xuatXu?.message}>
        <InputNew
          type='text'
          id='xuatXu'
          {...register('xuatXu')}
        />
      </FormRow>

      <FormRow label='Số lượng tồn' error={errors.soLuongTon?.message}>
        <InputNew
          type='number'
          id='soLuongTon'
          min='0'
          {...register('soLuongTon')}
        />
      </FormRow>

      <FormRow label='Giá nhập' error={errors.donGiaNhap?.message}>
        <InputNew
          type='number'
          id='donGiaNhap'
          min='0'
          step='0.01'
          {...register('donGiaNhap')}
        />
      </FormRow>

      <FormRow label='Tỷ lệ giá bán' error={errors.tyLeGiaBan?.message}>
        <InputNew
          type='number'
          id='tyLeGiaBan'
          min='0'
          step='0.01'
          {...register('tyLeGiaBan')}
        />
      </FormRow>

      <FormRow label='Giá bán' error={errors.donGiaBan?.message}>
        <InputNew
          type='number'
          id='donGiaBan'
          min='0'
          step='0.01'
          {...register('donGiaBan')}
        />
      </FormRow>

      <FormRow label='Hình ảnh (URL)' error={errors.hinhAnh?.message}>
        <InputNew
          type='text'
          id='hinhAnh'
          {...register('hinhAnh')}
        />
      </FormRow>
    </>
  );
};

export default DrugFormFields;
