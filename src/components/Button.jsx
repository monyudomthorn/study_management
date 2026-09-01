import React from 'react';

export const Button = ({
  children,
  variant = 'primary', // 'primary' | 'secondary' | 'success' | 'danger' | 'ghost' | 'outline-primary'
  size = 'md', // 'sm' | 'md'
  icon,
  onClick,
  type = 'button',
  disabled = false,
  className = '',
  title,
  id
}) => {
  const sizeClass = size === 'sm' ? 'btn-sm' : '';
  const variantClass = `btn-${variant}`;

  const renderIcon = () => {
    if (!icon) return null;
    if (typeof icon === 'string') {
      return (
        <i
          className={icon}
          style={{ marginRight: '8px', fontSize: '1.15em', display: 'inline-flex', verticalAlign: 'middle' }}
        ></i>
      );
    }
    return (
      <span className="btn-icon" style={{ marginRight: '8px', display: 'inline-flex', alignItems: 'center' }}>
        {icon}
      </span>
    );
  };

  return (
    <button
      id={id}
      type={type}
      className={`btn ${variantClass} ${sizeClass} ${className}`}
      onClick={onClick}
      disabled={disabled}
      title={title}
    >
      {renderIcon()}
      {children}
    </button>
  );
};
