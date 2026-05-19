import useDarkMode from '../hooks/useDarkMode';
import classNames from '../utils/classNames';
import { SunIcon, MoonIcon } from '@heroicons/react/24/outline';

const ButtonToggle = () => {
  const { isDark, toggle } = useDarkMode();

  return (
    <button
      className={classNames(
        'relative inline-flex items-center h-7 rounded-full w-14 transition-colors duration-300 focus:outline-none',
        isDark ? 'bg-grey-700' : 'bg-grey-200'
      )}
      onClick={toggle}
      aria-label="Toggle dark mode"
    >
      <span
        className={classNames(
          'flex items-center justify-center w-5 h-5 rounded-full transform transition-all duration-300 shadow-sm',
          isDark
            ? 'translate-x-8 bg-grey-900'
            : 'translate-x-1 bg-white'
        )}
      >
        {isDark ? (
          <MoonIcon className="w-3 h-3 text-white" />
        ) : (
          <SunIcon className="w-3 h-3 text-warning" />
        )}
      </span>
    </button>
  );
};

export default ButtonToggle;
