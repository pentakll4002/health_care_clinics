import { useState } from 'react';
import { useForm } from 'react-hook-form';
import styled from 'styled-components';
import Button from '../../ui/Button';
import { useQuery } from '@tanstack/react-query';
import { getDrugs } from './APIDrugs';
import toast from 'react-hot-toast';
import { useDrugImports } from './useDrugImports';
import { XMarkIcon, PlusIcon, CalendarIcon } from '@heroicons/react/24/outline';

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 28px;
  margin: 0 auto;
  max-width: 1000px;
  width: 100%;
`;

const FormRow = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 20px;
  
  @media (min-width: 768px) {
    grid-template-columns: 1fr 1fr;
  }
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const Label = styled.label`
  font-size: 14px;
  font-weight: 600;
  color: #1f2937;
  display: flex;
  align-items: center;
  gap: 4px;
  
  &::after {
    content: ${props => props.required ? '"*"' : '""'};
    color: #ef4444;
    margin-left: 2px;
  }
`;

const Input = styled.input`
  padding: 12px 16px;
  border: 1.5px solid #e5e7eb;
  border-radius: 8px;
  font-size: 14px;
  transition: all 0.2s;
  background-color: #ffffff;
  color: #1f2937;

  &:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.1);
    background-color: #f8fafc;
  }

  &:hover:not(:focus) {
    border-color: #d1d5db;
  }
`;

const Select = styled.select`
  padding: 12px 16px;
  border: 1.5px solid #e5e7eb;
  border-radius: 8px;
  font-size: 14px;
  background-color: #ffffff;
  color: #1f2937;
  transition: all 0.2s;
  cursor: pointer;

  &:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.1);
    background-color: #f8fafc;
  }

  &:hover:not(:focus) {
    border-color: #d1d5db;
  }
`;

const SectionHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
`;

const SectionTitle = styled.h3`
  font-size: 16px;
  font-weight: 600;
  color: #1f2937;
  margin: 0;
`;

const AddButton = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 10px 20px;
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 0 2px 4px rgba(59, 130, 246, 0.2);

  &:hover {
    background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
    box-shadow: 0 4px 8px rgba(59, 130, 246, 0.3);
    transform: translateY(-1px);
  }

  &:active {
    transform: translateY(0);
  }

  svg {
    width: 18px;
    height: 18px;
  }
`;

const ChiTietTable = styled.div`
  border: 1.5px solid #e5e7eb;
  border-radius: 12px;
  overflow: hidden;
  background: white;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
`;

const TableHeader = styled.div`
  display: grid;
  grid-template-columns: 2.5fr 1fr 1.2fr 1.2fr 1.2fr 0.6fr;
  gap: 16px;
  padding: 16px 20px;
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
  font-weight: 600;
  font-size: 13px;
  color: #475569;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  border-bottom: 2px solid #e2e8f0;
`;

const TableRow = styled.div`
  display: grid;
  grid-template-columns: 2.5fr 1fr 1.2fr 1.2fr 1.2fr 0.6fr;
  gap: 16px;
  padding: 16px 20px;
  border-bottom: 1px solid #f1f5f9;
  align-items: center;
  transition: all 0.2s;
  background: white;

  &:last-child {
    border-bottom: none;
  }

  &:hover {
    background-color: #f8fafc;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.02);
  }
`;

const TableCell = styled.div`
  display: flex;
  align-items: center;
`;

const RemoveButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: 8px;
  background-color: #fee2e2;
  color: #dc2626;
  border: none;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background-color: #fecaca;
    transform: scale(1.05);
  }

  &:active {
    transform: scale(0.95);
  }

  svg {
    width: 18px;
    height: 18px;
  }
`;

const TotalRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%);
  border-top: 2px solid #bfdbfe;
  font-weight: 700;
  font-size: 18px;
  color: #1e40af;
`;

const EmptyState = styled.div`
  padding: 60px 40px;
  text-align: center;
  border: 2px dashed #cbd5e1;
  border-radius: 12px;
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
`;

const EmptyStateIcon = styled.div`
  width: 64px;
  height: 64px;
  margin: 0 auto 16px;
  border-radius: 50%;
  background: linear-gradient(135deg, #e0e7ff 0%, #c7d2fe 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #6366f1;
  
  svg {
    width: 32px;
    height: 32px;
  }
`;

const EmptyStateText = styled.p`
  font-size: 15px;
  color: #64748b;
  font-weight: 500;
  margin: 0;
`;

const ErrorText = styled.span`
  font-size: 13px;
  color: #ef4444;
  margin-top: 4px;
  display: flex;
  align-items: center;
  gap: 4px;
`;

const DateInputWrapper = styled.div`
  position: relative;
  
  svg {
    position: absolute;
    right: 14px;
    top: 50%;
    transform: translateY(-50%);
    width: 20px;
    height: 20px;
    color: #6b7280;
    pointer-events: none;
  }
  
  input[type="date"] {
    padding-right: 44px;
    
    &::-webkit-calendar-picker-indicator {
      opacity: 0;
      cursor: pointer;
      width: 100%;
      height: 100%;
      position: absolute;
      right: 0;
    }
  }
`;

const ActionButtons = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 12px;
  padding-top: 24px;
  border-top: 1.5px solid #e5e7eb;
  margin-top: 8px;
`;

const MoneyText = styled.span`
  font-weight: 600;
  color: #059669;
  font-size: 15px;
`;

const CreateDrugImportForm = ({ onCloseModal }) => {
  const { register, handleSubmit, formState } = useForm({
    defaultValues: {
      NgayNhap: new Date().toISOString().split('T')[0],
      chi_tiet: [],
    },
  });
  const { errors } = formState;
  const [chiTiet, setChiTiet] = useState([]);
  const { createImport, isCreating } = useDrugImports();

  const { data: drugsData } = useQuery({
    queryKey: ['drugs-list'],
    queryFn: () => getDrugs(1, 1000),
  });
  const drugs = Array.isArray(drugsData) ? drugsData : (drugsData?.data || []);

  const addChiTiet = () => {
    setChiTiet([
      ...chiTiet,
      {
        idThuoc: '',
        SoLuongNhap: 1,
        DonGiaNhap: 0,
        HanSuDung: '',
      },
    ]);
  };

  const removeChiTiet = (index) => {
    setChiTiet(chiTiet.filter((_, i) => i !== index));
  };

  const updateChiTiet = (index, field, value) => {
    const updated = [...chiTiet];
    updated[index] = { ...updated[index], [field]: value };
    
    // Nếu chọn thuốc, tự động điền đơn giá nhập từ thuốc
    if (field === 'idThuoc') {
      const selectedDrug = drugs.find((d) => d.idThuoc === parseInt(value));
      if (selectedDrug && selectedDrug.donGiaNhap) {
        updated[index].DonGiaNhap = selectedDrug.donGiaNhap;
      }
    }
    
    setChiTiet(updated);
  };

  const calculateTotal = () => {
    return chiTiet.reduce((sum, item) => {
      return sum + (parseFloat(item.DonGiaNhap) || 0) * (parseInt(item.SoLuongNhap) || 0);
    }, 0);
  };

  function onSubmit(data) {
    if (chiTiet.length === 0) {
      toast.error('Vui lòng thêm ít nhất một thuốc vào phiếu nhập');
      return;
    }

    // Validate chi tiết
    for (let i = 0; i < chiTiet.length; i++) {
      const item = chiTiet[i];
      if (!item.idThuoc) {
        toast.error(`Vui lòng chọn thuốc cho dòng ${i + 1}`);
        return;
      }
      if (!item.SoLuongNhap || item.SoLuongNhap <= 0) {
        toast.error(`Số lượng nhập không hợp lệ cho dòng ${i + 1}`);
        return;
      }
      if (!item.DonGiaNhap || item.DonGiaNhap <= 0) {
        toast.error(`Đơn giá nhập không hợp lệ cho dòng ${i + 1}`);
        return;
      }
    }

    const formData = {
      NgayNhap: data.NgayNhap,
      chi_tiet: chiTiet.map((item) => ({
        ID_Thuoc: parseInt(item.idThuoc),
        SoLuongNhap: parseInt(item.SoLuongNhap),
        DonGiaNhap: parseFloat(item.DonGiaNhap),
        HanSuDung: item.HanSuDung || null,
      })),
    };

    createImport(formData, {
      onSuccess: () => {
        if (onCloseModal) onCloseModal();
      },
    });
  }

  return (
    <div style={{ padding: '8px' }}>
      <div className='w-full pb-6 mb-6 border-b-2 border-grey-200'>
        <h2 className='text-2xl font-bold text-grey-900' style={{ margin: 0 }}>
          Phiếu nhập thuốc
        </h2>
        <p className='text-sm text-grey-500 mt-1' style={{ margin: 0 }}>
          Tạo phiếu nhập thuốc mới vào kho
        </p>
      </div>
      
      <Form onSubmit={handleSubmit(onSubmit)}>
        <FormRow>
          <FormGroup>
            <Label required>Ngày nhập</Label>
            <DateInputWrapper>
              <Input
                type='date'
                {...register('NgayNhap', { required: 'Vui lòng chọn ngày nhập' })}
              />
              <CalendarIcon />
            </DateInputWrapper>
            {errors.NgayNhap && (
              <ErrorText>{errors.NgayNhap.message}</ErrorText>
            )}
          </FormGroup>
        </FormRow>

        <FormGroup>
          <SectionHeader>
            <SectionTitle>Chi tiết nhập thuốc</SectionTitle>
            <AddButton type='button' onClick={addChiTiet}>
              <PlusIcon />
              Thêm thuốc
            </AddButton>
          </SectionHeader>

          {chiTiet.length > 0 ? (
            <ChiTietTable>
              <TableHeader>
                <div>Tên thuốc</div>
                <div>Số lượng</div>
                <div>Đơn giá (đ)</div>
                <div>Hạn sử dụng</div>
                <div>Thành tiền (đ)</div>
                <div></div>
              </TableHeader>
              {chiTiet.map((item, index) => (
                <TableRow key={index}>
                  <TableCell>
                    <Select
                      value={item.idThuoc}
                      onChange={(e) => updateChiTiet(index, 'idThuoc', e.target.value)}
                      style={{ width: '100%' }}
                    >
                      <option value=''>-- Chọn thuốc --</option>
                      {drugs.map((drug) => (
                        <option key={drug.idThuoc} value={drug.idThuoc}>
                          {drug.tenThuoc}
                        </option>
                      ))}
                    </Select>
                  </TableCell>
                  <TableCell>
                    <Input
                      type='number'
                      min='1'
                      value={item.SoLuongNhap}
                      onChange={(e) =>
                        updateChiTiet(index, 'SoLuongNhap', e.target.value)
                      }
                      placeholder='0'
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      type='number'
                      min='0'
                      step='1000'
                      value={item.DonGiaNhap}
                      onChange={(e) =>
                        updateChiTiet(index, 'DonGiaNhap', e.target.value)
                      }
                      placeholder='0'
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      type='date'
                      value={item.HanSuDung}
                      onChange={(e) =>
                        updateChiTiet(index, 'HanSuDung', e.target.value)
                      }
                    />
                  </TableCell>
                  <TableCell>
                    <MoneyText>
                      {(
                        (parseFloat(item.DonGiaNhap) || 0) *
                        (parseInt(item.SoLuongNhap) || 0)
                      ).toLocaleString('vi-VN')} đ
                    </MoneyText>
                  </TableCell>
                  <TableCell>
                    <RemoveButton
                      type='button'
                      onClick={() => removeChiTiet(index)}
                      title='Xóa dòng này'
                    >
                      <XMarkIcon />
                    </RemoveButton>
                  </TableCell>
                </TableRow>
              ))}
              <TotalRow>
                <span>Tổng tiền nhập:</span>
                <span>
                  {calculateTotal().toLocaleString('vi-VN')} đ
                </span>
              </TotalRow>
            </ChiTietTable>
          ) : (
            <EmptyState>
              <EmptyStateIcon>
                <PlusIcon />
              </EmptyStateIcon>
              <EmptyStateText>
                Chưa có thuốc nào trong phiếu nhập
              </EmptyStateText>
              <EmptyStateText style={{ fontSize: '13px', marginTop: '8px', color: '#94a3b8' }}>
                Nhấn nút "Thêm thuốc" để bắt đầu
              </EmptyStateText>
            </EmptyState>
          )}
        </FormGroup>

        <ActionButtons>
          <Button
            className='bg-white text-grey-700 border border-grey-300 px-6 py-3 font-medium hover:bg-grey-50'
            onClick={() => {
              if (onCloseModal) onCloseModal();
            }}
            type='button'
          >
            Hủy
          </Button>
          <Button
            className='text-white bg-primary px-6 py-3 font-semibold shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed'
            type='submit'
            isLoading={isCreating}
            disabled={chiTiet.length === 0}
          >
            {isCreating ? 'Đang tạo...' : 'Tạo phiếu nhập'}
          </Button>
        </ActionButtons>
      </Form>
    </div>
  );
};

export default CreateDrugImportForm;
