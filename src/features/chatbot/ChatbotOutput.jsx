import { useEffect, useRef } from 'react';

const ChatbotOutput = ({ messages }) => {
  const ref = useRef();
  useEffect(() => {
    if (ref.current) {
      ref.current.scrollTop = ref.current.scrollHeight;
    }
  }, [messages]);

  return (
    <div
      ref={ref}
      className='flex-1 p-4 overflow-y-auto'
      style={{ backgroundColor: 'var(--bg-secondary)' }}
    >
      {messages && messages.length > 0 ? (
        messages.map((msg, idx) => (
          <div
            key={idx}
            className={`mx-2 my-1 ${
              msg.from === 'user' ? 'text-right' : 'text-left'
            }`}
          >
            <span
              className={`inline-block max-w-[220px] text-sm px-4 py-2 rounded-xl ${
                msg.from === 'user'
                  ? 'bg-primary text-white'
                  : ''
              }`}
              style={
                msg.from !== 'user'
                  ? {
                      backgroundColor: 'var(--bg-card)',
                      color: 'var(--text-primary)',
                      border: '1px solid var(--border-light)',
                    }
                  : {}
              }
            >
              {msg.text}
            </span>
          </div>
        ))
      ) : (
        <div className='mt-2 text-sm text-center' style={{ color: 'var(--text-muted)' }}>
          Chào mừng bạn đến với chatbot!
        </div>
      )}
    </div>
  );
};

export default ChatbotOutput;
