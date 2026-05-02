import styled from 'styled-components';
import Table from '../../ui/Table';
import Menus from '../../ui/Menus';
import Modal from '../../ui/Modal';
import ConfirmDelete from '../../ui/ConfirmDelete';
import CreateDoctorForm from '../doctors/CreateDoctorForm';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { deleteDoctor, updateDoctor } from '../doctors/APIdoctors';
import { PencilIcon, TrashIcon } from '@heroicons/react/24/outline';

const EmployeeName = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;

  span:first-child {
    font-weight: 600;
    color: #111827;
  }

  span:last-child {
    font-size: 12px;
    color: #6b7280;
  }
`;

const Badge = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 2px 8px;
  border-radius: 999px;
  font-size: 12px;
  background-color: #eef2ff;
  color: #4f46e5;
  text-transform: lowercase;
`;

const ActionsCell = styled.div`
  display: flex;
  justify-content: flex-end;
`;

function EmployeeRow({ employee }) {
  // Support both camelCase (from DTO) and PascalCase (legacy) field names
  const empId = employee?.idNhanVien || employee?.ID_NhanVien;
  const empName = employee?.hoTenNV || employee?.HoTenNV;
  const empAddress = employee?.diaChi || employee?.DiaChi;
  const empPhone = employee?.dienThoai || employee?.DienThoai;
  const empEmail = employee?.email || employee?.Email;
  const empStatus = employee?.trangThai || employee?.TrangThai;
  const empGroupName = employee?.tenNhom || employee?.TenNhom;

  const queryClient = useQueryClient();

  const { mutateAsync: handleDelete, isLoading: isDeleting } = useMutation({
    mutationFn: () => deleteDoctor(empId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employees'] });
      queryClient.invalidateQueries({ queryKey: ['doctors'] });
    },
  });

  return (
    <Table.Row>
      <EmployeeName>
        <span>{empName}</span>
        <span>{empAddress}</span>
      </EmployeeName>

      <Badge>{empGroupName ?? 'Chưa gán nhóm'}</Badge>

      <span className='text-sm text-grey-600'>{empPhone || '—'}</span>
      <span className='text-sm text-grey-600 break-all'>{empEmail}</span>
      <span className='text-sm font-medium text-grey-700'>{empStatus ?? 'Đang làm việc'}</span>
      <ActionsCell>
        <Modal>
          <Menus>
            <Menus.Menu>
              <Menus.Toggle id={`emp-${empId}`} />
              <Menus.List id={`emp-${empId}`}>
                <Modal.Open opens='edit-employee'>
                  <Menus.Button icon={<PencilIcon className='w-4 h-4' />}>Chỉnh sửa</Menus.Button>
                </Modal.Open>
                <Modal.Open opens='delete-employee'>
                  <Menus.Button icon={<TrashIcon className='w-4 h-4' />}>Xoá</Menus.Button>
                </Modal.Open>
              </Menus.List>

              <Modal.Window name='edit-employee'>
                <CreateDoctorForm
                  doctor={employee}
                  title='Cập nhật nhân viên'
                  submitLabel='Lưu thay đổi'
                  onSuccess={() => {
                    queryClient.invalidateQueries({ queryKey: ['employees'] });
                    queryClient.invalidateQueries({ queryKey: ['doctors'] });
                  }}
                />
              </Modal.Window>

              <Modal.Window name='delete-employee'>
                <ConfirmDelete
                  resourceName='nhân viên'
                  disabled={isDeleting}
                  onConfirm={handleDelete}
                />
              </Modal.Window>
            </Menus.Menu>
          </Menus>
        </Modal>
      </ActionsCell>
    </Table.Row>
  );
}

export default EmployeeRow;
