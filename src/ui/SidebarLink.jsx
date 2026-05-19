import { NavLink } from 'react-router-dom';

const SidebarLink = ({ to, icon: Icon, label }) => {
  return (
    <NavLink to={to}>
      {({ isActive }) => (
        <div
          className='flex items-center gap-3 px-3 py-2 rounded-lg mx-1 text-sm font-medium transition-all duration-200 cursor-pointer'
          style={{
            backgroundColor: isActive ? 'var(--accent-light)' : 'transparent',
            color: isActive ? 'var(--accent)' : 'var(--text-secondary)',
            borderLeft: isActive ? '3px solid var(--accent)' : '3px solid transparent',
          }}
          onMouseEnter={(e) => {
            if (!isActive) {
              e.currentTarget.style.backgroundColor = 'var(--bg-hover)';
              e.currentTarget.style.color = 'var(--text-primary)';
            }
          }}
          onMouseLeave={(e) => {
            if (!isActive) {
              e.currentTarget.style.backgroundColor = 'transparent';
              e.currentTarget.style.color = 'var(--text-secondary)';
            }
          }}
        >
          {Icon && (
            <Icon
              className='w-[18px] h-[18px] flex-shrink-0'
              style={{ color: isActive ? 'var(--accent)' : 'var(--text-muted)' }}
            />
          )}
          <span className='truncate'>{label}</span>
        </div>
      )}
    </NavLink>
  );
};

export default SidebarLink;
