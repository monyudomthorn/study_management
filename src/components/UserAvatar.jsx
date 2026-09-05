import React, { useState } from 'react';

/**
 * Reusable User Avatar Component
 * Displays user profile image if available, falling back to initials with gradient background.
 */
export const UserAvatar = ({
  user,
  size = 42,
  className = '',
  style = {},
  fontSize,
  showBorder = true,
  onClick
}) => {
  const [imageError, setImageError] = useState(false);

  // Extract avatar text / initials
  const getInitials = () => {
    if (user?.avatarText) return user.avatarText;
    if (user?.name) {
      const parts = user.name.trim().split(' ').filter(Boolean);
      if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
      if (parts.length > 1) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return 'ST';
  };

  const avatarImageSrc = user?.avatarImage || user?.avatarUrl || user?.photo;
  const hasValidImage = Boolean(avatarImageSrc) && !imageError;

  const sizePx = typeof size === 'number' ? `${size}px` : size;
  const computedFontSize = fontSize || (typeof size === 'number' ? `${Math.max(10, Math.floor(size * 0.38))}px` : '1rem');

  return (
    <div
      className={`user-avatar ${hasValidImage ? 'has-image' : ''} ${className}`}
      onClick={onClick}
      style={{
        width: sizePx,
        height: sizePx,
        minWidth: sizePx,
        minHeight: sizePx,
        fontSize: computedFontSize,
        border: showBorder ? '2px solid rgba(16, 185, 129, 0.5)' : 'none',
        ...style
      }}
      title={user?.name || 'User Profile'}
    >
      {hasValidImage ? (
        <img
          src={avatarImageSrc}
          alt={user?.name || 'User Avatar'}
          className="user-avatar-img"
          onError={() => setImageError(true)}
          loading="lazy"
        />
      ) : (
        <span className="user-avatar-text">{getInitials()}</span>
      )}
    </div>
  );
};
