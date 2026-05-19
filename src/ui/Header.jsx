import User from './User';
import { Link } from 'react-router-dom';
import NotificationBell from './NotificationBell';
import { useUser } from '../hooks/useUser';
import { useRolePermissions } from '../hooks/useRolePermissions';

import {
  CalendarIcon,
  Cog6ToothIcon,
  MagnifyingGlassIcon,
} from '@heroicons/react/24/outline';


const Header = () => {
  const { user } = useUser();
  const { roleCode } = useRolePermissions();

  const roleLabels = {
    admin: 'Quản trị viên',
    doctors: 'Bác sĩ',
    receptionists: 'Lễ tân',
    managers: 'Quản lý',
    patient: 'Bệnh nhân',
  };

  return (
    <header
      className='flex w-full h-[56px] px-6 items-center justify-between border-b transition-colors duration-300'
      style={{
        backgroundColor: 'var(--bg-header)',
        borderColor: 'var(--border-color)',
      }}
    >
      {/* Left side - Greeting */}
      <div className='flex items-center gap-3'>
        <div>
          <p
            className='text-sm font-semibold leading-tight'
            style={{ color: 'var(--text-primary)' }}
          >
            Xin chào, {user?.name || 'User'}
          </p>
          <p
            className='text-xs'
            style={{ color: 'var(--text-muted)' }}
          >
            {roleLabels[roleCode] || 'Đang tải...'}
          </p>
        </div>
      </div>

      {/* Right side - Actions */}
      <div className='flex items-center gap-3'>
        <Link
          to='/'
          className='p-2 rounded-lg transition-colors duration-200'
          style={{
            backgroundColor: 'var(--bg-secondary)',
            color: 'var(--text-secondary)',
          }}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-hover)'}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-secondary)'}
        >
          <CalendarIcon className='w-5 h-5' />
        </Link>

        <Link
          to='/'
          className='p-2 rounded-lg transition-colors duration-200'
          style={{
            backgroundColor: 'var(--bg-secondary)',
            color: 'var(--text-secondary)',
          }}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-hover)'}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-secondary)'}
        >
          <Cog6ToothIcon className='w-5 h-5' />
        </Link>

        <NotificationBell />

        <div
          className='w-px h-6 mx-1'
          style={{ backgroundColor: 'var(--border-color)' }}
        />

        <User />
      </div>
    </header>
  );
};

export default Header;
