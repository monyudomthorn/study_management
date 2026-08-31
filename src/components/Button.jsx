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

  return (
    <button
      id={id}
      type={type}
      className={`btn ${variantClass} ${sizeClass} ${className}`}
      onClick={onClick}
      disabled={disabled}
      title={title}
    >
      {icon && <span className="btn-icon">{icon}</span>}
      {children}
    </button>
  );
};
