import { createContext, useContext } from 'react';

const TableContext = createContext();

function Table({ columns, children }) {
  return (
    <TableContext.Provider value={{ columns }}>
      <div
        role='table'
        className='rounded-xl overflow-hidden border transition-colors duration-200'
        style={{
          backgroundColor: 'var(--bg-card)',
          borderColor: 'var(--border-color)',
          boxShadow: 'var(--shadow-sm)',
        }}
      >
        {children}
      </div>
    </TableContext.Provider>
  );
}

function Header({ children }) {
  const { columns } = useContext(TableContext);

  return (
    <header
      role='row'
      className='grid items-center gap-x-6 px-6 py-3.5'
      style={{
        gridTemplateColumns: columns,
        backgroundColor: 'var(--bg-table-header)',
        borderBottom: '1px solid var(--border-light)',
        color: 'var(--text-secondary)',
        fontSize: '12px',
        fontWeight: 600,
        textTransform: 'uppercase',
        letterSpacing: '0.5px',
      }}
    >
      {children}
    </header>
  );
}

function Row({ children }) {
  const { columns } = useContext(TableContext);

  return (
    <div
      role='row'
      className='grid items-center gap-x-6 px-6 py-3 transition-colors duration-150 cursor-default'
      style={{
        gridTemplateColumns: columns,
        borderBottom: '1px solid var(--border-light)',
        color: 'var(--text-primary)',
        fontSize: '14px',
      }}
      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-table-row-hover)'}
      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
    >
      {children}
    </div>
  );
}

function Body({ data = [], render }) {
  if (!data.length)
    return (
      <p
        className='text-center py-10 text-sm font-medium'
        style={{ color: 'var(--text-muted)' }}
      >
        Không có dữ liệu
      </p>
    );

  return <section>{data.map(render)}</section>;
}

Table.Header = Header;
Table.Row = Row;
Table.Body = Body;

export default Table;