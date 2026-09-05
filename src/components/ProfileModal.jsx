import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { useToast } from '../context/ToastContext';
import { Modal } from './Modal';
import { Button } from './Button';
import { UserAvatar } from './UserAvatar';

// Curated high quality preset avatars for students
const PRESET_AVATARS = [
  {
    id: 'student-1',
    label: 'Student 1',
    url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
  },
  {
    id: 'student-2',
    label: 'Student 2',
    url: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80'
  },
  {
    id: 'student-3',
    label: 'Student 3',
    url: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80'
  },
  {
    id: 'student-4',
    label: 'Student 4',
    url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80'
  },
  {
    id: 'student-5',
    label: 'Student 5',
    url: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=150&auto=format&fit=crop&q=80'
  },
  {
    id: 'student-6',
    label: 'Student 6',
    url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80'
  }
];

export const ProfileModal = ({ isOpen, onClose }) => {
  const { currentUser, updateUser, deleteUser } = useAuth();
  const { t } = useLanguage();
  const { addToast } = useToast();
  const fileInputRef = useRef(null);

  const [formData, setFormData] = useState({
    name: '',
    role: '',
    university: '',
    studentId: '',
    year: '',
    telegram: '',
    avatarImage: null
  });

  const [showUrlInput, setShowUrlInput] = useState(false);
  const [customUrl, setCustomUrl] = useState('');

  useEffect(() => {
    if (currentUser && isOpen) {
      setFormData({
        name: currentUser.name || '',
        role: currentUser.role || '',
        university: currentUser.university || '',
        studentId: currentUser.studentId || '',
        year: currentUser.year || '',
        telegram: currentUser.telegram || '',
        avatarImage: currentUser.avatarImage || null
      });
      setShowUrlInput(false);
      setCustomUrl('');
    }
  }, [currentUser, isOpen]);

  // Handle local file upload (converts to Base64)
  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      addToast(t('invalidImageFile') || 'Please select a valid image file.', 'error');
      return;
    }

    // Limit file size to 4MB for localStorage performance
    if (file.size > 4 * 1024 * 1024) {
      addToast('Image size exceeds 4MB. Please choose a smaller photo.', 'warning');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64String = event.target?.result;
      if (base64String) {
        setFormData((prev) => ({ ...prev, avatarImage: base64String }));
        addToast(t('imageUploadSuccess') || 'Profile picture uploaded!', 'success');
      }
    };
    reader.readAsDataURL(file);
    // Reset file input
    e.target.value = '';
  };

  // Handle preset avatar click
  const handleSelectPreset = (url) => {
    setFormData((prev) => ({ ...prev, avatarImage: url }));
    addToast(t('imageLoadedSuccess') || 'Preset avatar applied!', 'info');
  };

  // Handle URL apply
  const handleApplyUrl = (e) => {
    e.preventDefault();
    if (!customUrl.trim()) return;
    setFormData((prev) => ({ ...prev, avatarImage: customUrl.trim() }));
    addToast(t('imageLoadedSuccess') || 'Image URL applied!', 'info');
    setShowUrlInput(false);
    setCustomUrl('');
  };

  // Remove photo and revert to initials
  const handleRemovePhoto = () => {
    setFormData((prev) => ({ ...prev, avatarImage: null }));
    addToast(t('imageRemovedSuccess') || 'Profile photo removed.', 'info');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      addToast(t('errorRequiredFields'), 'error');
      return;
    }

    updateUser(formData);
    addToast(t('profileUpdatedSuccess'), 'success');
    onClose();
  };

  const handleLogout = () => {
    if (window.confirm(t('logoutConfirm'))) {
      deleteUser();
      addToast(t('profileResetSuccess'), 'info');
      onClose();
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={t('editProfileTitle')}
      maxWidth="600px"
    >
      <form onSubmit={handleSubmit}>
        <div className="modal-body" style={{ maxHeight: '72vh', overflowY: 'auto' }}>
          
          {/* Profile Picture Management Section */}
          <div className="profile-image-section">
            <div className="profile-image-header">
              {/* Interactive Avatar Preview with Camera Overlay */}
              <div
                className="profile-avatar-wrapper"
                onClick={() => fileInputRef.current?.click()}
                title={t('changePhoto')}
              >
                <UserAvatar
                  user={{
                    ...formData,
                    avatarText: formData.name
                      ? formData.name
                          .split(' ')
                          .filter((_, i, arr) => i === 0 || i === arr.length - 1)
                          .map((n) => n[0])
                          .join('')
                          .toUpperCase()
                      : currentUser?.avatarText || 'ST'
                  }}
                  size={76}
                  className="profile-avatar-preview"
                />
                <div className="profile-avatar-overlay">
                  <i className="ri-camera-fill"></i>
                </div>
              </div>

              {/* Upload Controls & Actions */}
              <div className="profile-image-actions">
                <div className="profile-image-title-group">
                  <span className="profile-image-title">{formData.name || t('studentName')}</span>
                  <span className="profile-image-subtitle">
                    {t('photoUploadHint')}
                  </span>
                </div>

                <div className="profile-btn-row">
                  <button
                    type="button"
                    className="btn btn-sm btn-primary profile-upload-btn"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <i className="ri-upload-2-line"></i>
                    <span>{formData.avatarImage ? t('changePhoto') : t('uploadPhoto')}</span>
                  </button>

                  <button
                    type="button"
                    className="btn btn-sm btn-secondary"
                    onClick={() => setShowUrlInput((prev) => !prev)}
                    title={t('photoUrlLabel')}
                  >
                    <i className="ri-link"></i>
                    <span className="hide-mobile">{t('photoUrlLabel')}</span>
                  </button>

                  {formData.avatarImage && (
                    <button
                      type="button"
                      className="btn btn-sm btn-danger-subtle"
                      onClick={handleRemovePhoto}
                      title={t('removePhoto')}
                    >
                      <i className="ri-delete-bin-line"></i>
                      <span>{t('removePhoto')}</span>
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Hidden native file input */}
            <input
              type="file"
              ref={fileInputRef}
              accept="image/png, image/jpeg, image/jpg, image/webp, image/gif"
              style={{ display: 'none' }}
              onChange={handleFileUpload}
            />

            {/* Optional URL Input Panel */}
            {showUrlInput && (
              <div className="profile-url-panel">
                <input
                  type="url"
                  className="form-input form-input-sm"
                  placeholder={t('placeholderPhotoUrl')}
                  value={customUrl}
                  onChange={(e) => setCustomUrl(e.target.value)}
                  autoFocus
                />
                <button
                  type="button"
                  className="btn btn-sm btn-primary"
                  onClick={handleApplyUrl}
                  disabled={!customUrl.trim()}
                >
                  <i className="ri-check-line"></i> Apply
                </button>
                <button
                  type="button"
                  className="btn btn-sm btn-secondary"
                  onClick={() => setShowUrlInput(false)}
                >
                  <i className="ri-close-line"></i>
                </button>
              </div>
            )}

            {/* Preset Avatars Gallery */}
            <div className="preset-avatars-wrapper">
              <span className="preset-avatars-label">
                <i className="ri-sparkling-line" style={{ color: 'var(--primary-light)' }}></i>
                {t('presetAvatars')}
              </span>
              <div className="preset-avatars-grid">
                {PRESET_AVATARS.map((preset) => (
                  <button
                    key={preset.id}
                    type="button"
                    className={`preset-avatar-btn ${formData.avatarImage === preset.url ? 'active' : ''}`}
                    onClick={() => handleSelectPreset(preset.url)}
                    title={preset.label}
                  >
                    <img src={preset.url} alt={preset.label} />
                    {formData.avatarImage === preset.url && (
                      <span className="preset-check-badge">
                        <i className="ri-check-line"></i>
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Student Profile Info Fields */}
          <div className="form-group" style={{ marginTop: '16px' }}>
            <label className="form-label">{t('fieldStudentFullName')} *</label>
            <input
              type="text"
              className="form-input"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">{t('fieldStudentID')}</label>
              <input
                type="text"
                className="form-input"
                value={formData.studentId}
                onChange={(e) => setFormData({ ...formData, studentId: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">
                <i className="ri-telegram-line" style={{ color: '#229ed9', marginRight: '4px' }}></i>
                {t('fieldStudentTelegram')}
              </label>
              <input
                type="text"
                className="form-input"
                placeholder={t('placeholderTelegram')}
                value={formData.telegram}
                onChange={(e) => setFormData({ ...formData, telegram: e.target.value })}
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">{t('fieldStudentRole')}</label>
              <input
                type="text"
                className="form-input"
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">{t('fieldStudentYear')}</label>
              <input
                type="text"
                className="form-input"
                value={formData.year}
                onChange={(e) => setFormData({ ...formData, year: e.target.value })}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">{t('fieldStudentUniversity')}</label>
            <input
              type="text"
              className="form-input"
              value={formData.university}
              onChange={(e) => setFormData({ ...formData, university: e.target.value })}
            />
          </div>
        </div>

        <div
          className="modal-footer"
          style={{
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '12px'
          }}
        >
          <Button
            type="button"
            variant="danger"
            size="sm"
            onClick={handleLogout}
            icon={<i className="ri-logout-box-r-line"></i>}
          >
            {t('btnLogoutUser')}
          </Button>

          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <Button
              type="button"
              variant="secondary"
              onClick={onClose}
              icon={<i className="ri-close-line"></i>}
            >
              {t('cancel')}
            </Button>
            <Button
              type="submit"
              variant="primary"
              icon={<i className="ri-check-line"></i>}
            >
              {t('btnUpdateProfile')}
            </Button>
          </div>
        </div>
      </form>
    </Modal>
  );
};
