const Select = (props) => {
  return (
    <select
      {...props}
      className={`w-full max-w-full rounded-lg px-3 py-2 text-sm border cursor-pointer transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-opacity-30 ${props.className || ''}`}
      style={{
        backgroundColor: 'var(--bg-input)',
        borderColor: 'var(--border-color)',
        color: 'var(--text-primary)',
        boxShadow: 'var(--shadow-sm)',
        '--tw-ring-color': 'var(--accent)',
        ...props.style,
      }}
    />
  );
};

export default Select;
