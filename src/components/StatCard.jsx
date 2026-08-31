import React from 'react';

export const StatCard = ({
  title,
  value,
  description,
  icon,
  accentColor
}) => {
  return (
    <div className="stat-card" style={{ '--card-accent': accentColor }}>
      <div className="stat-info">
        <span className="stat-label">{title}</span>
        <span className="stat-value">{value}</span>
        {description && <span className="stat-desc">{description}</span>}
      </div>
      <div className="stat-icon-wrapper">
        {icon}
      </div>
    </div>
  );
};
