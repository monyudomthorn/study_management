import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { useToast } from '../context/ToastContext';
import { Button } from '../components/Button';

export const FirstLoginModal = () => {
  const { isFirstLogin, createUser, loadDemoUser } = useAuth();
  const { t } = useLanguage();
  const { addToast } = useToast();

  const [formData, setFormData] = useState({
    name: '',
    role: 'Computer Science Student',
    university: 'SETEC Institute',
    studentId: '',
    year: 'Year 3, Semester 2',
    telegram: ''
  });

  if (!isFirstLogin) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      addToast(t('errorRequiredFields'), 'error');
      return;
    }

    createUser(formData);
    addToast(t('profileCreatedSuccess'), 'success');
  };

  const handleFillDemo = () => {
    loadDemoUser();
    addToast(t('profileCreatedSuccess'), 'info');
  };

  return (
    <div className="modal-backdrop" style={{ zIndex: 99999 }}>
      <div
        className="modal-dialog"
        style={{ maxWidth: '580px', border: '2px solid rgba(16, 185, 129, 0.4)' }}
      >
        {/* Welcome Header */}
        <div
          className="modal-header"
          style={{
            background: 'linear-gradient(135deg, #0a2e22 0%, #061e16 100%)',
            borderBottom: '1px solid rgba(16, 185, 129, 0.3)',
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center',
            padding: '28px 24px 20px',
            gap: '12px'
          }}
        >
          <img
            src="/setec-logo.png"
            alt="SETEC Logo"
            style={{
              width: '64px',
              height: '64px',
              objectFit: 'contain',
              background: '#ffffff',
              padding: '4px',
              borderRadius: 'var(--radius-md)',
              boxShadow: '0 4px 14px rgba(0,0,0,0.5)'
            }}
          />
          <div>
            <h3 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#ffffff' }}>
              {t('firstLoginTitle')}
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.86rem', marginTop: '4px' }}>
              {t('firstLoginSubtitle')}
            </p>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit}>
          <div className="modal-body" style={{ padding: '24px 28px' }}>
            <div className="form-group">
              <label className="form-label">
                <i className="ri-user-line" style={{ color: 'var(--primary-light)', marginRight: '5px' }}></i>
                {t('fieldStudentFullName')} *
              </label>
              <input
                type="text"
                className="form-input"
                placeholder={t('placeholderStudentName')}
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                autoFocus
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">
                  <i className="ri-id-card-line" style={{ color: 'var(--primary-light)', marginRight: '5px' }}></i>
                  {t('fieldStudentID')}
                </label>
                <input
                  type="text"
                  className="form-input"
                  placeholder={t('placeholderStudentID')}
                  value={formData.studentId}
                  onChange={(e) => setFormData({ ...formData, studentId: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">
                  <i className="ri-telegram-line" style={{ color: '#229ed9', marginRight: '5px' }}></i>
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
                <label className="form-label">
                  <i className="ri-graduation-cap-line" style={{ color: 'var(--primary-light)', marginRight: '5px' }}></i>
                  {t('fieldStudentRole')}
                </label>
                <input
                  type="text"
                  className="form-input"
                  placeholder={t('placeholderRole')}
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">
                  <i className="ri-calendar-line" style={{ color: 'var(--primary-light)', marginRight: '5px' }}></i>
                  {t('fieldStudentYear')}
                </label>
                <input
                  type="text"
                  className="form-input"
                  placeholder={t('placeholderYear')}
                  value={formData.year}
                  onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">
                <i className="ri-government-line" style={{ color: 'var(--primary-light)', marginRight: '5px' }}></i>
                {t('fieldStudentUniversity')}
              </label>
              <input
                type="text"
                className="form-input"
                value={formData.university}
                onChange={(e) => setFormData({ ...formData, university: e.target.value })}
                required
              />
            </div>
          </div>

          <div
            className="modal-footer"
            style={{
              justifyContent: 'space-between',
              padding: '16px 28px',
              borderTop: '1px solid var(--border-subtle)'
            }}
          >
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={handleFillDemo}
              icon={<i className="ri-magic-line"></i>}
            >
              {t('btnQuickDemo')}
            </Button>

            <Button
              type="submit"
              variant="primary"
              icon={<i className="ri-login-circle-line"></i>}
            >
              {t('btnStartStudying')}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
