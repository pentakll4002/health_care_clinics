import { useState } from 'react';
import buttonIcon from '../../assets/send.png';
import SpinnerMini from '../../ui/SpinnerMini';

const ChatbotInput = ({ onSend, isLoading }) => {
  const [text, setText] = useState('');

  const handleSend = () => {
    if (text.trim()) {
      onSend(text);
      setText('');
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleSend();
  };

  return (
    <div
      className='relative p-3 flex min-h-[56px]'
      style={{
        backgroundColor: 'var(--bg-card)',
        borderTop: '1px solid var(--border-color)',
      }}
    >
      <input
        type='text'
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={handleKeyDown}
        className={`relative flex-1 px-4 py-3 text-sm border-none rounded-lg outline-none ${
          isLoading ? ' opacity-0' : ''
        }`}
        style={{
          backgroundColor: 'var(--bg-secondary)',
          color: 'var(--text-primary)',
        }}
        placeholder='Nhập câu hỏi'
      />

      {isLoading && (
        <div className='absolute -translate-x-1/2 -translate-y-1/2 top-1/2 left-1/2'>
          <SpinnerMini />
        </div>
      )}

      <button
        onClick={handleSend}
        className={`absolute cursor-pointer bottom-7 right-6 ${
          isLoading ? ' opacity-0' : ''
        }`}
      >
        <img src={buttonIcon} className='w-5 h-5' alt='Send' />
      </button>
    </div>
  );
};

export default ChatbotInput;
