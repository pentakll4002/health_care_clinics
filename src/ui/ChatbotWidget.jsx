import { useState } from 'react';
import chatbotIcon from '../assets/chatbot-logo.png';
import ChatbotFrame from '../features/chatbot/ChatbotFrame';
import ChatbotHeader from '../features/chatbot/ChatbotHeader';
import ChatbotOutput from '../features/chatbot/ChatbotOutput';
import ChatbotInput from '../features/chatbot/ChatbotInput';
import { axiosChatbot } from '../utils/axiosInstance';

const ChatbotWidget = () => {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleSend = async (text) => {
    const newMessages = [...messages, { from: 'user', text }];
    setMessages(newMessages);
    setLoading(true);

    try {
      const conversation_history = newMessages.map((msg) => ({
        role: msg.from === 'user' ? 'user' : 'assistant',
        content: msg.text,
      }));

      const res = await axiosChatbot.post('/', {
        message: text,
        conversation_history,
        use_rag: true,
      });

      setMessages((prev) => [
        ...prev,
        { from: 'bot', text: res.data.answer || res.data.response?.[0]?.message || 'Không có phản hồi.' },
      ]);
    } catch (e) {
      console.error('Chatbot error:', e);
      let errorMsg = 'Chatbot không phản hồi. Vui lòng thử lại sau.';

      if (e.code === 'ERR_NETWORK' || e.message?.includes('ECONNREFUSED')) {
        errorMsg =
          '⚠️ Không thể kết nối đến AI service. Hãy chạy: cd ai-service && npm start';
      } else if (e.response?.data?.detail) {
        errorMsg = `Lỗi: ${e.response.data.detail}`;
      } else if (e.response?.status === 500) {
        errorMsg = `Lỗi server: ${e.response?.data?.error || 'Vui lòng kiểm tra ai-service log'}`;
      }

      setMessages((prev) => [...prev, { from: 'bot', text: errorMsg }]);
    }

    setLoading(false);
  };

  return (
    <div style={{ position: 'fixed', bottom: 24, right: 24, zIndex: 9999 }}>
      {open ? (
        <div className='animate-scale-in'>
          <ChatbotFrame>
            <ChatbotHeader onClose={() => setOpen(false)} />
            <ChatbotOutput messages={messages} />
            <ChatbotInput onSend={handleSend} isLoading={loading} />
          </ChatbotFrame>
        </div>
      ) : (
        <button
          onClick={() => setOpen((v) => !v)}
          className='p-2.5 rounded-full outline-none cursor-pointer transition-transform duration-200 hover:scale-110'
          style={{
            background: 'linear-gradient(135deg, var(--accent) 0%, #0e9384 100%)',
            boxShadow: 'var(--shadow-lg)',
          }}
        >
          <img src={chatbotIcon} alt='Chatbot' className='w-9 h-9' />
        </button>
      )}
    </div>
  );
};

export default ChatbotWidget;
