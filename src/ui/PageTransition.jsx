import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import Spinner from './Spinner';

const PageTransition = ({ children }) => {
  const location = useLocation();
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [displayLocation, setDisplayLocation] = useState(location);

  useEffect(() => {
    if (location.pathname !== displayLocation.pathname || location.search !== displayLocation.search) {
      setIsTransitioning(true);

      const timer = setTimeout(() => {
        setDisplayLocation(location);
        setIsTransitioning(false);
      }, 350);

      return () => clearTimeout(timer);
    }
  }, [location, displayLocation]);

  if (isTransitioning) {
    return (
      <div
        className='w-full h-full flex flex-col items-center justify-center'
        style={{ backgroundColor: 'var(--bg-secondary)' }}
      >
        <Spinner />
        <p
          className='mt-3 text-sm font-medium'
          style={{ color: 'var(--text-muted)', animation: 'pulse-soft 1.5s ease-in-out infinite' }}
        >
          Đang tải dữ liệu...
        </p>
      </div>
    );
  }

  return (
    <div className='w-full h-full animate-fade-in'>
      {children}
    </div>
  );
};

export default PageTransition;
