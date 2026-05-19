import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BellIcon } from '@heroicons/react/24/outline';
import { useBusinessNotifications } from '../hooks/useBusinessNotifications';

const NotificationBell = () => {
  const [open, setOpen] = useState(false);
  const containerRef = useRef(null);
  const navigate = useNavigate();

  const {
    notifications,
    unreadCount,
    isLoading,
    error,
    isRead,
    markRead,
    markAllRead,
    refresh,
  } = useBusinessNotifications({ refetchIntervalMs: 60000 });

  useEffect(() => {
    function handlePointerDown(event) {
      if (!open) return;
      if (!containerRef.current) return;
      if (!containerRef.current.contains(event.target)) {
        setOpen(false);
      }
    }

    window.addEventListener('pointerdown', handlePointerDown);
    return () => window.removeEventListener('pointerdown', handlePointerDown);
  }, [open]);

  function handleItemClick(item) {
    markRead(item.id);
    setOpen(false);
    if (item?.action?.to) {
      navigate(item.action.to);
    }
  }

  return (
    <div ref={containerRef} className='relative'>
      <button
        type='button'
        onClick={() => {
          const next = !open;
          setOpen(next);
          if (next) refresh();
        }}
        className='relative p-2 rounded-lg transition-colors duration-200'
        style={{
          backgroundColor: 'var(--bg-secondary)',
          color: 'var(--text-secondary)',
        }}
        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-hover)'}
        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-secondary)'}
      >
        <BellIcon className='w-5 h-5' />
        {unreadCount > 0 && (
          <span
            className='absolute top-1 right-1 w-2.5 h-2.5 rounded-full border-2'
            style={{
              backgroundColor: 'var(--error)',
              borderColor: 'var(--bg-header)',
            }}
          />
        )}
      </button>

      {open && (
        <div
          className='absolute right-0 top-full mt-2 w-[360px] rounded-xl border overflow-hidden z-20 animate-scale-in'
          style={{
            backgroundColor: 'var(--bg-card)',
            borderColor: 'var(--border-color)',
            boxShadow: 'var(--shadow-lg)',
          }}
        >
          <div
            className='flex items-center justify-between px-4 py-3 border-b'
            style={{ borderColor: 'var(--border-light)' }}
          >
            <div className='flex flex-col'>
              <span className='text-sm font-semibold' style={{ color: 'var(--text-primary)' }}>
                Thông báo
              </span>
              <span className='text-xs' style={{ color: 'var(--text-muted)' }}>
                Những việc cần xử lý
              </span>
            </div>
            <button
              type='button'
              className='text-xs font-semibold transition-colors'
              style={{ color: 'var(--accent)' }}
              onClick={markAllRead}
              disabled={unreadCount === 0}
            >
              Đã xem hết
            </button>
          </div>

          <div className='max-h-[360px] overflow-y-auto'>
            {isLoading ? (
              <div className='px-4 py-6 text-sm' style={{ color: 'var(--text-muted)' }}>
                Đang tải...
              </div>
            ) : error ? (
              <div className='px-4 py-6 text-sm' style={{ color: 'var(--error)' }}>
                Không thể tải thông báo.
              </div>
            ) : notifications.length === 0 ? (
              <div className='px-4 py-6 text-sm text-center' style={{ color: 'var(--text-muted)' }}>
                Không có việc cần xử lý.
              </div>
            ) : (
              notifications.map((item) => {
                const isUnread = !isRead(item.id);
                return (
                  <button
                    key={item.id}
                    type='button'
                    onClick={() => handleItemClick(item)}
                    className='w-full text-left px-4 py-3 border-b transition-colors duration-150'
                    style={{ borderColor: 'var(--border-light)' }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-hover)'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                  >
                    <div className='flex items-start gap-3'>
                      <div
                        className='mt-1.5 w-2 h-2 rounded-full flex-shrink-0'
                        style={{ backgroundColor: isUnread ? 'var(--accent)' : 'var(--border-color)' }}
                      />
                      <div className='flex flex-col gap-0.5'>
                        <div className='text-[10px] uppercase font-bold tracking-wider' style={{ color: 'var(--accent)' }}>
                          {item.title}
                        </div>
                        <div className='text-sm font-medium' style={{ color: 'var(--text-primary)' }}>
                          {item.message}
                        </div>
                        {item.createdAt ? (
                          <div className='text-xs' style={{ color: 'var(--text-muted)' }}>
                            {new Date(item.createdAt).toLocaleString()}
                          </div>
                        ) : null}
                      </div>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
