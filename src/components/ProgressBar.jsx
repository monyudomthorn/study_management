import React from 'react';

export const ProgressBar = ({
  progress = 0,
  label = '',
  showLabel = true,
  thick = false,
  variant = 'primary', // 'primary' | 'success' | 'warning' | 'info'
  className = ''
}) => {
  const safeProgress = Math.min(100, Math.max(0, Number(progress) || 0));

  let fillVariant = variant;
  if (variant === 'auto') {
    if (safeProgress >= 100) fillVariant = 'success';
    else if (safeProgress >= 60) fillVariant = 'primary';
    else if (safeProgress >= 30) fillVariant = 'info';
    else fillVariant = 'warning';
  }

  return (
    <div className={`progress-container ${className}`}>
      {showLabel && (
        <div className="progress-header">
          <span className="progress-text-label">{label}</span>
          <span className="progress-text-percent" style={{ fontWeight: 600 }}>
            {safeProgress}%
          </span>
        </div>
      )}
      <div className={`progress-track ${thick ? 'thick' : ''}`}>
        <div
          className={`progress-fill ${fillVariant}`}
          style={{ width: `${safeProgress}%` }}
        />
      </div>
    </div>
  );
};
