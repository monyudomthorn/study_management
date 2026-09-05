import React, { useState, useMemo, useRef } from 'react';
import * as XLSX from 'xlsx';
import { useData } from '../context/DataContext';
import { useLanguage } from '../context/LanguageContext';
import { useToast } from '../context/ToastContext';
import { Button } from '../components/Button';
import { ProgressBar } from '../components/ProgressBar';
import { Badge } from '../components/Badge';
import { Modal } from '../components/Modal';
import { ConfirmModal } from '../components/ConfirmModal';

export const Subjects = () => {
  const { subjects, teachers, addSubject, addSubjectsBatch, updateSubject, deleteSubject } = useData();
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

  // Excel Import Modal States
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [importedSubjects, setImportedSubjects] = useState([]);
  const [importFileName, setImportFileName] = useState('');
  const [importStrategy, setImportStrategy] = useState('append'); // 'append' | 'replace'
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef(null);

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

  // ==========================================
  // EXCEL IMPORT & EXPORT LOGIC
  // ==========================================
  const handleOpenImportModal = () => {
    setImportedSubjects([]);
    setImportFileName('');
    setImportStrategy('append');
    setIsImportModalOpen(true);
  };

  const processExcelFile = (file) => {
    if (!file) return;

    setImportFileName(file.name);
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        const rawRows = XLSX.utils.sheet_to_json(worksheet, { defval: '' });

        if (!rawRows || rawRows.length === 0) {
          addToast(t('noValidRowsFound'), 'warning');
          setImportedSubjects([]);
          return;
        }

        // Map flexible column headers
        const parsed = rawRows
          .map((row, idx) => {
            const keys = Object.keys(row);
            const findVal = (possibleNames) => {
              for (const name of possibleNames) {
                const foundKey = keys.find(
                  (k) => k.trim().toLowerCase() === name.toLowerCase()
                );
                if (foundKey && String(row[foundKey]).trim()) {
                  return String(row[foundKey]).trim();
                }
              }
              return '';
            };

            const name = findVal([
              'Subject Name',
              'Name',
              'Subject',
              'Course Name',
              'Course',
              'Title',
              'ឈ្មោះមុខវិជ្ជា',
              'មុខវិជ្ជា'
            ]);

            const code = findVal([
              'Subject Code',
              'Code',
              'Course Code',
              'កូដមុខវិជ្ជា',
              'កូដ'
            ]) || `SUB-${String(idx + 1).padStart(3, '0')}`;

            const teacher = findVal([
              'Assigned Teacher',
              'Teacher',
              'Instructor',
              'Professor',
              'Lecturer',
              'សាស្ត្រាចារ្យ'
            ]) || (teachers.length > 0 ? teachers[0].name : 'Assigned Teacher');

            let rawProg = findVal([
              'Progress (%)',
              'Progress',
              'Progress Percentage',
              'Percentage',
              'ភាគរយ',
              'វឌ្ឍនភាព'
            ]);
            let progress = Number(rawProg);
            if (isNaN(progress)) progress = 0;
            progress = Math.min(100, Math.max(0, progress));

            let status = findVal([
              'Status',
              'Current Status',
              'ស្ថានភាព'
            ]);

            if (!status) {
              status = progress === 100 ? 'Completed' : progress > 0 ? 'In Progress' : 'Not Started';
            }

            const description = findVal([
              'Description',
              'Notes',
              'Course Notes',
              'Description / Course Notes',
              'ការពិពណ៌នា'
            ]);

            return {
              name,
              code,
              teacher,
              progress,
              status,
              description
            };
          })
          .filter((s) => s.name && s.name.length > 0);

        if (parsed.length === 0) {
          addToast(t('noValidRowsFound'), 'error');
          setImportedSubjects([]);
          return;
        }

        setImportedSubjects(parsed);
        addToast(`Found ${parsed.length} subject(s) in "${file.name}"!`, 'success');
      } catch (err) {
        console.error('Error parsing Excel:', err);
        addToast(t('importError'), 'error');
        setImportedSubjects([]);
      }
    };

    reader.readAsArrayBuffer(file);
  };

  const handleFileInputChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      processExcelFile(file);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processExcelFile(file);
    }
  };

  const handleConfirmImport = () => {
    if (importedSubjects.length === 0) {
      addToast(t('noFileSelected'), 'error');
      return;
    }

    addSubjectsBatch(importedSubjects, importStrategy === 'replace');
    addToast(
      `${importedSubjects.length} ${t('importSubjectsSuccess')}`,
      'success'
    );
    setIsImportModalOpen(false);
    setImportedSubjects([]);
  };

  const handleDownloadTemplate = () => {
    const templateData = [
      {
        "Subject Name": "Computer Accounting",
        "Subject Code": "C A/C",
        "Assigned Teacher": "PHON Phanith",
        "Progress (%)": 85,
        "Status": "In Progress",
        "Description": ""
      },
      {
        "Subject Name": "Web Development II",
        "Subject Code": "WD II",
        "Assigned Teacher": "HENG Monorom",
        "Progress (%)": 0,
        "Status": "Not Started",
        "Description": ""
      },
      {
        "Subject Name": "C# Programming II",
        "Subject Code": "C# II",
        "Assigned Teacher": "CHOEURN Pinchai",
        "Progress (%)": 0,
        "Status": "Not Started",
        "Description": ""
      },
      {
        "Subject Name": "Networking I",
        "Subject Code": "NET I",
        "Assigned Teacher": "PHAN Sopha",
        "Progress (%)": 0,
        "Status": "Not Started",
        "Description": ""
      }
    ];

    const worksheet = XLSX.utils.json_to_sheet(templateData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Subjects Template");
    XLSX.writeFile(workbook, "subjects_sample_template.xlsx");
    addToast(t('downloadSubjectTemplate') + ' downloaded!', 'info');
  };

  const handleExportExcel = () => {
    if (subjects.length === 0) {
      addToast(t('noSubjectsFound'), 'warning');
      return;
    }

    const exportData = subjects.map((s) => ({
      "Subject Name": s.name,
      "Subject Code": s.code,
      "Assigned Teacher": s.teacher,
      "Progress (%)": s.progress,
      "Status": s.status,
      "Description": s.description || ''
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Subjects");
    XLSX.writeFile(workbook, `setec_subjects_export_${Date.now()}.xlsx`);
    addToast(t('exportExcel') + ' downloaded successfully!', 'success');
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

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={handleExportExcel}
            title={t('exportExcel')}
            style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <i className="ri-file-download-line"></i>
            <span className="hide-mobile">{t('exportExcel')}</span>
          </button>

          <button
            type="button"
            className="btn btn-secondary"
            onClick={handleOpenImportModal}
            id="btn-import-subjects-excel"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              color: '#10b981',
              borderColor: 'rgba(16, 185, 129, 0.4)',
              background: 'rgba(16, 185, 129, 0.08)'
            }}
          >
            <i className="ri-file-excel-2-line"></i>
            <span>{t('importExcel')}</span>
          </button>

          <Button
            variant="primary"
            onClick={handleOpenAddModal}
            id="btn-add-subject"
            icon={<i className="ri-add-line"></i>}
          >
            {t('inputSubject')}
          </Button>
        </div>
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
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
            <Button
              variant="primary"
              onClick={handleOpenAddModal}
              icon={<i className="ri-add-line"></i>}
            >
              {t('inputSubject')}
            </Button>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={handleOpenImportModal}
              style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <i className="ri-file-excel-2-line" style={{ color: '#10b981' }}></i>
              {t('importExcel')}
            </button>
          </div>
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

      {/* Modal for Excel Import */}
      <Modal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        title={t('modalImportSubjects')}
      >
        <div className="modal-body" style={{ maxHeight: '70vh', overflowY: 'auto' }}>
          {/* Top Info & Template Download */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '12px 16px',
              background: 'rgba(16, 185, 129, 0.08)',
              border: '1px solid rgba(16, 185, 129, 0.25)',
              borderRadius: '8px',
              marginBottom: '16px',
              flexWrap: 'wrap',
              gap: '10px'
            }}
          >
            <div>
              <div style={{ fontWeight: 600, color: '#10b981', fontSize: '0.9rem' }}>
                <i className="ri-information-line" style={{ marginRight: '6px' }}></i>
                Supported columns: <code>Subject Name</code>, <code>Subject Code</code>, <code>Assigned Teacher</code>, <code>Progress (%)</code>, <code>Status</code>, <code>Description</code>
              </div>
              <small style={{ color: 'var(--text-muted)' }}>
                Accepts .xlsx, .xls, and .csv files
              </small>
            </div>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={handleDownloadTemplate}
              style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <i className="ri-download-2-line" style={{ color: '#10b981' }}></i>
              {t('downloadSubjectTemplate')}
            </button>
          </div>

          {/* Drag & Drop Dropzone */}
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragOver(true);
            }}
            onDragLeave={() => setIsDragOver(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            style={{
              border: `2px dashed ${isDragOver ? '#10b981' : 'var(--border-subtle, #334155)'}`,
              borderRadius: '12px',
              padding: '30px 20px',
              textAlign: 'center',
              cursor: 'pointer',
              background: isDragOver ? 'rgba(16, 185, 129, 0.05)' : 'var(--bg-surface-elevated, #1e293b)',
              transition: 'all 0.2s ease',
              marginBottom: '20px'
            }}
          >
            <input
              type="file"
              ref={fileInputRef}
              accept=".xlsx, .xls, .csv"
              style={{ display: 'none' }}
              onChange={handleFileInputChange}
            />
            <div style={{ fontSize: '2.5rem', color: isDragOver ? '#10b981' : '#64748b', marginBottom: '8px' }}>
              <i className="ri-file-excel-2-line"></i>
            </div>
            <div style={{ fontWeight: 600, fontSize: '0.95rem', color: '#ffffff', marginBottom: '4px' }}>
              {importFileName ? importFileName : t('uploadExcelPrompt')}
            </div>
            <small style={{ color: 'var(--text-muted)' }}>
              {importFileName ? 'Click or drag another file to replace' : 'Supports Microsoft Excel (.xlsx, .xls) and CSV'}
            </small>
          </div>

          {/* Parsed Subjects Preview */}
          {importedSubjects.length > 0 && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <h4 style={{ fontSize: '0.96rem', fontWeight: 700, color: '#ffffff', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <i className="ri-table-line" style={{ color: '#10b981' }}></i>
                  {t('previewSubjects')} ({importedSubjects.length})
                </h4>
              </div>

              {/* Preview Table */}
              <div style={{ maxHeight: '220px', overflowY: 'auto', border: '1px solid var(--border-subtle, #334155)', borderRadius: '8px', marginBottom: '16px' }}>
                <table className="custom-table" style={{ fontSize: '0.84rem' }}>
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>{t('colCode')}</th>
                      <th>{t('fieldName')}</th>
                      <th>{t('colTeacher')}</th>
                      <th>{t('colProgress')}</th>
                      <th>{t('colStatus')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {importedSubjects.map((item, idx) => (
                      <tr key={idx}>
                        <td style={{ color: 'var(--text-muted)' }}>{idx + 1}</td>
                        <td><span className="entity-code-badge">{item.code}</span></td>
                        <td style={{ fontWeight: 600, color: '#ffffff' }}>{item.name}</td>
                        <td>{item.teacher}</td>
                        <td>{item.progress}%</td>
                        <td><Badge type="status" value={item.status} /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Import Strategy Options */}
              <div style={{ background: 'var(--bg-surface-elevated, #1e293b)', padding: '14px 16px', borderRadius: '8px', border: '1px solid var(--border-subtle, #334155)' }}>
                <label className="form-label" style={{ marginBottom: '8px' }}>
                  {t('importMode')}
                </label>
                <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.88rem' }}>
                    <input
                      type="radio"
                      name="importStrategySubjects"
                      value="append"
                      checked={importStrategy === 'append'}
                      onChange={() => setImportStrategy('append')}
                    />
                    <span>{t('appendModeSubjects')}</span>
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.88rem' }}>
                    <input
                      type="radio"
                      name="importStrategySubjects"
                      value="replace"
                      checked={importStrategy === 'replace'}
                      onChange={() => setImportStrategy('replace')}
                    />
                    <span style={{ color: '#f59e0b' }}>{t('replaceModeSubjects')}</span>
                  </label>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="modal-footer">
          <Button
            variant="secondary"
            onClick={() => setIsImportModalOpen(false)}
            icon={<i className="ri-close-line"></i>}
          >
            {t('cancel')}
          </Button>
          <Button
            variant="primary"
            onClick={handleConfirmImport}
            disabled={importedSubjects.length === 0}
            icon={<i className="ri-file-upload-line"></i>}
          >
            {importedSubjects.length > 0
              ? `${t('confirmImportSubjects')} (${importedSubjects.length})`
              : t('confirmImportSubjects')}
          </Button>
        </div>
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

