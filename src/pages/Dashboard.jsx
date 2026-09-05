import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useData } from '../context/DataContext';
import { useLanguage } from '../context/LanguageContext';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';
import { StatCard } from '../components/StatCard';
import { ProgressBar } from '../components/ProgressBar';
import { Badge } from '../components/Badge';
import { Button } from '../components/Button';
import { ConfirmModal } from '../components/ConfirmModal';
import { Modal } from '../components/Modal';
import { UserAvatar } from '../components/UserAvatar';

export const Dashboard = () => {
  const {
    subjects,
    teachers,
    practices,
    assignments,
    calculateOverallProgress,
    toggleAssignmentComplete,
    deleteAssignment,
    updateAssignment,
    addAssignment
  } = useData();

  const { currentUser } = useAuth();
  const { t } = useLanguage();
  const { addToast } = useToast();

  // Deletion modal state
  const [deleteTarget, setDeleteTarget] = useState(null);

  // Edit / Input Assignment Modal State
  const [isAssignmentModalOpen, setIsAssignmentModalOpen] = useState(false);
  const [editingAssignment, setEditingAssignment] = useState(null);
  const [assignmentForm, setAssignmentForm] = useState({
    title: '',
    subject: '',
    description: '',
    dueDate: '',
    priority: 'Medium',
    status: 'Pending'
  });

  const overallProgress = calculateOverallProgress();

  // Recent assignments
  const recentAssignments = assignments.slice(0, 5);

  const handleOpenAddAssignment = () => {
    setEditingAssignment(null);
    setAssignmentForm({
      title: '',
      subject: subjects.length > 0 ? subjects[0].name : '',
      description: '',
      dueDate: new Date().toISOString().split('T')[0],
      priority: 'Medium',
      status: 'Pending'
    });
    setIsAssignmentModalOpen(true);
  };

  const handleOpenEditAssignment = (asg) => {
    setEditingAssignment(asg);
    setAssignmentForm({
      title: asg.title,
      subject: asg.subject,
      description: asg.description || '',
      dueDate: asg.dueDate,
      priority: asg.priority,
      status: asg.status
    });
    setIsAssignmentModalOpen(true);
  };

  const handleSaveAssignment = (e) => {
    e.preventDefault();
    if (!assignmentForm.title.trim() || !assignmentForm.subject.trim() || !assignmentForm.dueDate) {
      addToast(t('errorRequiredFields'), 'error');
      return;
    }

    if (editingAssignment) {
      updateAssignment(editingAssignment.id, assignmentForm);
      addToast(t('assignmentUpdatedSuccess'), 'success');
    } else {
      addAssignment(assignmentForm);
      addToast(t('assignmentAddedSuccess'), 'success');
    }

    setIsAssignmentModalOpen(false);
  };

  const handleConfirmDelete = () => {
    if (deleteTarget) {
      deleteAssignment(deleteTarget.id);
      addToast(t('itemDeletedSuccess'), 'success');
      setDeleteTarget(null);
    }
  };

  return (
    <div className="dashboard-page">
      {/* Welcome Banner */}
      <div className="page-header-bar">
        <div className="page-title-group" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <UserAvatar user={currentUser} size={54} />
          <div>
            <h2>
              {t('welcomeBack')}{' '}
              <span style={{ color: 'var(--primary-light)' }}>
                {currentUser?.name || 'SETEC'}
              </span>
            </h2>
            <p>{currentUser?.role || t('studentRole')} — {currentUser?.university || t('university')}</p>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <Button
            variant="primary"
            onClick={handleOpenAddAssignment}
            icon={<i className="ri-add-circle-line"></i>}
          >
            {t('inputAssignment')}
          </Button>
        </div>
      </div>

      {/* 4 Summary Cards */}
      <div className="stats-grid">
        <StatCard
          title={t('statTotalSubjects')}
          value={`${subjects.length} ${t('navSubjects')}`}
          description={t('activeCourses')}
          icon={<i className="ri-book-open-line"></i>}
          accentColor="linear-gradient(135deg, #059669, #10b981)"
        />
        <StatCard
          title={t('statTotalTeachers')}
          value={`${teachers.length} ${t('navTeachers')}`}
          description={t('mentorsAndProfessors')}
          icon={<i className="ri-user-star-line"></i>}
          accentColor="linear-gradient(135deg, #047857, #34d399)"
        />
        <StatCard
          title={t('statPracticeTasks')}
          value={`${practices.length} ${t('navPractice')}`}
          description={`${practices.filter((p) => p.status === 'Completed').length} ${t('completedPractices')}`}
          icon={<i className="ri-task-line"></i>}
          accentColor="linear-gradient(135deg, #10b981, #6ee7b7)"
        />
        <StatCard
          title={t('statAssignments')}
          value={`${assignments.length} ${t('navAssignments')}`}
          description={`${assignments.filter((a) => a.status !== 'Completed').length} ${t('pendingSubmissions')}`}
          icon={<i className="ri-clipboard-line"></i>}
          accentColor="linear-gradient(135deg, #f59e0b, #fbbf24)"
        />
      </div>

      {/* Overall Study Progress Section */}
      <div className="progress-hero-card">
        <div className="progress-hero-content">
          <div className="progress-hero-details">
            <h3>{t('overallStudyProgress')}</h3>
            <p>{t('progressCalculatedDesc')}</p>
            <ProgressBar
              progress={overallProgress}
              thick={true}
              variant="auto"
              showLabel={false}
            />
          </div>
          <div className="progress-percentage-hero">
            {overallProgress}<span>%</span>
          </div>
        </div>
      </div>

      {/* Subject Progress Breakdown Cards */}
      <div style={{ marginBottom: '32px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#ffffff', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <i className="ri-pie-chart-line" style={{ color: 'var(--primary-light)' }}></i>
            {t('subjectBreakdown')}
          </h3>
          <Link
            to="/subjects"
            style={{ color: 'var(--primary-light)', fontSize: '0.86rem', textDecoration: 'none', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}
          >
            {t('navSubjects')} <i className="ri-arrow-right-line"></i>
          </Link>
        </div>

        <div className="cards-grid-3">
          {subjects.slice(0, 3).map((sub) => (
            <div key={sub.id} className="card" style={{ padding: '18px 20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ fontWeight: 700, color: '#ffffff', fontSize: '0.98rem' }}>{sub.name}</span>
                <span className="entity-code-badge">{sub.code}</span>
              </div>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.82rem', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <i className="ri-user-line" style={{ color: 'var(--primary-light)' }}></i>
                {sub.teacher}
              </p>
              <ProgressBar progress={sub.progress} label={t('colProgress')} variant="auto" />
            </div>
          ))}
        </div>
      </div>

      {/* Recent Assignments Section */}
      <div className="card" style={{ padding: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', flexWrap: 'wrap', gap: '10px' }}>
          <div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#ffffff', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <i className="ri-time-line" style={{ color: 'var(--primary-light)' }}></i>
              {t('recentAssignments')}
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.84rem' }}>
              {t('assignmentsSubheading')}
            </p>
          </div>
          <Link
            to="/assignments"
            style={{ color: 'var(--primary-light)', fontSize: '0.88rem', fontWeight: 600, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px' }}
          >
            {t('viewAllAssignments')} <i className="ri-arrow-right-line"></i>
          </Link>
        </div>

        {recentAssignments.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">
              <i className="ri-inbox-line"></i>
            </div>
            <h3>{t('noRecentAssignments')}</h3>
            <Button
              variant="primary"
              onClick={handleOpenAddAssignment}
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
                {recentAssignments.map((asg) => (
                  <tr key={asg.id}>
                    <td>
                      <div style={{ fontWeight: 600, color: '#ffffff' }}>{asg.title}</div>
                      {asg.description && (
                        <div style={{ color: 'var(--text-muted)', fontSize: '0.78rem', maxWidth: '320px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {asg.description}
                        </div>
                      )}
                    </td>
                    <td>
                      <span className="task-subject-tag">{asg.subject}</span>
                    </td>
                    <td>
                      <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                        <i className="ri-calendar-line" style={{ marginRight: '4px' }}></i>
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
                          variant={asg.status === 'Completed' ? 'secondary' : 'success'}
                          onClick={() => toggleAssignmentComplete(asg.id)}
                          icon={<i className={asg.status === 'Completed' ? 'ri-arrow-go-back-line' : 'ri-checkbox-circle-line'}></i>}
                          title={t('markComplete')}
                        />
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => handleOpenEditAssignment(asg)}
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
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Input / Update Assignment Modal */}
      <Modal
        isOpen={isAssignmentModalOpen}
        onClose={() => setIsAssignmentModalOpen(false)}
        title={editingAssignment ? t('modalEditAssignment') : t('modalAddAssignment')}
      >
        <form onSubmit={handleSaveAssignment}>
          <div className="modal-body">
            <div className="form-group">
              <label className="form-label">{t('fieldAssignmentTitle')} *</label>
              <input
                type="text"
                className="form-input"
                placeholder={t('placeholderAssignmentTitle')}
                value={assignmentForm.title}
                onChange={(e) => setAssignmentForm({ ...assignmentForm, title: e.target.value })}
                required
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">{t('colSubject')} *</label>
                {subjects.length > 0 ? (
                  <select
                    className="form-select"
                    value={assignmentForm.subject}
                    onChange={(e) => setAssignmentForm({ ...assignmentForm, subject: e.target.value })}
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
                    value={assignmentForm.subject}
                    onChange={(e) => setAssignmentForm({ ...assignmentForm, subject: e.target.value })}
                    required
                  />
                )}
              </div>

              <div className="form-group">
                <label className="form-label">{t('fieldDueDate')} *</label>
                <input
                  type="date"
                  className="form-input"
                  value={assignmentForm.dueDate}
                  onChange={(e) => setAssignmentForm({ ...assignmentForm, dueDate: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">{t('fieldPriority')}</label>
                <select
                  className="form-select"
                  value={assignmentForm.priority}
                  onChange={(e) => setAssignmentForm({ ...assignmentForm, priority: e.target.value })}
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
                  value={assignmentForm.status}
                  onChange={(e) => setAssignmentForm({ ...assignmentForm, status: e.target.value })}
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
                value={assignmentForm.description}
                onChange={(e) => setAssignmentForm({ ...assignmentForm, description: e.target.value })}
              />
            </div>
          </div>

          <div className="modal-footer">
            <Button
              variant="secondary"
              onClick={() => setIsAssignmentModalOpen(false)}
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
