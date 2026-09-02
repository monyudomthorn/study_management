import React, { useState, useMemo, useRef } from 'react';
import * as XLSX from 'xlsx';
import { useData } from '../context/DataContext';
import { useLanguage } from '../context/LanguageContext';
import { useToast } from '../context/ToastContext';
import { Button } from '../components/Button';
import { Modal } from '../components/Modal';
import { ConfirmModal } from '../components/ConfirmModal';

export const Teachers = () => {
  const { teachers, addTeacher, addTeachersBatch, updateTeacher, deleteTeacher } = useData();
  const { t } = useLanguage();
  const { addToast } = useToast();

  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  // Excel Import Modal States
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [importedTeachers, setImportedTeachers] = useState([]);
  const [importFileName, setImportFileName] = useState('');
  const [importStrategy, setImportStrategy] = useState('append'); // 'append' | 'replace'
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef(null);

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

  // ==========================================
  // EXCEL IMPORT & EXPORT LOGIC
  // ==========================================
  const handleOpenImportModal = () => {
    setImportedTeachers([]);
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
          setImportedTeachers([]);
          return;
        }

        // Map flexible column headers
        const parsed = rawRows
          .map((row) => {
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
              'Teacher Name',
              'Name',
              'Teacher',
              'Full Name',
              'ឈ្មោះ',
              'ឈ្មោះសាស្ត្រាចារ្យ'
            ]);

            const subject = findVal([
              'Subject / Specialty',
              'Subject',
              'Specialty',
              'Department',
              'Course',
              'មុខវិជ្ជា',
              'ជំនាញ'
            ]);

            let telegram = findVal([
              'Telegram',
              'Telegram Username',
              'Telegram Handle',
              'តេឡេក្រាម',
              'Contact'
            ]);

            if (telegram && !telegram.startsWith('@')) {
              telegram = `@${telegram}`;
            }

            const description = findVal([
              'Description',
              'Bio',
              'Teacher Bio',
              'Room',
              'Notes',
              'Office Hours',
              'ការពិពណ៌នា'
            ]);

            return {
              name,
              subject: subject || 'General Subject',
              telegram,
              description
            };
          })
          .filter((t) => t.name.length > 0);

        if (parsed.length === 0) {
          addToast(t('noValidRowsFound'), 'error');
          setImportedTeachers([]);
          return;
        }

        setImportedTeachers(parsed);
        addToast(`Found ${parsed.length} teacher(s) in "${file.name}"!`, 'success');
      } catch (err) {
        console.error('Error parsing Excel:', err);
        addToast(t('importError'), 'error');
        setImportedTeachers([]);
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
    if (importedTeachers.length === 0) {
      addToast(t('noFileSelected'), 'error');
      return;
    }

    addTeachersBatch(importedTeachers, importStrategy === 'replace');
    addToast(
      `${importedTeachers.length} ${t('importSuccess')}`,
      'success'
    );
    setIsImportModalOpen(false);
    setImportedTeachers([]);
  };

  const handleDownloadTemplate = () => {
    const templateData = [
      {
        "Teacher Name": "Dr. Mengly Khorn",
        "Subject / Specialty": "Database Systems & SQL",
        "Telegram": "@mengly_khorn",
        "Description": "Building A, Room 302 | Office hours: Mon-Wed 2PM-4PM"
      },
      {
        "Teacher Name": "Prof. Sokchea Chan",
        "Subject / Specialty": "Web Development with React",
        "Telegram": "@sokchea_chan",
        "Description": "Lab 3, Floor 2 | Office hours: Tue-Thu 10AM-12PM"
      },
      {
        "Teacher Name": "Ms. Sreynoch Bun",
        "Subject / Specialty": "Enterprise System Analysis",
        "Telegram": "@sreynoch_bun",
        "Description": "Building B, Room 204 | Office hours: Friday 1PM-3PM"
      },
      {
        "Teacher Name": "Mr. Vanna Sam",
        "Subject / Specialty": "Network Infrastructure",
        "Telegram": "@vanna_sam",
        "Description": "Network Lab, Floor 1 | Office hours: Mon-Fri 8AM-11AM"
      }
    ];

    const worksheet = XLSX.utils.json_to_sheet(templateData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Teachers Template");
    XLSX.writeFile(workbook, "teachers_sample_template.xlsx");
    addToast(t('downloadTemplate') + ' downloaded!', 'info');
  };

  const handleExportExcel = () => {
    if (teachers.length === 0) {
      addToast(t('noTeachersFound'), 'warning');
      return;
    }

    const exportData = teachers.map((t) => ({
      "Teacher Name": t.name,
      "Subject / Specialty": t.subject,
      "Telegram": t.telegram || '',
      "Description": t.description || ''
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Teachers");
    XLSX.writeFile(workbook, `setec_teachers_export_${Date.now()}.xlsx`);
    addToast(t('exportExcel') + ' downloaded successfully!', 'success');
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
            id="btn-import-excel"
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
            id="btn-add-teacher"
            icon={<i className="ri-user-add-line"></i>}
          >
            {t('inputTeacher')}
          </Button>
        </div>
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
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
            <Button
              variant="primary"
              onClick={handleOpenAddModal}
              icon={<i className="ri-user-add-line"></i>}
            >
              {t('inputTeacher')}
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
                        {tea.avatar || getInitials(tea.name)}
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

      {/* Modal for Excel Import */}
      <Modal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        title={t('modalImportTeachers')}
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
                Supported columns: <code>Name</code>, <code>Subject</code>, <code>Telegram</code>, <code>Description</code>
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
              {t('downloadTemplate')}
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

          {/* Parsed Teachers Preview */}
          {importedTeachers.length > 0 && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <h4 style={{ fontSize: '0.96rem', fontWeight: 700, color: '#ffffff', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <i className="ri-table-line" style={{ color: '#10b981' }}></i>
                  {t('previewTeachers')} ({importedTeachers.length})
                </h4>
              </div>

              {/* Preview Table */}
              <div style={{ maxHeight: '220px', overflowY: 'auto', border: '1px solid var(--border-subtle, #334155)', borderRadius: '8px', marginBottom: '16px' }}>
                <table className="custom-table" style={{ fontSize: '0.84rem' }}>
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>{t('fieldTeacherName')}</th>
                      <th>{t('fieldSpecialty')}</th>
                      <th>{t('fieldTelegram')}</th>
                      <th>{t('fieldTeacherBio')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {importedTeachers.map((item, idx) => (
                      <tr key={idx}>
                        <td style={{ color: 'var(--text-muted)' }}>{idx + 1}</td>
                        <td style={{ fontWeight: 600, color: '#ffffff' }}>{item.name}</td>
                        <td>
                          <span className="teacher-dept-tag" style={{ fontSize: '0.75rem', padding: '2px 8px' }}>
                            {item.subject}
                          </span>
                        </td>
                        <td>
                          {item.telegram ? (
                            <span style={{ color: '#229ed9' }}>{item.telegram}</span>
                          ) : (
                            <span style={{ color: 'var(--text-muted)' }}>—</span>
                          )}
                        </td>
                        <td style={{ color: 'var(--text-muted)', maxWidth: '200px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {item.description || '—'}
                        </td>
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
                      name="importStrategy"
                      value="append"
                      checked={importStrategy === 'append'}
                      onChange={() => setImportStrategy('append')}
                    />
                    <span>{t('appendMode')}</span>
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.88rem' }}>
                    <input
                      type="radio"
                      name="importStrategy"
                      value="replace"
                      checked={importStrategy === 'replace'}
                      onChange={() => setImportStrategy('replace')}
                    />
                    <span style={{ color: '#f59e0b' }}>{t('replaceMode')}</span>
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
            disabled={importedTeachers.length === 0}
            icon={<i className="ri-file-upload-line"></i>}
          >
            {importedTeachers.length > 0
              ? `${t('confirmImport')} (${importedTeachers.length})`
              : t('confirmImport')}
          </Button>
        </div>
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

