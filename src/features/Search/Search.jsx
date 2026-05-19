import { MagnifyingGlassIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { useState, useEffect, useRef } from 'react';

const Search = ({ onSearch, debounceMs = 500 }) => {
  const [value, setValue] = useState("");
  const debounceTimerRef = useRef(null);

  // Debounce search khi user gõ
  useEffect(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(() => {
      if (onSearch) {
        onSearch(value.trim());
      }
    }, debounceMs);

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [value, onSearch, debounceMs]);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
      if (onSearch) {
        onSearch(value.trim());
      }
    }
  };

  const handleReset = () => {
    setValue("");
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    if (onSearch) onSearch("");
  };

  return (
    <div className="relative w-[320px] flex items-center">
      <MagnifyingGlassIcon
        className="absolute z-10 w-4 h-4 -translate-y-1/2 left-3 top-1/2 transition-colors duration-150"
        style={{ color: 'var(--text-muted)' }}
      />
      <input
        className="w-full h-9 pl-9 pr-9 py-1.5 rounded-lg border outline-none transition-all text-sm font-normal"
        style={{
          backgroundColor: 'var(--bg-input)',
          borderColor: 'var(--border-color)',
          color: 'var(--text-primary)',
          boxShadow: 'var(--shadow-sm)',
        }}
        name="search"
        type="text"
        placeholder="Tìm kiếm..."
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
        autoComplete="off"
      />
      {value !== "" && (
        <button
          tabIndex={-1}
          type="button"
          onClick={handleReset}
          className="absolute -translate-y-1/2 right-2 top-1/2 focus:outline-none transition-colors"
          style={{ color: 'var(--text-muted)' }}
        >
          <XMarkIcon className='w-4 h-4' />
        </button>
      )}
    </div>
  );
};

export default Search;
