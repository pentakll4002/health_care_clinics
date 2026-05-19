import { cloneElement, createContext, useContext, useState } from 'react';
import { createPortal } from 'react-dom';
import { XMarkIcon } from '@heroicons/react/24/outline';
import useClickOutSide from '../hooks/useClickOutSide';

const ModalContext = createContext();

function Modal({ children }) {
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
      className='fixed inset-0 z-[1000] flex justify-end transition-all duration-300'
      style={{ backgroundColor: 'var(--bg-modal-overlay)', backdropFilter: 'blur(4px)' }}
    >
      <div
        ref={ref}
        className='w-[90%] max-w-[800px] h-full overflow-y-auto animate-slide-in relative'
        style={{
          backgroundColor: 'var(--bg-card)',
          boxShadow: 'var(--shadow-lg)',
          padding: '24px 32px',
        }}
      >
        <button
          onClick={close}
          className='absolute top-4 right-4 p-1.5 rounded-lg transition-colors duration-200 z-10'
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

Modal.Open = Open;
Modal.Window = Window;

export default Modal;
