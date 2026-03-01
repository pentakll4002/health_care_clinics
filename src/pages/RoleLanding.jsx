import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Spinner from '../ui/Spinner';
import { useRolePermissions } from '../hooks/useRolePermissions';

const ROLE_DEFAULT_ROUTES = {
  admin: '/employees',
  doctors: '/doctor/queue',
  receptionists: '/reception',
  managers: '/reports',
  patient: '/patients/profile',
  // Tương thích ngược
};

function RoleLanding() {
  const { roleCode, isLoading } = useRolePermissions();
  const navigate = useNavigate();

  useEffect(() => {
    if (isLoading) return;

    const target = ROLE_DEFAULT_ROUTES[roleCode] ?? '/patients/profile';
    navigate(target, { replace: true });
  }, [roleCode, isLoading, navigate]);

  return (
    <div className='flex items-center justify-center w-full h-full py-10'>
      <Spinner />
    </div>
  );
}

export default RoleLanding;

