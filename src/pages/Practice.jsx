import React, { useState, useMemo } from 'react';
import { useData } from '../context/DataContext';
import { useLanguage } from '../context/LanguageContext';
import { useToast } from '../context/ToastContext';
import { Button } from '../components/Button';
import { Badge } from '../components/Badge';
import { Modal } from '../components/Modal';
import { ConfirmModal } from '../components/ConfirmModal';

export const Practice = () => {
  const {
    practices,
    subjects,
    addPractice,
    updatePractice,
    deletePractice,
    togglePracticeComplete
  } = useData();

  const { t } = useLanguage();
  const { addToast } = useToast();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [subjectFilter, setSubjectFilter] = useState('All');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPractice, setEditingPractice] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const [formData, setFormData] = useState({
    title: '',
    subject: '',
    description: '',
    createdDate: '',
    status: 'In Progress'
  });

  const filteredPractices = useMemo(() => {
    return practices.filter((p) => {
      const matchSearch =
        p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (p.description && p.description.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchStatus = statusFilter === 'All' || p.status === statusFilter;
      const matchSubject = subjectFilter === 'All' || p.subject === subjectFilter;

      return matchSearch && matchStatus && matchSubject;
    });
  }, [practices, searchTerm, statusFilter, subjectFilter]);

  const handleOpenAddModal = () => {
    setEditingPractice(null);
    setFormData({
      title: '',
      subject: subjects.length > 0 ? subjects[0].name : '',
      description: '',
      createdDate: new Date().toISOString().split('T')[0],
      status: 'In Progress'
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (p) => {
    setEditingPractice(p);
    setFormData({
      title: p.title,
      subject: p.subject,
      description: p.description || '',
      createdDate: p.createdDate,
      status: p.status
    });
    setIsModalOpen(true);
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.subject.trim()) {
      addToast(t('errorRequiredFields'), 'error');
      return;
    }

    if (editingPractice) {
      updatePractice(editingPractice.id, formData);
      addToast(t('practiceUpdatedSuccess'), 'success');
    } else {
      addPractice(formData);
      addToast(t('practiceAddedSuccess'), 'success');
    }

    setIsModalOpen(false);
  };

  const handleToggleComplete = (p) => {
    togglePracticeComplete(p.id);
    addToast(t('statusUpdatedSuccess'), 'info');
  };

  const handleConfirmDelete = () => {
    if (deleteTarget) {
      deletePractice(deleteTarget.id);
      addToast(t('itemDeletedSuccess'), 'success');
      setDeleteTarget(null);
    }
  };

  return (
    <div className="practice-page">
      {/* Header */}
      <div className="page-header-bar">
        <div className="page-title-group">
          <h2>
            <i className="ri-task-line"></i> {t('practiceHeading')}
          </h2>
          <p>{t('practiceSubheading')}</p>
        </div>
        <Button
          variant="primary"
          onClick={handleOpenAddModal}
          id="btn-add-practice"
          icon={<i className="ri-add-line"></i>}
        >
          {t('addPractice')}
        </Button>
      </div>

      {/* Filter and Search */}
      <div className="filter-toolbar">
        <div className="search-input-wrapper">
          <span className="search-input-icon">
            <i className="ri-search-line"></i>
          </span>
          <input
            type="text"
            className="search-input"
            placeholder={t('searchPracticePlaceholder')}
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

        {/* Subject Filter */}
        <select
          className="select-filter"
          value={subjectFilter}
          onChange={(e) => setSubjectFilter(e.target.value)}
        >
          <option value="All">{t('allSubjects')}</option>
          {subjects.map((sub) => (
            <option key={sub.id} value={sub.name}>
              {sub.name}
            </option>
          ))}
        </select>
      </div>

      {/* Practice List */}
      {filteredPractices.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">
            <i className="ri-checkbox-multiple-line"></i>
          </div>
          <h3>{t('noPracticesFound')}</h3>
          <Button
            variant="primary"
            onClick={handleOpenAddModal}
            icon={<i className="ri-add-line"></i>}
          >
            {t('addPractice')}
          </Button>
        </div>
      ) : (
        <div className="table-responsive">
          <table className="custom-table">
            <thead>
              <tr>
                <th style={{ width: '48px', textAlign: 'center' }}></th>
                <th>{t('fieldPracticeTitle')}</th>
                <th>{t('colSubject')}</th>
                <th>{t('colCreatedDate')}</th>
                <th>{t('colStatus')}</th>
                <th style={{ textAlign: 'right' }}>{t('colAction')}</th>
              </tr>
            </thead>
            <tbody>
              {filteredPractices.map((prac) => {
                const isCompleted = prac.status === 'Completed';
                return (
                  <tr key={prac.id}>
                    <td style={{ textAlign: 'center', width: '48px' }}>
                      <button
                        type="button"
                        className={`task-checkbox-btn ${isCompleted ? 'completed' : ''}`}
                        onClick={() => handleToggleComplete(prac)}
                        title={isCompleted ? t('markInProgress') : t('markComplete')}
                      >
                        <i className="ri-check-line"></i>
                      </button>
                    </td>
                    <td>
                      <div
                        style={{
                          fontWeight: 600,
                          color: '#ffffff',
                          fontSize: '0.94rem',
                          textDecoration: isCompleted ? 'line-through' : 'none',
                          opacity: isCompleted ? 0.75 : 1
                        }}
                      >
                        {prac.title}
                      </div>
                      {prac.description && (
                        <div
                          style={{
                            color: 'var(--text-muted)',
                            fontSize: '0.8rem',
                            maxWidth: '400px',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            marginTop: '3px'
                          }}
                        >
                          {prac.description}
                        </div>
                      )}
                    </td>
                    <td>
                      <span className="task-subject-tag">{prac.subject}</span>
                    </td>
                    <td>
                      <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                        <i className="ri-calendar-line" style={{ marginRight: '5px' }}></i>
                        {prac.createdDate}
                      </span>
                    </td>
                    <td>
                      <Badge type="status" value={prac.status} />
                    </td>
                    <td>
                      <div className="table-actions" style={{ justifyContent: 'flex-end' }}>
                        <Button
                          size="sm"
                          variant={isCompleted ? 'secondary' : 'success'}
                          onClick={() => handleToggleComplete(prac)}
                          icon={<i className={isCompleted ? 'ri-arrow-go-back-line' : 'ri-checkbox-circle-line'}></i>}
                          title={isCompleted ? t('markInProgress') : t('markComplete')}
                        >
                          {isCompleted ? '' : t('markComplete')}
                        </Button>
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => handleOpenEditModal(prac)}
                          icon={<i className="ri-edit-line"></i>}
                          title={t('update')}
                        />
                        <Button
                          size="sm"
                          variant="danger"
                          onClick={() => setDeleteTarget(prac)}
                          icon={<i className="ri-delete-bin-line"></i>}
                          title={t('delete')}
                        />
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal for Practice Form */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingPractice ? t('modalEditPractice') : t('modalAddPractice')}
      >
        <form onSubmit={handleFormSubmit}>
          <div className="modal-body">
            <div className="form-group">
              <label className="form-label">{t('fieldPracticeTitle')} *</label>
              <input
                type="text"
                className="form-input"
                placeholder={t('placeholderPracticeTitle')}
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">{t('colSubject')} *</label>
                {subjects.length > 0 ? (
                  <select
                    className="form-select"
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    required
                  >
                    <option value="">{t('selectSubjectPrompt')}</option>
                    {subjects.map((sub) => (
                      <option key={sub.id} value={sub.name}>
                        {sub.name}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    type="text"
                    className="form-input"
                    placeholder={t('placeholderSubName')}
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    required
                  />
                )}
              </div>

              <div className="form-group">
                <label className="form-label">{t('fieldPracticeDate')} *</label>
                <input
                  type="date"
                  className="form-input"
                  value={formData.createdDate}
                  onChange={(e) => setFormData({ ...formData, createdDate: e.target.value })}
                  required
                />
              </div>
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

            <div className="form-group">
              <label className="form-label">{t('colDescription')}</label>
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
              {editingPractice ? t('update') : t('create')}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmModal
        isOpen={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleConfirmDelete}
        itemName={deleteTarget?.title}
      />
    </div>
  );
};
