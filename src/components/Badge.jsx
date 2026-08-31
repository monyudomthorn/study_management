import React from 'react';
import { useLanguage } from '../context/LanguageContext';

export const Badge = ({ type = 'status', value }) => {
  const { t } = useLanguage();

  if (!value) return null;

  if (type === 'status') {
    let className = 'badge-status-not-started';
    let label = t('statusNotStarted');

    if (value === 'In Progress') {
      className = 'badge-status-in-progress';
      label = t('statusInProgress');
    } else if (value === 'Completed') {
      className = 'badge-status-completed';
      label = t('statusCompleted');
    } else if (value === 'Pending') {
      className = 'badge-status-pending';
      label = t('statusPending');
    }

    return (
      <span className={`badge ${className}`}>
        <span className="badge-dot"></span>
        {label}
      </span>
    );
  }

  if (type === 'priority') {
    let className = 'badge-priority-low';
    let label = t('priorityLow');

    if (value === 'Medium') {
      className = 'badge-priority-medium';
      label = t('priorityMedium');
    } else if (value === 'High') {
      className = 'badge-priority-high';
      label = t('priorityHigh');
    }

    return (
      <span className={`badge ${className}`}>
        {label}
      </span>
    );
  }

  return <span className="badge">{value}</span>;
};
