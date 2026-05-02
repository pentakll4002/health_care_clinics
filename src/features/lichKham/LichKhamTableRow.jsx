import styled from 'styled-components';
import Table from '../../ui/Table';
import ModalCenter from '../../ui/ModalCenter';
import Menus from '../../ui/Menus';
import { useConfirmLichKham } from './useConfirmLichKham';
import { useDeleteLichKham } from './useDeleteLichKham';
import { useUpdateLichKham } from './useUpdateLichKham';
import { useCreateReceptionFromLichKham } from '../receptionList/useCreateReceptionFromLichKham';
import { useUser } from '../../hooks/useUser';
import EditLichKhamForm from './EditLichKhamForm';
import ConfirmDelete from '../../ui/ConfirmDelete';
import { CheckCircleIcon, NoSymbolIcon, PencilIcon, TrashIcon, UserPlusIcon } from '@heroicons/react/24/outline';
import Modal from '../../ui/Modal';
import Select from '../../ui/Select';
import { useQuery } from '@tanstack/react-query';
import axiosInstance from '../../utils/axiosInstance';
import { useState } from 'react';

const Text = styled.span`
  color: #0a1b39;
  font-size: 14px;
  font-weight: 500;
  margin: auto;
`;

const StatusBadge = styled.span`
  display: inline-block;
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
`;

function ConfirmLichKhamModal({
  lichKhamId,
  patientName,
  doctors,
  selectedDoctorId,
  setSelectedDoctorId,
  isConfirming,
  onCloseModal,
  onConfirm,
}) {
  return (
    <div>
      <h2 className='text-xl font-bold text-grey-900 mb-4'>Xác nhận lịch khám</h2>
      <p className='text-sm text-grey-600'>
        Lịch khám #{lichKhamId} - Bệnh nhân {patientName}
      </p>

      <div className='mt-4'>
        <label className='text-sm font-semibold text-grey-900'>Chọn bác sĩ</label>
        <div className='mt-2'>
          <Select value={selectedDoctorId} onChange={(e) => setSelectedDoctorId(e.target.value)}>
            <option value=''>-- Chọn bác sĩ --</option>
            {doctors.map((d) => {
              const id = d.idNhanVien || d.ID_NhanVien;
              const name = d.hoTenNV || d.HoTenNV;
              return (
                <option key={id} value={id}>
                  {name}
                </option>
              );
            })}
          </Select>
        </div>
      </div>

      <div className='flex justify-end gap-2 mt-6'>
        <button
          type='button'
          className='px-3 py-2 text-sm font-semibold border rounded-md border-grey-transparent'
          onClick={onCloseModal}
        >
          Huỷ
        </button>
        <button
          type='button'
          disabled={!selectedDoctorId || isConfirming}
          className='px-3 py-2 text-sm font-semibold text-white rounded-md bg-primary disabled:opacity-60'
          onClick={() => onConfirm(onCloseModal)}
        >
          Xác nhận
        </button>
      </div>
    </div>
  );
}

const LichKhamTableRow = ({ lichKham }) => {
  const { mutate: confirmLichKham, isLoading: isConfirming } = useConfirmLichKham();
  const { mutate: deleteLichKham, isLoading: isDeleting } = useDeleteLichKham();
  const { mutate: updateLichKham, isLoading: isUpdating } = useUpdateLichKham();
  const { mutate: createReception, isLoading: isCreatingReception } = useCreateReceptionFromLichKham();
  const { nhanVien } = useUser();

  // Support both camelCase (DTO) and PascalCase (legacy) field names
  const lkId = lichKham.idLichKham || lichKham.ID_LichKham;
  const lkNgayKham = lichKham.ngayKhamDuKien || lichKham.NgayKhamDuKien;
  const lkCaKham = lichKham.caKham || lichKham.CaKham;
  const lkTrangThai = lichKham.trangThai || lichKham.TrangThai;
  const lkGhiChu = lichKham.ghiChu || lichKham.GhiChu;
  const lkIdBenhNhan = lichKham.idBenhNhan || lichKham.ID_BenhNhan;
  const lkIdBacSi = lichKham.idBacSi || lichKham.ID_BacSi;
  const lkTenBenhNhan = lichKham.tenBenhNhan || lichKham.benhNhan?.HoTenBN || lichKham.benh_nhan?.HoTenBN;
  const lkTenBacSi = lichKham.tenBacSi;

  const [selectedDoctorId, setSelectedDoctorId] = useState(lkIdBacSi || '');

  const { data: doctorsRes } = useQuery({
    queryKey: ['doctors-for-confirm'],
    queryFn: async () => {
      const res = await axiosInstance.get('/nhanvien', {
        params: {
          ma_nhom: 'DOCTOR',
        },
      });
      return res.data;
    },
  });

  // API returns List<NhanVienDTO> directly (no wrapper), so doctorsRes is the array
  const doctors = Array.isArray(doctorsRes) ? doctorsRes : (doctorsRes?.data || []);

  const getStatusBadge = (trangThai) => {
    switch (trangThai) {
      case 'ChoXacNhan':
        return (
          <StatusBadge className='bg-warning-100 text-warning-900'>
            Chờ xác nhận
          </StatusBadge>
        );
      case 'DaXacNhan':
        return (
          <StatusBadge className='bg-success-100 text-success-900'>
            Đã xác nhận
          </StatusBadge>
        );
      case 'Huy':
        return (
          <StatusBadge className='bg-error-100 text-error-900'>
            Đã hủy
          </StatusBadge>
        );
      default:
        return <StatusBadge className='bg-grey-100 text-grey-700'>{trangThai || '—'}</StatusBadge>;
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '—';
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const handleConfirm = (onCloseModal) => {
    confirmLichKham(
      { id: lkId, ID_BacSi: selectedDoctorId ? Number(selectedDoctorId) : null },
      {
        onSuccess: () => {
          if (onCloseModal) onCloseModal();
        },
      }
    );
  };

  const handleDelete = () => {
    deleteLichKham(lkId);
  };

  const handleReject = () => {
    if (
      window.confirm(
        `Không xác nhận (từ chối) lịch khám #${lkId} của bệnh nhân ${lkTenBenhNhan || 'N/A'}?`
      )
    ) {
      updateLichKham({
        id: lkId,
        data: {
          trangThai: 'Huy',
        },
      });
    }
  };

  const handleCreateReception = () => {
    const nvId = nhanVien?.idNhanVien || nhanVien?.ID_NhanVien;
    if (!nvId) {
      alert('Không tìm thấy thông tin nhân viên. Vui lòng đăng nhập lại.');
      return;
    }

    if (window.confirm(`Tiếp nhận bệnh nhân ${lkTenBenhNhan || 'N/A'} từ lịch khám #${lkId}?`)) {
      createReception({
        ID_LichKham: lkId,
        ID_NhanVien: nvId,
      });
    }
  };

  // Hiển thị tên bệnh nhân
  const patientName = lkTenBenhNhan || (lkIdBenhNhan ? 'Bệnh nhân #' + lkIdBenhNhan : '—');

  return (
    <Table.Row>
      <Text className='text-center'>#{lkId}</Text>
      <Text className='text-center'>{patientName}</Text>
      <Text className='text-center'>{formatDate(lkNgayKham)}</Text>
      <Text className='text-center'>{lkCaKham}</Text>
      <div className='flex justify-center'>{getStatusBadge(lkTrangThai)}</div>
      <Text className='text-center'>{lkGhiChu || '—'}</Text>
      
      {/* Cột thao tác - ẨN NỘI DUNG NẾU ROLE LÀ BÁC SĨ */}
      <div className='flex items-center justify-center'>
        {window.localStorage.getItem('user_role') !== '@doctors' && (
          <ModalCenter>
            <Menus>
              <Menus.Menu>
                <Menus.Toggle id={`lich-kham-${lkId}`} />
                
                <Menus.List id={`lich-kham-${lkId}`}>
                  {/* Edit button */}
                  <ModalCenter.Open opens={`edit-${lkId}`}>
                    <Menus.Button icon={<PencilIcon className='w-4 h-4' />}>
                      Sửa
                    </Menus.Button>
                  </ModalCenter.Open>

                  {/* Confirm button - chỉ hiển thị khi chờ xác nhận */}
                  {lkTrangThai === 'ChoXacNhan' && (
                    <Modal>
                      <Modal.Open opens={`confirm-${lkId}`}>
                        <Menus.Button
                          icon={<CheckCircleIcon className='w-4 h-4' />}
                          disabled={isConfirming || isUpdating || isDeleting}
                        >
                          {isConfirming ? 'Đang xử lý...' : 'Xác nhận'}
                        </Menus.Button>
                      </Modal.Open>

                      <Modal.Window name={`confirm-${lkId}`}>
                        <ConfirmLichKhamModal
                          lichKhamId={lkId}
                          patientName={patientName}
                          doctors={doctors}
                          selectedDoctorId={selectedDoctorId}
                          setSelectedDoctorId={setSelectedDoctorId}
                          isConfirming={isConfirming}
                          onConfirm={handleConfirm}
                        />
                      </Modal.Window>
                    </Modal>
                  )}

                  {/* Reject button - chỉ hiển thị khi chờ xác nhận */}
                  {lkTrangThai === 'ChoXacNhan' && (
                    <Menus.Button
                      icon={<NoSymbolIcon className='w-4 h-4' />}
                      onClick={handleReject}
                      disabled={isConfirming || isUpdating || isDeleting}
                    >
                      {isUpdating ? 'Đang xử lý...' : 'Không xác nhận'}
                    </Menus.Button>
                  )}

                  {/* Tiếp nhận button - ẨN vì đã tự động tạo khi xác nhận lịch khám */}
                  {/* Khi lễ tân xác nhận lịch khám, hệ thống TỰ ĐỘNG tạo record trong danh sách tiếp nhận */}
                  {/* Chỉ hiển thị nếu cần tiếp nhận lại (trường hợp đặc biệt) */}
                  {false && lkTrangThai === 'DaXacNhan' && (
                    <Menus.Button
                      icon={<UserPlusIcon className='w-4 h-4' />}
                      onClick={handleCreateReception}
                    >
                      {isCreatingReception ? 'Đang tiếp nhận...' : 'Tiếp nhận lại'}
                    </Menus.Button>
                  )}

                  {/* Delete button */}
                  <ModalCenter.Open opens={`delete-${lkId}`}>
                    <Menus.Button icon={<TrashIcon className='w-4 h-4' />}>
                      Xóa
                    </Menus.Button>
                  </ModalCenter.Open>
                </Menus.List>

                {/* Edit Modal */}
                <ModalCenter.Window name={`edit-${lkId}`}>
                  <EditLichKhamForm 
                    lichKham={lichKham} 
                    onCloseModal={() => {}}
                  />
                </ModalCenter.Window>

                {/* Delete Confirmation Modal */}
                <ModalCenter.Window name={`delete-${lkId}`}>
                  <ConfirmDelete
                    resourceName={`lịch khám #${lkId}`}
                    disabled={isDeleting}
                    onConfirm={handleDelete}
                    onCloseModal={() => {}}
                  />
                </ModalCenter.Window>
              </Menus.Menu>
            </Menus>
          </ModalCenter>
        )}
      </div>
    </Table.Row>
  );
}

export default LichKhamTableRow;