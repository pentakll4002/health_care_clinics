import Button from './Button';

function ConfirmDelete({ resourceName, onConfirm, disabled, onCloseModal }) {
  return (
    <div className='w-[400px] flex flex-col gap-3'>
      <h3
        className='text-lg font-semibold'
        style={{ color: 'var(--text-primary)' }}
      >
        Xoá {resourceName}
      </h3>
      <p
        className='text-sm mb-3'
        style={{ color: 'var(--text-secondary)' }}
      >
        Bạn có chắc chắn muốn xoá {resourceName} này vĩnh viễn không? Hành động
        này không thể hoàn tác!
      </p>

      <div className='flex justify-end gap-3'>
        <Button
          className='px-4 py-1.5 border rounded-lg text-sm font-medium transition-colors'
          style={{
            backgroundColor: 'var(--bg-secondary)',
            borderColor: 'var(--border-color)',
            color: 'var(--text-secondary)',
          }}
          onClick={onCloseModal}
        >
          Huỷ
        </Button>
        <Button
          className='px-4 py-1.5 text-white bg-error-800 hover:bg-error-900 rounded-lg text-sm font-medium'
          onClick={onConfirm}
          disabled={disabled}
        >
          Xoá
        </Button>
      </div>
    </div>
  );
}

export default ConfirmDelete;
