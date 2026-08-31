import React, { useState, useMemo } from 'react';
import { useData } from '../context/DataContext';
import { useLanguage } from '../context/LanguageContext';
import { useToast } from '../context/ToastContext';
import { Button } from '../components/Button';
import { Badge } from '../components/Badge';
import { Modal } from '../components/Modal';
import { ConfirmModal } from '../components/ConfirmModal';

export const Assignments = () => {
  const {
    assignments,
    subjects,
    addAssignment,
    updateAssignment,
    deleteAssignment,
    toggleAssignmentComplete
  } = useData();

  const { t } = useLanguage();
  const { addToast } = useToast();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [priorityFilter, setPriorityFilter] = useState('All');
  const [subjectFilter, setSubjectFilter] = useState('All');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAssignment, setEditingAssignment] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const [formData, setFormData] = useState({
    title: '',
    subject: '',
    description: '',
    dueDate: '',
    priority: 'Medium',
    status: 'Pending'
  });

  const filteredAssignments = useMemo(() => {
    return assignments.filter((asg) => {
      const matchSearch =
        asg.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        asg.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (asg.description && asg.description.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchStatus = statusFilter === 'All' || asg.status === statusFilter;
      const matchPriority = priorityFilter === 'All' || asg.priority === priorityFilter;
      const matchSubject = subjectFilter === 'All' || asg.subject === subjectFilter;

      return matchSearch && matchStatus && matchPriority && matchSubject;
    });
  }, [assignments, searchTerm, statusFilter, priorityFilter, subjectFilter]);

  const handleOpenAddModal = () => {
    setEditingAssignment(null);
    setFormData({
      title: '',
      subject: subjects.length > 0 ? subjects[0].name : '',
      description: '',
      dueDate: new Date().toISOString().split('T')[0],
      priority: 'Medium',
      status: 'Pending'
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (asg) => {
    setEditingAssignment(asg);
    setFormData({
      title: asg.title,
      subject: asg.subject,
      description: asg.description || '',
      dueDate: asg.dueDate,
      priority: asg.priority,
      status: asg.status
    });
    setIsModalOpen(true);
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.subject.trim() || !formData.dueDate) {
      addToast(t('errorRequiredFields'), 'error');
      return;
    }

    if (editingAssignment) {
      updateAssignment(editingAssignment.id, formData);
      addToast(t('assignmentUpdatedSuccess'), 'success');
    } else {
      addAssignment(formData);
      addToast(t('assignmentAddedSuccess'), 'success');
    }

    setIsModalOpen(false);
  };

  const handleToggleComplete = (asg) => {
    toggleAssignmentComplete(asg.id);
    addToast(t('statusUpdatedSuccess'), 'info');
  };

  const handleConfirmDelete = () => {
    if (deleteTarget) {
      deleteAssignment(deleteTarget.id);
      addToast(t('itemDeletedSuccess'), 'success');
      setDeleteTarget(null);
    }
  };

  return (
    <div className="assignments-page">
      {/* Header */}
      <div className="page-header-bar">
        <div className="page-title-group">
          <h2>
            <i className="ri-clipboard-line"></i> {t('assignmentsHeading')}
          </h2>
          <p>{t('assignmentsSubheading')}</p>
        </div>
        <Button
          variant="primary"
          onClick={handleOpenAddModal}
          id="btn-add-assignment"
          icon={<i className="ri-add-line"></i>}
        >
          {t('inputAssignment')}
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
            placeholder={t('searchAssignmentsPlaceholder')}
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
          <option value="Pending">{t('statusPending')}</option>
          <option value="In Progress">{t('statusInProgress')}</option>
          <option value="Completed">{t('statusCompleted')}</option>
        </select>

        {/* Priority Filter */}
        <select
          className="select-filter"
          value={priorityFilter}
          onChange={(e) => setPriorityFilter(e.target.value)}
        >
          <option value="All">{t('allPriorities')}</option>
          <option value="Low">{t('priorityLow')}</option>
          <option value="Medium">{t('priorityMedium')}</option>
          <option value="High">{t('priorityHigh')}</option>
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

      {/* Assignments Table */}
      {filteredAssignments.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">
            <i className="ri-file-list-3-line"></i>
          </div>
          <h3>{t('noAssignmentsFound')}</h3>
          <Button
            variant="primary"
            onClick={handleOpenAddModal}
            icon={<i className="ri-add-line"></i>}
          >
            {t('inputAssignment')}
          </Button>
        </div>
      ) : (
        <div className="table-responsive">
          <table className="custom-table">
            <thead>
              <tr>
                <th>{t('colAssignment')}</th>
                <th>{t('colSubject')}</th>
                <th>{t('colDueDate')}</th>
                <th>{t('colPriority')}</th>
                <th>{t('colStatus')}</th>
                <th style={{ textAlign: 'right' }}>{t('colAction')}</th>
              </tr>
            </thead>
            <tbody>
              {filteredAssignments.map((asg) => {
                const isCompleted = asg.status === 'Completed';
                return (
                  <tr key={asg.id}>
                    <td>
                      <div style={{ fontWeight: 600, color: '#ffffff', fontSize: '0.94rem' }}>
                        {asg.title}
                      </div>
                      {asg.description && (
                        <div
                          style={{
                            color: 'var(--text-muted)',
                            fontSize: '0.8rem',
                            maxWidth: '420px',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis'
                          }}
                        >
                          {asg.description}
                        </div>
                      )}
                    </td>
                    <td>
                      <span className="task-subject-tag">{asg.subject}</span>
                    </td>
                    <td>
                      <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                        <i className="ri-calendar-event-line" style={{ marginRight: '4px' }}></i>
                        {asg.dueDate}
                      </span>
                    </td>
                    <td>
                      <Badge type="priority" value={asg.priority} />
                    </td>
                    <td>
                      <Badge type="status" value={asg.status} />
                    </td>
                    <td>
                      <div className="table-actions" style={{ justifyContent: 'flex-end' }}>
                        <Button
                          size="sm"
                          variant={isCompleted ? 'secondary' : 'success'}
                          onClick={() => handleToggleComplete(asg)}
                          icon={<i className={isCompleted ? 'ri-arrow-go-back-line' : 'ri-checkbox-circle-line'}></i>}
                          title={isCompleted ? t('markInProgress') : t('markComplete')}
                        >
                          {isCompleted ? '' : t('markComplete')}
                        </Button>
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => handleOpenEditModal(asg)}
                          icon={<i className="ri-edit-line"></i>}
                          title={t('edit')}
                        />
                        <Button
                          size="sm"
                          variant="danger"
                          onClick={() => setDeleteTarget(asg)}
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

      {/* Modal for Input / Update Assignment */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingAssignment ? t('modalEditAssignment') : t('modalAddAssignment')}
      >
        <form onSubmit={handleFormSubmit}>
          <div className="modal-body">
            <div className="form-group">
              <label className="form-label">{t('fieldAssignmentTitle')} *</label>
              <input
                type="text"
                className="form-input"
                placeholder={t('placeholderAssignmentTitle')}
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
                <label className="form-label">{t('fieldDueDate')} *</label>
                <input
                  type="date"
                  className="form-input"
                  value={formData.dueDate}
                  onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">{t('fieldPriority')}</label>
                <select
                  className="form-select"
                  value={formData.priority}
                  onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                >
                  <option value="Low">{t('priorityLow')}</option>
                  <option value="Medium">{t('priorityMedium')}</option>
                  <option value="High">{t('priorityHigh')}</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">{t('fieldStatus')}</label>
                <select
                  className="form-select"
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                >
                  <option value="Pending">{t('statusPending')}</option>
                  <option value="In Progress">{t('statusInProgress')}</option>
                  <option value="Completed">{t('statusCompleted')}</option>
                </select>
              </div>
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
              {editingAssignment ? t('update') : t('create')}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleConfirmDelete}
        itemName={deleteTarget?.title}
      />
    </div>
  );
};
