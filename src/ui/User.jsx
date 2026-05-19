import { useState, useRef, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useUser } from '../hooks/useUser';
import axiosInstance from '../utils/axiosInstance.js';
import {
  ArrowRightOnRectangleIcon,
  UserCircleIcon,
  ChevronDownIcon,
} from '@heroicons/react/24/outline';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

function getAvatarUrl(user) {
  const raw = user?.benhNhan?.avatar || user?.nhanVien?.hinhAnh || user?.avatar;
  if (!raw) return null;
  if (raw.startsWith('http')) return raw;
  return `${API_BASE}${raw.startsWith('/') ? '' : '/'}${raw}`;
}

const User = () => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const navigate = useNavigate();
  const { user } = useUser();
  const dropdownRef = useRef(null);
  const avatarUrl = getAvatarUrl(user);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    try {
      await axiosInstance.post('/logout');
    } catch (error) {
      // Silent
    } finally {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      navigate('/sign-in');
    }
  };

  return (
    <div className='relative' ref={dropdownRef}>
      <button
        className='flex items-center gap-2 px-2 py-1.5 rounded-lg transition-colors duration-200 cursor-pointer'
        style={{ color: 'var(--text-primary)' }}
        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-hover)'}
        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
      >
        <div className='relative'>
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt='avatar'
              className='rounded-full h-8 w-8 object-cover border-2'
              style={{ borderColor: 'var(--border-color)' }}
              onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }}
            />
          ) : null}
          <div
            className='rounded-full h-8 w-8 flex items-center justify-center text-xs font-bold text-white border-2'
            style={{
              borderColor: 'var(--border-color)',
              backgroundColor: 'var(--accent)',
              display: avatarUrl ? 'none' : 'flex',
            }}
          >
            {(user?.name || 'U').charAt(0).toUpperCase()}
          </div>
          <div className='absolute -bottom-0.5 -right-0.5 bg-white rounded-full p-[1.5px]'>
            <div className='w-2.5 h-2.5 rounded-full bg-success-900' />
          </div>
        </div>

        <span className='text-sm font-medium hidden lg:block' style={{ color: 'var(--text-primary)' }}>
          {user?.name || user?.benhNhan?.hoTenBN || 'User'}
        </span>

        <ChevronDownIcon
          className='w-3.5 h-3.5 transition-transform duration-200'
          style={{
            color: 'var(--text-muted)',
            transform: isDropdownOpen ? 'rotate(180deg)' : 'rotate(0)',
          }}
        />
      </button>

      {isDropdownOpen && (
        <div
          className='absolute right-0 top-full mt-2 w-52 rounded-xl border overflow-hidden z-50 animate-scale-in'
          style={{
            backgroundColor: 'var(--bg-card)',
            borderColor: 'var(--border-color)',
            boxShadow: 'var(--shadow-lg)',
          }}
        >
          <div className='px-4 py-3 border-b' style={{ borderColor: 'var(--border-light)' }}>
            <p className='text-sm font-semibold' style={{ color: 'var(--text-primary)' }}>
              {user?.name || 'User'}
            </p>
            <p className='text-xs' style={{ color: 'var(--text-muted)' }}>
              {user?.email || ''}
            </p>
          </div>

          <div className='py-1'>
            <Link
              to='/patients/profile'
              className='flex items-center gap-3 w-full px-4 py-2.5 text-sm transition-colors duration-150'
              style={{ color: 'var(--text-primary)' }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-hover)'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
              onClick={() => setIsDropdownOpen(false)}
            >
              <UserCircleIcon className='w-4 h-4' style={{ color: 'var(--text-muted)' }} />
              Hồ sơ cá nhân
            </Link>

            <button
              onClick={handleLogout}
              className='flex items-center gap-3 w-full px-4 py-2.5 text-sm transition-colors duration-150 text-error'
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-hover)'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
            >
              <ArrowRightOnRectangleIcon className='w-4 h-4' />
              Đăng xuất
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default User;
