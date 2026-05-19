import { cloneElement, createContext, useContext, useState } from 'react';
import { createPortal } from 'react-dom';
import { XMarkIcon } from '@heroicons/react/24/outline';
import useClickOutSide from '../hooks/useClickOutSide';

const ModalContext = createContext();

function ModalCenter({ children }) {
  const [openName, setOpenName] = useState('');

  const close = () => setOpenName('');
  const open = (name) => setOpenName(name);

  return (
    <ModalContext.Provider value={{ openName, close, open }}>
      {children}
    </ModalContext.Provider>
  );
}

function Open({ children, opens: opensWindowName }) {
  const { open } = useContext(ModalContext);
  return cloneElement(children, { onClick: () => open(opensWindowName) });
}

function Window({ children, name }) {
  const { openName, close } = useContext(ModalContext);
  const ref = useClickOutSide(close);
  if (name !== openName) return null;

  return createPortal(
    <div
      className='fixed inset-0 z-[1000] flex items-center justify-center'
      style={{ backgroundColor: 'var(--bg-modal-overlay)', backdropFilter: 'blur(4px)' }}
    >
      <div
        ref={ref}
        className='relative max-h-[90vh] overflow-y-auto overflow-x-hidden rounded-xl animate-scale-in'
        style={{
          backgroundColor: 'var(--bg-card)',
          boxShadow: 'var(--shadow-lg)',
          padding: '32px 40px',
          width: 'min(1200px, 92vw)',
        }}
      >
        <button
          onClick={close}
          className='absolute top-3 right-4 p-1.5 rounded-lg transition-colors duration-200 z-10'
          style={{ color: 'var(--text-muted)' }}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-hover)'}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
        >
          <XMarkIcon className='w-5 h-5' />
        </button>
        <div>{cloneElement(children, { onCloseModal: close })}</div>
      </div>
    </div>,
    document.body
  );
}

ModalCenter.Open = Open;
ModalCenter.Window = Window;

export default ModalCenter;
