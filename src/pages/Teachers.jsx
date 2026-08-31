import React, { useState, useMemo } from 'react';
import { useData } from '../context/DataContext';
import { useLanguage } from '../context/LanguageContext';
import { useToast } from '../context/ToastContext';
import { Button } from '../components/Button';
import { Modal } from '../components/Modal';
import { ConfirmModal } from '../components/ConfirmModal';

export const Teachers = () => {
  const { teachers, addTeacher, updateTeacher, deleteTeacher } = useData();
  const { t } = useLanguage();
  const { addToast } = useToast();

  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    subject: '',
    telegram: '',
    description: ''
  });

  const filteredTeachers = useMemo(() => {
    return teachers.filter((tea) => {
      const matchName = tea.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchSubject = tea.subject.toLowerCase().includes(searchTerm.toLowerCase());
      const matchTelegram = tea.telegram && tea.telegram.toLowerCase().includes(searchTerm.toLowerCase());
      return matchName || matchSubject || matchTelegram;
    });
  }, [teachers, searchTerm]);

  const handleOpenAddModal = () => {
    setEditingTeacher(null);
    setFormData({
      name: '',
      subject: '',
      telegram: '',
      description: ''
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (tea) => {
    setEditingTeacher(tea);
    setFormData({
      name: tea.name,
      subject: tea.subject,
      telegram: tea.telegram || '',
      description: tea.description || ''
    });
    setIsModalOpen(true);
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.subject.trim()) {
      addToast(t('errorRequiredFields'), 'error');
      return;
    }

    // Normalize telegram username with @ prefix
    let cleanTelegram = formData.telegram.trim();
    if (cleanTelegram && !cleanTelegram.startsWith('@')) {
      cleanTelegram = `@${cleanTelegram}`;
    }

    const payload = {
      ...formData,
      telegram: cleanTelegram
    };

    if (editingTeacher) {
      updateTeacher(editingTeacher.id, payload);
      addToast(t('teacherUpdatedSuccess'), 'success');
    } else {
      addTeacher(payload);
      addToast(t('teacherAddedSuccess'), 'success');
    }

    setIsModalOpen(false);
  };

  const handleConfirmDelete = () => {
    if (deleteTarget) {
      deleteTeacher(deleteTarget.id);
      addToast(t('itemDeletedSuccess'), 'success');
      setDeleteTarget(null);
    }
  };

  const getInitials = (name) => {
    return name
      .split(' ')
      .filter((_, i, arr) => i === 0 || i === arr.length - 1)
      .map((part) => part[0])
      .join('')
      .toUpperCase();
  };

  const getTelegramUrl = (username) => {
    if (!username) return '#';
    const clean = username.replace(/^@/, '');
    return `https://t.me/${clean}`;
  };

  return (
    <div className="teachers-page">
      {/* Top Header */}
      <div className="page-header-bar">
        <div className="page-title-group">
          <h2>
            <i className="ri-user-star-line"></i> {t('teachersHeading')}
          </h2>
          <p>{t('teachersSubheading')}</p>
        </div>
        <Button
          variant="primary"
          onClick={handleOpenAddModal}
          id="btn-add-teacher"
          icon={<i className="ri-user-add-line"></i>}
        >
          {t('inputTeacher')}
        </Button>
      </div>

      {/* Search Toolbar */}
      <div className="filter-toolbar">
        <div className="search-input-wrapper">
          <span className="search-input-icon">
            <i className="ri-search-line"></i>
          </span>
          <input
            type="text"
            className="search-input"
            placeholder={t('searchTeachersPlaceholder')}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Grid of Teachers */}
      {filteredTeachers.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">
            <i className="ri-user-search-line"></i>
          </div>
          <h3>{t('noTeachersFound')}</h3>
          <Button
            variant="primary"
            onClick={handleOpenAddModal}
            icon={<i className="ri-user-add-line"></i>}
          >
            {t('inputTeacher')}
          </Button>
        </div>
      ) : (
        <div className="table-responsive">
          <table className="custom-table">
            <thead>
              <tr>
                <th>{t('colTeacher')}</th>
                <th>{t('fieldSpecialty')}</th>
                <th>{t('colTelegram')}</th>
                <th style={{ textAlign: 'right' }}>{t('colAction')}</th>
              </tr>
            </thead>
            <tbody>
              {filteredTeachers.map((tea) => (
                <tr key={tea.id}>
                  <td>
                    <div className="table-teacher-profile">
                      <div className="teacher-avatar-circle small">
                        {getInitials(tea.name)}
                      </div>
                      <div>
                        <div style={{ fontWeight: 700, color: '#ffffff', fontSize: '0.96rem' }}>
                          {tea.name}
                        </div>
                        {tea.description && (
                          <div
                            style={{
                              color: 'var(--text-muted)',
                              fontSize: '0.8rem',
                              maxWidth: '380px',
                              whiteSpace: 'nowrap',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              marginTop: '2px'
                            }}
                          >
                            {tea.description}
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className="teacher-dept-tag">
                      <i className="ri-book-2-line" style={{ marginRight: '5px' }}></i>
                      {tea.subject}
                    </span>
                  </td>
                  <td>
                    {tea.telegram ? (
                      <a
                        href={getTelegramUrl(tea.telegram)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="table-telegram-link"
                        title={t('openTelegram')}
                      >
                        <i className="ri-telegram-fill"></i>
                        <span>{tea.telegram}</span>
                      </a>
                    ) : (
                      <span style={{ color: 'var(--text-muted)', fontSize: '0.84rem' }}>—</span>
                    )}
                  </td>
                  <td>
                    <div className="table-actions" style={{ justifyContent: 'flex-end' }}>
                      {tea.telegram && (
                        <a
                          href={getTelegramUrl(tea.telegram)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn btn-telegram btn-sm"
                          style={{ textDecoration: 'none', padding: '6px 10px' }}
                          title={t('openTelegram')}
                        >
                          <i className="ri-telegram-fill"></i>
                        </a>
                      )}
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => handleOpenEditModal(tea)}
                        icon={<i className="ri-edit-line"></i>}
                        title={t('update')}
                      >
                        {t('update')}
                      </Button>
                      <Button
                        size="sm"
                        variant="danger"
                        onClick={() => setDeleteTarget(tea)}
                        icon={<i className="ri-delete-bin-line"></i>}
                        title={t('delete')}
                      />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal for Input / Update Teacher */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingTeacher ? t('modalEditTeacher') : t('modalAddTeacher')}
      >
        <form onSubmit={handleFormSubmit}>
          <div className="modal-body">
            <div className="form-group">
              <label className="form-label">{t('fieldTeacherName')} *</label>
              <input
                type="text"
                className="form-input"
                placeholder={t('placeholderTeacherName')}
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">{t('fieldSpecialty')} *</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Web Development, Database, AI"
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                required
              />
            </div>

            {/* Replaced Email & Phone with Telegram */}
            <div className="form-group">
              <label className="form-label">
                <i className="ri-telegram-line" style={{ color: '#229ed9', marginRight: '4px' }}></i>
                {t('fieldTelegram')}
              </label>
              <input
                type="text"
                className="form-input"
                placeholder={t('placeholderTelegram')}
                value={formData.telegram}
                onChange={(e) => setFormData({ ...formData, telegram: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">{t('fieldTeacherBio')}</label>
              <textarea
                className="form-textarea"
                placeholder={t('placeholderDesc')}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>
          </div>

          <div className="modal-footer">
            <Button
              variant="secondary"
              onClick={() => setIsModalOpen(false)}
              icon={<i className="ri-close-line"></i>}
            >
              {t('cancel')}
            </Button>
            <Button
              variant="primary"
              type="submit"
              icon={<i className="ri-check-line"></i>}
            >
              {editingTeacher ? t('update') : t('create')}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmModal
        isOpen={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleConfirmDelete}
        itemName={deleteTarget?.name}
      />
    </div>
  );
};
