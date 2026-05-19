const Spinner = () => {
  return (
    <div
      style={{
        margin: '48px auto',
        width: '48px',
        aspectRatio: '1',
        borderRadius: '50%',
        background: `radial-gradient(farthest-side, var(--accent, #2E37A4) 94%, transparent) top/8px 8px no-repeat, conic-gradient(transparent 30%, var(--accent, #2E37A4))`,
        WebkitMask: 'radial-gradient(farthest-side, transparent calc(100% - 8px), #000 0)',
        animation: 'spin 1.2s infinite linear',
      }}
    >
      <style>{`
        @keyframes spin {
          to { transform: rotate(1turn); }
        }
      `}</style>
    </div>
  );
};

export default Spinner;
