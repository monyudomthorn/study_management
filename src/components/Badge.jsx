import React from 'react';
import { useLanguage } from '../context/LanguageContext';

export const Badge = ({
  type = 'status',
  value,
  variant,
  icon,
  children,
  className = ''
}) => {
  const { t } = useLanguage();

  const content = children !== undefined ? children : value;
  if (content === undefined || content === null || content === '') return null;

  // Direct variant prop mapping (e.g. variant="success" | "warning" | "danger" | "info" | "default" | "primary")
  if (variant) {
    const variantClass = `badge-${variant}`;
    return (
      <span className={`badge ${variantClass} ${className}`}>
        {icon && (
          <i
            className={icon}
            style={{ fontSize: '1.05em', marginRight: '3px', display: 'inline-flex' }}
          ></i>
        )}
        {content}
      </span>
    );
  }

  // Type-based mapping (status or priority)
  if (type === 'status') {
    let badgeClass = 'badge-status-not-started';
    let label = t('statusNotStarted');
    let defaultIcon = null;

    switch (value) {
      case 'In Progress':
        badgeClass = 'badge-status-in-progress';
        label = t('statusInProgress');
        break;
      case 'Completed':
        badgeClass = 'badge-status-completed';
        label = t('statusCompleted');
        break;
      case 'Pending':
        badgeClass = 'badge-status-pending';
        label = t('statusPending');
        break;
      case 'Present':
        badgeClass = 'badge-status-present';
        label = t('statusPresent');
        defaultIcon = 'ri-checkbox-circle-line';
        break;
      case 'Late':
        badgeClass = 'badge-status-late';
        label = t('statusLate');
        defaultIcon = 'ri-time-line';
        break;
      case 'Absent':
        badgeClass = 'badge-status-absent';
        label = t('statusAbsent');
        defaultIcon = 'ri-close-circle-line';
        break;
      case 'Excused':
        badgeClass = 'badge-status-excused';
        label = t('statusExcused');
        defaultIcon = 'ri-shield-check-line';
        break;
      case 'No Class':
        badgeClass = 'badge-status-no-class';
        label = t('statusNoClass');
        defaultIcon = 'ri-pause-circle-line';
        break;
      default:
        label = content;
        break;
    }

    const finalIcon = icon || defaultIcon;

    return (
      <span className={`badge ${badgeClass} ${className}`}>
        {finalIcon ? (
          <i
            className={finalIcon}
            style={{ fontSize: '1.05em', marginRight: '3px', display: 'inline-flex' }}
          ></i>
        ) : (
          <span className="badge-dot"></span>
        )}
        {children || label}
      </span>
    );
  }

  if (type === 'priority') {
    let badgeClass = 'badge-priority-low';
    let label = t('priorityLow');

    if (value === 'Medium') {
      badgeClass = 'badge-priority-medium';
      label = t('priorityMedium');
    } else if (value === 'High') {
      badgeClass = 'badge-priority-high';
      label = t('priorityHigh');
    }

    return (
      <span className={`badge ${badgeClass} ${className}`}>
        {children || label}
      </span>
    );
  }

  return (
    <span className={`badge badge-default ${className}`}>
      {icon && (
        <i
          className={icon}
          style={{ fontSize: '1.05em', marginRight: '3px', display: 'inline-flex' }}
        ></i>
      )}
      {content}
    </span>
  );
};

