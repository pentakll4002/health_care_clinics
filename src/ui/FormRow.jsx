const FormRow = ({ label, name, error, children }) => {
  return (
    <div className='mb-4'>
      {label && (
        <label
          htmlFor={name}
          className='block mb-1.5 text-sm font-medium'
          style={{ color: 'var(--text-primary)' }}
        >
          {label}
        </label>
      )}
      {children}
      {error && (
        <p className='mt-1 text-xs font-medium' style={{ color: 'var(--error)' }}>
          {error}
        </p>
      )}
    </div>
  );
};

export default FormRow;
