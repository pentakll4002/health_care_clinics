import { PlusIcon } from '@heroicons/react/24/outline';
import Modal from '../../ui/Modal';
import CreateDoctorForm from '../doctors/CreateDoctorForm';
import { useRolePermissions } from '../../hooks/useRolePermissions';

function AddEmployee() {
  const { canAccessRoute } = useRolePermissions();

  if (!canAccessRoute('employees')) return null;

  return (
    <Modal>
      <Modal.Open opens='employee-form'>
        <button className='py-[6px] px-[10px] bg-primary rounded-md flex items-center justify-center gap-x-2 text-white text-sm font-semibold'>
          <PlusIcon className='w-5 h-5' />
          <span>Thêm nhân viên</span>
        </button>
      </Modal.Open>

      <Modal.Window name='employee-form'>
        <CreateDoctorForm title='Thông tin nhân viên' submitLabel='Thêm nhân viên' />
      </Modal.Window>
    </Modal>
  );
}

export default AddEmployee;

