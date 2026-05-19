import { CheckIcon } from '@heroicons/react/24/outline';

const LayoutAuth = ({
  children,
  heading = '',
  paragraph = '',
  picture,
  check = false,
}) => {
  return (
    <div className='flex items-start justify-center min-h-screen' style={{ backgroundColor: 'var(--bg-secondary)' }}>
      <img src={picture} className='flex-1 object-cover max-h-screen' alt='' />
      <div className='flex items-center justify-center flex-1 min-h-screen'>
        <div
          className='flex flex-col justify-center p-6 rounded-2xl border w-[500px]'
          style={{
            backgroundColor: 'var(--bg-card)',
            borderColor: 'var(--border-color)',
            boxShadow: 'var(--shadow-md)',
          }}
        >
          {check && (
            <div className='flex justify-center mb-4'>
              <div className='flex items-center justify-center w-12 h-12 text-center rounded-full bg-success'>
                <CheckIcon className='w-8 h-8 text-white' />
              </div>
            </div>
          )}

          <h1
            className='text-xl font-bold text-center'
            style={{ color: 'var(--text-primary)' }}
          >
            {heading}
          </h1>

          <p
            className='mb-4 text-sm font-normal text-center opacity-70'
            style={{ color: 'var(--text-secondary)' }}
          >
            {paragraph}
          </p>
          {children}
        </div>
      </div>
    </div>
  );
};

export default LayoutAuth;
