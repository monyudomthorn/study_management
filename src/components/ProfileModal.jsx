import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { useToast } from '../context/ToastContext';
import { Modal } from './Modal';
import { Button } from './Button';

export const ProfileModal = ({ isOpen, onClose }) => {
  const { currentUser, updateUser, deleteUser } = useAuth();
  const { t } = useLanguage();
  const { addToast } = useToast();

  const [formData, setFormData] = useState({
    name: '',
    role: '',
    university: '',
    studentId: '',
    year: '',
    telegram: ''
  });

  useEffect(() => {
    if (currentUser && isOpen) {
      setFormData({
        name: currentUser.name || '',
        role: currentUser.role || '',
        university: currentUser.university || '',
        studentId: currentUser.studentId || '',
        year: currentUser.year || '',
        telegram: currentUser.telegram || ''
      });
    }
  }, [currentUser, isOpen]);

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
      maxWidth="560px"
    >
      <form onSubmit={handleSubmit}>
        <div className="modal-body">
          {/* Avatar Preview */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '16px',
              padding: '12px 16px',
              background: 'rgba(0,0,0,0.25)',
              borderRadius: 'var(--radius-lg)',
              border: '1px solid var(--border-subtle)'
            }}
          >
            <div className="user-avatar" style={{ width: '50px', height: '50px', fontSize: '1.2rem' }}>
              {currentUser?.avatarText || 'MT'}
            </div>
            <div>
              <div style={{ fontWeight: 700, color: '#ffffff', fontSize: '1.05rem' }}>
                {currentUser?.name || t('studentName')}
              </div>
              <div style={{ color: 'var(--primary-light)', fontSize: '0.82rem' }}>
                {currentUser?.studentId || t('setecStudentLabel')}
              </div>
            </div>
          </div>

          <div className="form-group">
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
