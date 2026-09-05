import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { ProfileModal } from './ProfileModal';
import { UserAvatar } from './UserAvatar';

export const Sidebar = ({ isOpen, onClose }) => {
  const { t } = useLanguage();
  const { subjects, teachers, practices, assignments } = useData();
  const { currentUser } = useAuth();
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  const navLinks = [
    {
      to: '/dashboard',
      iconClass: 'ri-dashboard-line',
      label: t('navDashboard')
    },
    {
      to: '/subjects',
      iconClass: 'ri-book-open-line',
      label: t('navSubjects'),
      badge: subjects.length
    },
    {
      to: '/teachers',
      iconClass: 'ri-user-star-line',
      label: t('navTeachers'),
      badge: teachers.length
    },
    {
      to: '/practice',
      iconClass: 'ri-task-line',
      label: t('navPractice'),
      badge: practices.length
    },
    {
      to: '/assignments',
      iconClass: 'ri-clipboard-line',
      label: t('navAssignments'),
      badge: assignments.length
    }
  ];

  return (
    <>
      <div
        className={`sidebar-overlay ${isOpen ? 'active' : ''}`}
        onClick={onClose}
      />
      <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
        {/* Brand Header with School Logo */}
        <div className="sidebar-header">
          <img
            src="/setec-logo.png"
            alt="SETEC Institute Logo"
            className="brand-logo-img"
          />
          <div className="brand-text">
            <h2>SETEC</h2>
            <p>{t('university')}</p>
          </div>
          <button
            type="button"
            className="sidebar-close-btn show-mobile"
            onClick={onClose}
            aria-label="Close menu"
          >
            <i className="ri-close-line"></i>
          </button>
        </div>

        {/* Navigation Links */}
        <nav className="sidebar-nav">
          {navLinks.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={onClose}
              className={({ isActive }) =>
                `nav-item ${isActive ? 'active' : ''}`
              }
            >
              <span className="nav-icon">
                <i className={item.iconClass}></i>
              </span>
              <span>{item.label}</span>
              {item.badge !== undefined && (
                <span className="nav-badge">{item.badge}</span>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Dynamic Profile Section (Clickable to Edit/Delete User) */}
        <div
          className="sidebar-profile"
          onClick={() => setIsProfileModalOpen(true)}
          style={{ cursor: 'pointer', transition: 'background-color 0.2s' }}
          title={t('editProfileTitle')}
        >
          <UserAvatar user={currentUser} size={42} />
          <div className="user-info">
            <div className="user-name">
              {currentUser?.name || t('studentName')}
            </div>
            <div className="user-role">
              {currentUser?.role || t('studentRole')}
            </div>
            <div className="user-school">
              {currentUser?.university || t('university')}
            </div>
          </div>
          <i
            className="ri-settings-4-line"
            style={{ color: 'var(--text-muted)', fontSize: '1.1rem' }}
          ></i>
        </div>
      </aside>

      {/* User Profile Edit & Delete Modal */}
      <ProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
      />
    </>
  );
};
