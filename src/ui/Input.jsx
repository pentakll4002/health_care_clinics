import { useController } from 'react-hook-form';

const Input = (props) => {
  const { control, name, type = 'text', placeholder, children, icon } = props;
  const { field } = useController({ control, name, defaultValue: '' });
  return (
    <div className='relative'>
      <span
        className='absolute left-4 top-[50%] -translate-y-[50%] w-5 h-5'
        style={{ color: 'var(--text-muted)' }}
      >
        {icon}
      </span>
      <input
        type={type}
        name={name}
        className='w-full px-4 py-2.5 pl-12 rounded-lg border text-sm transition-colors duration-200 focus:ring-2 focus:ring-opacity-30'
        style={{
          backgroundColor: 'var(--bg-input)',
          borderColor: 'var(--border-color)',
          color: 'var(--text-primary)',
          '--tw-ring-color': 'var(--accent)',
        }}
        placeholder={placeholder}
        {...field}
      />

      {children && (
        <span
          className='absolute cursor-pointer select-none top-2/4 right-4 -translate-y-2/4'
          style={{ color: 'var(--text-muted)' }}
        >
          {children}
        </span>
      )}
    </div>
  );
};

export default Input;
