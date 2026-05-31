import { useState, useRef, useEffect } from 'react';
import User from './User';
import { Link } from 'react-router-dom';
import NotificationBell from './NotificationBell';
import { useUser } from '../hooks/useUser';
import { useRolePermissions } from '../hooks/useRolePermissions';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';

import {
  CalendarIcon,
  Cog6ToothIcon,
  SunIcon,
  MoonIcon,
  BellSlashIcon,
  SpeakerWaveIcon,
  LanguageIcon,
} from '@heroicons/react/24/outline';

const Header = () => {
  const { user } = useUser();
  const { roleCode } = useRolePermissions();
  const { t, i18n } = useTranslation();

  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const calendarRef = useRef(null);
  const settingsRef = useRef(null);

  // Settings states
  const [darkMode, setDarkMode] = useState(() => document.documentElement.classList.contains('dark'));
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [lang, setLang] = useState(() => localStorage.getItem('app-lang') || 'vi');

  const changeLanguage = (newLang) => {
    setLang(newLang);
    localStorage.setItem('app-lang', newLang);
    i18n.changeLanguage(newLang);
    toast.success(newLang === 'vi' ? 'Đã đổi ngôn ngữ sang: Tiếng Việt' : 'Language changed to: English');
  };

  // Toggle Dark Mode
  const toggleDarkMode = () => {
    const next = !darkMode;
    setDarkMode(next);
    if (next) {
      document.documentElement.classList.add('dark');
      toast.success('Đã chuyển sang giao diện Tối');
    } else {
      document.documentElement.classList.remove('dark');
      toast.success('Đã chuyển sang giao diện Sáng');
    }
  };

  // Click outside behavior
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (calendarRef.current && !calendarRef.current.contains(event.target)) {
        setIsCalendarOpen(false);
      }
      if (settingsRef.current && !settingsRef.current.contains(event.target)) {
        setIsSettingsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const roleLabels = {
    admin: 'Quản trị viên',
    doctors: 'Bác sĩ',
    receptionists: 'Lễ tân',
    managers: 'Quản lý',
    patient: 'Bệnh nhân',
  };

  // Mock Calendar events
  const todayEvents = [
    { time: '09:00 - 10:00', title: 'Khám lâm sàng', desc: 'Nguyễn Văn Hải (Mã BN: 102)' },
    { time: '14:30 - 15:00', title: 'Hội chẩn chuyên khoa', desc: 'Trần Thị Thuỷ (Mã BN: 109)' },
    { time: '16:00 - 17:00', title: 'Nhập thuốc định kỳ', desc: 'Phiếu kiểm kho dược phẩm' },
  ];

  return (
    <header
      className='flex w-full h-[56px] px-6 items-center justify-between border-b transition-colors duration-300 z-30 relative'
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
            {t('welcome')}, {user?.name || 'User'}
          </p>
          <p
            className='text-xs'
            style={{ color: 'var(--text-muted)' }}
          >
            {t(roleCode) || roleLabels[roleCode] || 'Đang tải...'}
          </p>
        </div>
      </div>

      {/* Right side - Actions */}
      <div className='flex items-center gap-3'>
        
        {/* Calendar Dropdown */}
        <div className='relative' ref={calendarRef}>
          <button
            type='button'
            onClick={() => {
              setIsCalendarOpen(!isCalendarOpen);
              setIsSettingsOpen(false);
            }}
            className='p-2 rounded-lg transition-colors duration-200 cursor-pointer focus:outline-none'
            style={{
              backgroundColor: isCalendarOpen ? 'var(--bg-hover)' : 'var(--bg-secondary)',
              color: 'var(--text-secondary)',
            }}
            onMouseEnter={(e) => { if (!isCalendarOpen) e.currentTarget.style.backgroundColor = 'var(--bg-hover)'; }}
            onMouseLeave={(e) => { if (!isCalendarOpen) e.currentTarget.style.backgroundColor = 'var(--bg-secondary)'; }}
          >
            <CalendarIcon className='w-5 h-5' />
          </button>

          {isCalendarOpen && (
            <div
              className='absolute right-0 top-full mt-2 w-[340px] rounded-xl border overflow-hidden z-50 animate-scale-in p-4'
              style={{
                backgroundColor: 'var(--bg-card)',
                borderColor: 'var(--border-color)',
                boxShadow: 'var(--shadow-lg)',
              }}
            >
              <div className='flex items-center justify-between pb-3 border-b mb-3' style={{ borderColor: 'var(--border-light)' }}>
                <span className='text-sm font-bold text-gray-800 dark:text-gray-100'>{t('work_schedule_events')}</span>
                <span className='text-xs text-primary font-semibold px-2 py-0.5 bg-blue-50 dark:bg-blue-900/30 rounded-full'>{t('today')}</span>
              </div>
              
              {/* Mini Calendar Visualization */}
              <div className='bg-gray-50 dark:bg-gray-800/50 p-2.5 rounded-lg mb-3 border border-gray-100 dark:border-gray-800'>
                <div className='text-xs font-semibold text-center text-gray-500 mb-2'>Tháng {new Date().getMonth() + 1}, {new Date().getFullYear()}</div>
                <div className='grid grid-cols-7 gap-1 text-[11px] text-center font-medium text-gray-400'>
                  <div>T2</div><div>T3</div><div>T4</div><div>T5</div><div>T6</div><div>T7</div><div>CN</div>
                </div>
                <div className='grid grid-cols-7 gap-1 text-xs text-center mt-1 text-gray-700 dark:text-gray-200'>
                  <div className='text-gray-300 dark:text-gray-600'>28</div>
                  <div className='text-gray-300 dark:text-gray-600'>29</div>
                  <div className='text-gray-300 dark:text-gray-600'>30</div>
                  <div className='font-semibold bg-primary text-white rounded-full w-5 h-5 flex items-center justify-center mx-auto'>{new Date().getDate()}</div>
                  <div>2</div><div>3</div><div>4</div>
                </div>
              </div>

              {/* Event list */}
              <div className='space-y-2.5 max-h-[160px] overflow-y-auto pr-1'>
                {todayEvents.map((ev, i) => (
                  <div key={i} className='flex flex-col gap-0.5 p-2 rounded-md hover:bg-gray-50 dark:hover:bg-gray-800/40 border border-transparent hover:border-gray-100 dark:hover:border-gray-800 transition-all'>
                    <div className='flex items-center justify-between'>
                      <span className='text-[10px] font-bold text-primary bg-blue-50 dark:bg-blue-950 px-1.5 py-0.5 rounded'>{ev.time}</span>
                      <span className='text-[11px] font-semibold text-gray-800 dark:text-gray-200'>{ev.title}</span>
                    </div>
                    <span className='text-xs text-gray-500 dark:text-gray-400 ml-1 mt-0.5'>{ev.desc}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Settings Dropdown */}
        <div className='relative' ref={settingsRef}>
          <button
            type='button'
            onClick={() => {
              setIsSettingsOpen(!isSettingsOpen);
              setIsCalendarOpen(false);
            }}
            className='p-2 rounded-lg transition-colors duration-200 cursor-pointer focus:outline-none'
            style={{
              backgroundColor: isSettingsOpen ? 'var(--bg-hover)' : 'var(--bg-secondary)',
              color: 'var(--text-secondary)',
            }}
            onMouseEnter={(e) => { if (!isSettingsOpen) e.currentTarget.style.backgroundColor = 'var(--bg-hover)'; }}
            onMouseLeave={(e) => { if (!isSettingsOpen) e.currentTarget.style.backgroundColor = 'var(--bg-secondary)'; }}
          >
            <Cog6ToothIcon className='w-5 h-5' />
          </button>

          {isSettingsOpen && (
            <div
              className='absolute right-0 top-full mt-2 w-[280px] rounded-xl border overflow-hidden z-50 animate-scale-in p-4'
              style={{
                backgroundColor: 'var(--bg-card)',
                borderColor: 'var(--border-color)',
                boxShadow: 'var(--shadow-lg)',
              }}
            >
              <div className='pb-3 border-b mb-3' style={{ borderColor: 'var(--border-light)' }}>
                <span className='text-sm font-bold text-gray-800 dark:text-gray-100'>{t('system_config')}</span>
              </div>

              <div className='space-y-4 text-sm text-gray-700 dark:text-gray-300'>
                {/* Theme Mode Toggle */}
                <div className='flex items-center justify-between'>
                  <div className='flex items-center gap-2'>
                    {darkMode ? <MoonIcon className='w-4.5 h-4.5 text-indigo-400' /> : <SunIcon className='w-4.5 h-4.5 text-amber-500' />}
                    <span>{t('dark_mode')}</span>
                  </div>
                  <button
                    type='button'
                    onClick={toggleDarkMode}
                    className={`w-10 h-5.5 rounded-full p-0.5 transition-colors duration-200 focus:outline-none relative flex items-center ${darkMode ? 'bg-primary' : 'bg-gray-300'}`}
                  >
                    <div className={`w-4.5 h-4.5 rounded-full bg-white shadow-md transform transition-transform duration-200 ${darkMode ? 'translate-x-4.5' : 'translate-x-0'}`} />
                  </button>
                </div>

                {/* Sound Notification Toggle */}
                <div className='flex items-center justify-between'>
                  <div className='flex items-center gap-2'>
                    {soundEnabled ? <SpeakerWaveIcon className='w-4.5 h-4.5 text-green-500' /> : <BellSlashIcon className='w-4.5 h-4.5 text-gray-400' />}
                    <span>{t('sound_notification')}</span>
                  </div>
                  <button
                    type='button'
                    onClick={() => {
                      const next = !soundEnabled;
                      setSoundEnabled(next);
                      toast.success(next ? 'Đã bật âm báo' : 'Đã tắt âm báo');
                    }}
                    className={`w-10 h-5.5 rounded-full p-0.5 transition-colors duration-200 focus:outline-none relative flex items-center ${soundEnabled ? 'bg-primary' : 'bg-gray-300'}`}
                  >
                    <div className={`w-4.5 h-4.5 rounded-full bg-white shadow-md transform transition-transform duration-200 ${soundEnabled ? 'translate-x-4.5' : 'translate-x-0'}`} />
                  </button>
                </div>

                {/* Language Picker */}
                <div className='flex items-center justify-between'>
                  <div className='flex items-center gap-2'>
                    <LanguageIcon className='w-4.5 h-4.5 text-blue-500' />
                    <span>{t('language')}</span>
                  </div>
                  <select
                    value={lang}
                    onChange={(e) => changeLanguage(e.target.value)}
                    className='text-xs rounded border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 py-1 px-1.5 focus:outline-none'
                  >
                    <option value='vi'>Tiếng Việt</option>
                    <option value='en'>English</option>
                  </select>
                </div>

                {/* Direct links */}
                <div className='pt-2.5 border-t border-gray-100 dark:border-gray-800 flex flex-col gap-2'>
                  <Link
                    to='/patients/profile'
                    onClick={() => setIsSettingsOpen(false)}
                    className='text-xs text-primary hover:underline font-semibold'
                  >
                    {t('password_security')}
                  </Link>
                  <a
                    href='https://gentledune-2bc0bd7b.eastus2.azurecontainerapps.io'
                    target='_blank'
                    rel='noreferrer'
                    className='text-xs text-gray-400 hover:text-gray-500 dark:hover:text-gray-300'
                  >
                    {t('tech_support')}
                  </a>
                </div>
              </div>
            </div>
          )}
        </div>

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
