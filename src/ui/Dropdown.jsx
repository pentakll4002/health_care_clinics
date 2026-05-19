import { useState } from 'react';
import { ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/24/outline';
import { NavLink, useLocation } from 'react-router-dom';

const Dropdown = ({ icon: Icon, label, items = [] }) => {
  const [open, setOpen] = useState(false);
  const { pathname } = useLocation();

  const toggle = () => setOpen(!open);

  return (
    <div className='w-full mx-1'>
      <div
        onClick={toggle}
        className='flex items-center justify-between w-full px-3 py-2.5 transition-all rounded-lg cursor-pointer select-none duration-200'
        style={{
          backgroundColor: open ? 'var(--accent-light)' : 'transparent',
          color: open ? 'var(--accent)' : 'var(--text-secondary)',
        }}
        onMouseEnter={(e) => {
          if (!open) e.currentTarget.style.backgroundColor = 'var(--bg-hover)';
        }}
        onMouseLeave={(e) => {
          if (!open) e.currentTarget.style.backgroundColor = 'transparent';
        }}
      >
        <div className='flex items-center gap-2 text-sm font-medium'>
          {Icon && <Icon className='w-[18px] h-[18px]' style={{ color: 'var(--accent)' }} />}
          <span>{label}</span>
        </div>
        {open ? (
          <ChevronUpIcon className='w-4 h-4' style={{ color: 'var(--text-muted)' }} />
        ) : (
          <ChevronDownIcon className='w-4 h-4' style={{ color: 'var(--text-muted)' }} />
        )}
      </div>

      {open && (
        <div
          className='flex flex-col mt-1 ml-6 space-y-1 border-l pl-3'
          style={{ borderColor: 'var(--border-color)' }}
        >
          {items.map((item) => {
            const isActive = pathname === item.to;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                className='relative flex items-center gap-2 py-1.5 text-sm transition-colors duration-150'
                style={{
                  color: isActive ? 'var(--accent)' : 'var(--text-muted)',
                  fontWeight: isActive ? 500 : 400,
                }}
              >
                <span
                  className='absolute left-[-15px] h-1.5 w-1.5 rounded-full'
                  style={{ backgroundColor: isActive ? 'var(--accent)' : 'var(--border-color)' }}
                />
                {item.label}
              </NavLink>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Dropdown;
