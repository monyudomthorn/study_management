import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { ProfileModal } from './ProfileModal';

export const Header = ({ onToggleSidebar }) => {
  const { lang, setLanguage, t } = useLanguage();
  const { resetToDefaultData } = useData();
  const { currentUser } = useAuth();
  const { addToast } = useToast();
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const handleResetData = () => {
    if (window.confirm(t('resetDataConfirm'))) {
      resetToDefaultData();
      addToast(t('dataResetSuccess'), 'info');
    }
  };

  return (
    <>
      <header className="app-header">
        <div className="header-left">
          <button
            type="button"
            className="menu-toggle-btn"
            onClick={onToggleSidebar}
            aria-label="Toggle menu"
          >
            <i className="ri-menu-line"></i>
          </button>

          <div className="header-school-brand">
            <img
              src="/setec-logo.png"
              alt="SETEC Logo"
              className="header-logo-img"
            />
            <div className="header-title-block">
              <h1>{t('appTitle')}</h1>
              <p>{t('appSubtitle')}</p>
            </div>
          </div>
        </div>

        <div className="header-right">
          {/* User Profile Quick Badge Button */}
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={() => setIsProfileOpen(true)}
            style={{
              padding: '6px 12px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              background: 'var(--bg-surface-elevated)',
              borderColor: 'var(--border-subtle)'
            }}
            title={t('editProfileTitle')}
          >
            <div
              className="user-avatar"
              style={{ width: '26px', height: '26px', fontSize: '0.75rem' }}
            >
              {currentUser?.avatarText || 'MT'}
            </div>
            <span className="hide-mobile" style={{ fontWeight: 600, fontSize: '0.84rem' }}>
              {currentUser?.name || t('studentName')}
            </span>
          </button>

          {/* Reset Demo Data Button */}
          <button
            type="button"
            className="btn-reset-demo"
            onClick={handleResetData}
            title={t('resetData')}
          >
            <i className="ri-refresh-line"></i>
            <span className="hide-mobile">{t('resetData')}</span>
          </button>

          {/* Bilingual Switcher (English vs Khmer) */}
          <div className="lang-switcher">
            <button
              type="button"
              className={`lang-btn ${lang === 'en' ? 'active' : ''}`}
              onClick={() => setLanguage('en')}
              title="English Language"
            >
              <i className="ri-global-line"></i> EN
            </button>
            <button
              type="button"
              className={`lang-btn ${lang === 'kh' ? 'active' : ''}`}
              onClick={() => setLanguage('kh')}
              title="ភាសាខ្មែរ (Khmer Language)"
            >
              <i className="ri-translate-2"></i> ខ្មែរ
            </button>
          </div>
        </div>
      </header>

      <ProfileModal
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
      />
    </>
  );
};
