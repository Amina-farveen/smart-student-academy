import React from 'react';

const Loader = ({ fullPage = false, size = 'md' }) => {
  const sizes = { sm: 24, md: 40, lg: 56 };
  const px = sizes[size] || 40;

  const spinner = (
    <div style={{
      width: px,
      height: px,
      border: `${size === 'sm' ? 2 : 3}px solid rgba(255,255,255,0.1)`,
      borderTopColor: '#f59e0b',
      borderRadius: '50%',
      animation: 'spin 0.7s linear infinite'
    }} />
  );

  if (fullPage) {
    return (
      <div style={{
        position: 'fixed',
        inset: 0,
        background: 'var(--surface-0)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '16px'
      }}>
        {spinner}
        <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Loading...</span>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', justifyContent: 'center', padding: '40px 0' }}>
      {spinner}
    </div>
  );
};

export default Loader;
