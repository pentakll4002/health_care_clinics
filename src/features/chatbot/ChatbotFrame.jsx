
const ChatbotFrame = ({ children }) => {
  return (
    <div
      style={{
        background: 'var(--bg-card)',
        borderRadius: 16,
        boxShadow: 'var(--shadow-lg)',
        border: '1px solid var(--border-color)',
        width: 360,
        height: 500,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}
    >
      {children}
    </div>
  );
};
export default ChatbotFrame;
