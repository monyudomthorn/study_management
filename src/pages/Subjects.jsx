import React, { useState, useMemo } from 'react';
import { useData } from '../context/DataContext';
import { useLanguage } from '../context/LanguageContext';
import { useToast } from '../context/ToastContext';
import { Button } from '../components/Button';
import { ProgressBar } from '../components/ProgressBar';
import { Badge } from '../components/Badge';
import { Modal } from '../components/Modal';
import { ConfirmModal } from '../components/ConfirmModal';

export const Subjects = () => {
  const { subjects, teachers, addSubject, updateSubject, deleteSubject } = useData();
  const { t } = useLanguage();
  const { addToast } = useToast();

  // Search & Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [teacherFilter, setTeacherFilter] = useState('All');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSubject, setEditingSubject] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    teacher: '',
    description: '',
    progress: 0,
    status: 'In Progress'
  });

  // Filtered Subjects
  const filteredSubjects = useMemo(() => {
    return subjects.filter((sub) => {
      const matchesSearch =
        sub.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        sub.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (sub.teacher && sub.teacher.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchesStatus = statusFilter === 'All' || sub.status === statusFilter;
      const matchesTeacher = teacherFilter === 'All' || sub.teacher === teacherFilter;

      return matchesSearch && matchesStatus && matchesTeacher;
    });
  }, [subjects, searchTerm, statusFilter, teacherFilter]);

  const handleOpenAddModal = () => {
    setEditingSubject(null);
    setFormData({
      name: '',
      code: '',
      teacher: teachers.length > 0 ? teachers[0].name : '',
      description: '',
      progress: 0,
      status: 'In Progress'
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (sub) => {
    setEditingSubject(sub);
    setFormData({
      name: sub.name,
      code: sub.code,
      teacher: sub.teacher,
      description: sub.description || '',
      progress: sub.progress,
      status: sub.status
    });
    setIsModalOpen(true);
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.code.trim() || !formData.teacher.trim()) {
      addToast(t('errorRequiredFields'), 'error');
      return;
    }

    if (editingSubject) {
      updateSubject(editingSubject.id, formData);
      addToast(t('subjectUpdatedSuccess'), 'success');
    } else {
      addSubject(formData);
      addToast(t('subjectAddedSuccess'), 'success');
    }

    setIsModalOpen(false);
  };

  const handleConfirmDelete = () => {
    if (deleteTarget) {
      deleteSubject(deleteTarget.id);
      addToast(t('itemDeletedSuccess'), 'success');
      setDeleteTarget(null);
    }
  };

  return (
    <div className="subjects-page">
      {/* Top Header */}
      <div className="page-header-bar">
        <div className="page-title-group">
          <h2>
            <i className="ri-book-open-line"></i> {t('subjectsHeading')}
          </h2>
          <p>{t('subjectsSubheading')}</p>
        </div>
        <Button
          variant="primary"
          onClick={handleOpenAddModal}
          id="btn-add-subject"
          icon={<i className="ri-add-line"></i>}
        >
          {t('inputSubject')}
        </Button>
      </div>

      {/* Filter and Search Bar */}
      <div className="filter-toolbar">
        <div className="search-input-wrapper">
          <span className="search-input-icon">
            <i className="ri-search-line"></i>
          </span>
          <input
            type="text"
            className="search-input"
            placeholder={t('searchSubjectsPlaceholder')}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Status Filter */}
        <select
          className="select-filter"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="All">{t('allStatuses')}</option>
          <option value="Not Started">{t('statusNotStarted')}</option>
          <option value="In Progress">{t('statusInProgress')}</option>
          <option value="Completed">{t('statusCompleted')}</option>
        </select>

        {/* Teacher Filter */}
        <select
          className="select-filter"
          value={teacherFilter}
          onChange={(e) => setTeacherFilter(e.target.value)}
        >
          <option value="All">{t('allTeachers')}</option>
          {teachers.map((tea) => (
            <option key={tea.id} value={tea.name}>
              {tea.name}
            </option>
          ))}
        </select>
      </div>

      {/* Grid of Subject Cards */}
      {filteredSubjects.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">
            <i className="ri-book-line"></i>
          </div>
          <h3>{t('noSubjectsFound')}</h3>
          <p>{t('searchSubjectsPlaceholder')}</p>
          <Button
            variant="primary"
            onClick={handleOpenAddModal}
            icon={<i className="ri-add-line"></i>}
          >
            {t('inputSubject')}
          </Button>
        </div>
      ) : (
        <div className="table-responsive">
          <table className="custom-table">
            <thead>
              <tr>
                <th>{t('colCode')} &amp; {t('colSubject')}</th>
                <th>{t('colTeacher')}</th>
                <th style={{ width: '220px' }}>{t('colProgress')}</th>
                <th>{t('colStatus')}</th>
                <th style={{ textAlign: 'right' }}>{t('colAction')}</th>
              </tr>
            </thead>
            <tbody>
              {filteredSubjects.map((sub) => (
                <tr key={sub.id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                      <span className="entity-code-badge">{sub.code}</span>
                      <div style={{ fontWeight: 600, color: '#ffffff', fontSize: '0.95rem' }}>
                        {sub.name}
                      </div>
                    </div>
                    {sub.description && (
                      <div
                        style={{
                          color: 'var(--text-muted)',
                          fontSize: '0.8rem',
                          maxWidth: '420px',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          marginTop: '4px'
                        }}
                      >
                        {sub.description}
                      </div>
                    )}
                  </td>
                  <td>
                    <div className="table-teacher-cell">
                      <i className="ri-user-star-line" style={{ color: 'var(--primary-light)' }}></i>
                      <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{sub.teacher}</span>
                    </div>
                  </td>
                  <td>
                    <div className="table-progress-cell">
                      <ProgressBar
                        progress={sub.progress}
                        label={`${sub.progress}%`}
                        variant="auto"
                      />
                    </div>
                  </td>
                  <td>
                    <Badge type="status" value={sub.status} />
                  </td>
                  <td>
                    <div className="table-actions" style={{ justifyContent: 'flex-end' }}>
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => handleOpenEditModal(sub)}
                        icon={<i className="ri-edit-line"></i>}
                        title={t('update')}
                      >
                        {t('update')}
                      </Button>
                      <Button
                        size="sm"
                        variant="danger"
                        onClick={() => setDeleteTarget(sub)}
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

      {/* Subject Input / Update Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingSubject ? t('modalEditSubject') : t('modalAddSubject')}
      >
        <form onSubmit={handleFormSubmit}>
          <div className="modal-body">
            <div className="form-group">
              <label className="form-label">{t('fieldName')} *</label>
              <input
                type="text"
                className="form-input"
                placeholder={t('placeholderSubName')}
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">{t('fieldCode')} *</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder={t('placeholderSubCode')}
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">{t('fieldTeacher')} *</label>
                {teachers.length > 0 ? (
                  <select
                    className="form-select"
                    value={formData.teacher}
                    onChange={(e) => setFormData({ ...formData, teacher: e.target.value })}
                    required
                  >
                    <option value="">{t('selectTeacherPrompt')}</option>
                    {teachers.map((tea) => (
                      <option key={tea.id} value={tea.name}>
                        {tea.name}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    type="text"
                    className="form-input"
                    placeholder={t('placeholderTeacherName')}
                    value={formData.teacher}
                    onChange={(e) => setFormData({ ...formData, teacher: e.target.value })}
                    required
                  />
                )}
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">{t('fieldProgress')} (0 - 100%)</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  className="form-input"
                  value={formData.progress}
                  onChange={(e) => setFormData({ ...formData, progress: Number(e.target.value) })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">{t('fieldStatus')}</label>
                <select
                  className="form-select"
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                >
                  <option value="Not Started">{t('statusNotStarted')}</option>
                  <option value="In Progress">{t('statusInProgress')}</option>
                  <option value="Completed">{t('statusCompleted')}</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">{t('fieldDescription')}</label>
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
              {editingSubject ? t('update') : t('create')}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleConfirmDelete}
        itemName={deleteTarget ? `${deleteTarget.name} (${deleteTarget.code})` : ''}
      />
    </div>
  );
};
