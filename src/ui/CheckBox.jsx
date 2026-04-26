import classNames from '../utils/classNames';

const CheckBox = ({ checked, onClick, name, children, className }) => {
  return (
    <div className={classNames('flex items-center flex-center gap-x-3', className)}>
      <div
        className={classNames(
          'inline-flex justify-center items-center text-white p-1 w-4 h-4 border rounded cursor-pointer ',
          checked ? 'bg-primary border-primary' : 'border-primary'
        )}
        onClick={onClick}
      >
        <input
          type='checkbox'
          name={name}
          className='hidden'
          onChange={() => {}}
        />
        <span className={`${checked ? '' : 'opacity-0 invisible'}`}>
          <svg
            xmlns='http://www.w3.org/2000/svg'
            fill='none'
            viewBox='0 0 24 24'
            strokeWidth='1.5'
            stroke='currentColor'
            className='w-4 h-4'
          >
            <path
              strokeLinecap='round'
              strokeLinejoin='round'
              d='M4.5 12.75l6 6 9-13.5'
            />
          </svg>
        </span>
      </div>

      {children && (
        <div onClick={onClick} className='text-sm cursor-pointer'>
          {children}
        </div>
      )}
    </div>
  );
};

export default CheckBox;
