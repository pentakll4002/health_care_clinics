import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import Spinner from './Spinner';

const PageTransition = ({ children }) => {
  const location = useLocation();
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [displayLocation, setDisplayLocation] = useState(location);

  useEffect(() => {
    // When the location changes, we start a transition.
    if (location.pathname !== displayLocation.pathname || location.search !== displayLocation.search) {
      setIsTransitioning(true);

      // Keep showing the spinner for 300ms to make the transition feel smooth
      const timer = setTimeout(() => {
        setDisplayLocation(location);
        setIsTransitioning(false);
      }, 400)

      return () => clearTimeout(timer);
    }
  }, [location, displayLocation]);

  if (isTransitioning) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center bg-white">
        <Spinner />
        <p className="mt-4 text-sm text-grey-500 font-medium animate-pulse">Đang tải dữ liệu...</p>
      </div>
    );
  }

  // A simple fade-in wrapper for the newly loaded page
  return (
    <div
      className="w-full h-full"
      style={{
        animation: 'fadeIn 0.3s ease-in-out',
      }}
    >
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(5px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
      {children}
    </div>
  );
};

export default PageTransition;
