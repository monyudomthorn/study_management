import React, { useState, useMemo, useEffect } from 'react';
import { useData } from '../context/DataContext';
import { useLanguage } from '../context/LanguageContext';
import { useToast } from '../context/ToastContext';
import { Button } from '../components/Button';
import { Badge } from '../components/Badge';
import { Modal } from '../components/Modal';
import { ConfirmModal } from '../components/ConfirmModal';
import { StatCard } from '../components/StatCard';
import {
  formatDateDDMMMMYYYY,
  getDayOfWeek,
  isAllowedDay,
  ALLOWED_DAYS,
  DAY_NAMES_MAP,
  ATTENDANCE_TIME_SLOTS,
  ATTENDANCE_STATUSES,
  getTodayAcademicInfo,
  getWeekDates,
  getWeekRangeText,
  getWeekNumberFromDate,
  TOTAL_SEMESTER_WEEKS,
  WEEKLY_TIMETABLE_TEMPLATE
} from '../utils/dateUtils';
import {
  loadFromStorage,
  saveToStorage,
  STORAGE_KEYS
} from '../utils/localStorage';

export const Attendance = () => {
  const {
    attendances,
    subjects,
    teachers,
    addAttendance,
    batchAddAttendances,
    updateAttendance,
    deleteAttendance,
    getAttendanceStats
  } = useData();

  const { t, lang } = useLanguage();
  const { addToast } = useToast();

  // Number of active/added weeks visible to user (default: 1 or saved in localStorage)
  const [visibleWeeks, setVisibleWeeks] = useState(() => {
    const saved = loadFromStorage(STORAGE_KEYS.VISIBLE_WEEKS, 1);
    const parsed = parseInt(saved, 10);
    return !isNaN(parsed) && parsed >= 1 ? Math.min(TOTAL_SEMESTER_WEEKS, parsed) : 1;
  });

  // Week Navigation State: 1..visibleWeeks or 'All'
  const [selectedWeek, setSelectedWeek] = useState(1);

  // Search & Filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [dayFilter, setDayFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [subjectFilter, setSubjectFilter] = useState('All');
  const [viewMode, setViewMode] = useState('table'); // Default to table matching user screenshot

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAttendance, setEditingAttendance] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteWeekTarget, setDeleteWeekTarget] = useState(null);

  // Automatically ensure visibleWeeks covers any existing attendance data
  useEffect(() => {
    let maxWeekInData = 1;
    (attendances || []).forEach((att) => {
      if (att.date) {
        const wk = getWeekNumberFromDate(att.date);
        if (wk > maxWeekInData) {
          maxWeekInData = wk;
        }
      }
    });

    if (maxWeekInData > visibleWeeks) {
      const clamped = Math.min(TOTAL_SEMESTER_WEEKS, maxWeekInData);
      setVisibleWeeks(clamped);
      saveToStorage(STORAGE_KEYS.VISIBLE_WEEKS, clamped);
    }
  }, [attendances]);

  // Form State
  const [formDate, setFormDate] = useState('');
  const [formDay, setFormDay] = useState('');
  const [formFormattedDate, setFormFormattedDate] = useState('');
  const [formRemarks, setFormRemarks] = useState('');
  const [formSlots, setFormSlots] = useState([
    {
      slotId: 'slot-1',
      time: '7:00 – 8:30',
      subject: '',
      status: 'Present',
      room: '',
      teacher: '',
      notes: ''
    },
    {
      slotId: 'slot-2',
      time: '8:45 – 10:15',
      subject: '',
      status: 'Present',
      room: '',
      teacher: '',
      notes: ''
    },
    {
      slotId: 'slot-3',
      time: '10:15 – 11:45',
      subject: '',
      status: 'Present',
      room: '',
      teacher: '',
      notes: ''
    }
  ]);

  // Overall Statistics
  const stats = getAttendanceStats();

  // Add next week
  const handleAddWeek = () => {
    if (visibleWeeks >= TOTAL_SEMESTER_WEEKS) {
      addToast(t('maxWeeksReached'), 'warning');
      return;
    }
    const nextWeek = visibleWeeks + 1;
    setVisibleWeeks(nextWeek);
    saveToStorage(STORAGE_KEYS.VISIBLE_WEEKS, nextWeek);
    setSelectedWeek(nextWeek);
    addToast(
      lang === 'kh'
        ? `បានបន្ថែមសប្ដាហ៍ទី ${nextWeek} ដោយជោគជ័យ!`
        : `Week ${nextWeek} added successfully!`,
      'success'
    );
  };

  // Remove latest week if visibleWeeks > 1
  const handleRemoveLatestWeek = () => {
    if (visibleWeeks <= 1) return;
    const targetWk = visibleWeeks;
    const weekDays = getWeekDates(targetWk);
    const hasRecords = attendances.some((a) =>
      weekDays.some((dayObj) => a.date === dayObj.date || a.formattedDate === dayObj.formattedDate)
    );

    if (hasRecords) {
      setDeleteWeekTarget(targetWk);
    } else {
      const newCount = visibleWeeks - 1;
      setVisibleWeeks(newCount);
      saveToStorage(STORAGE_KEYS.VISIBLE_WEEKS, newCount);
      if (selectedWeek === targetWk) {
        setSelectedWeek(newCount);
      }
      addToast(
        lang === 'kh'
          ? `បានលុបសប្ដាហ៍ទី ${targetWk} រួចរាល់`
          : `Week ${targetWk} removed`,
        'info'
      );
    }
  };

  // Confirm delete week with attendance data
  const handleConfirmDeleteWeek = () => {
    if (!deleteWeekTarget) return;
    const weekDays = getWeekDates(deleteWeekTarget);
    const datesToRemove = new Set(weekDays.map((d) => d.date));
    const formattedDatesToRemove = new Set(weekDays.map((d) => d.formattedDate));

    // Delete all attendance records in that week
    const toDelete = attendances.filter(
      (a) => datesToRemove.has(a.date) || formattedDatesToRemove.has(a.formattedDate)
    );
    toDelete.forEach((a) => deleteAttendance(a.id));

    const newCount = Math.max(1, visibleWeeks - 1);
    setVisibleWeeks(newCount);
    saveToStorage(STORAGE_KEYS.VISIBLE_WEEKS, newCount);
    if (selectedWeek >= deleteWeekTarget) {
      setSelectedWeek(Math.max(1, deleteWeekTarget - 1));
    }
    setDeleteWeekTarget(null);
    addToast(
      lang === 'kh'
        ? `បានលុបសប្ដាហ៍ទី ${deleteWeekTarget} និងកំណត់ត្រារួចរាល់`
        : `Week ${deleteWeekTarget} and its records removed successfully!`,
      'success'
    );
  };

  // Week Completion Helper
  const getWeekCompletion = (w) => {
    if (w === 'All') {
      return { markedCount: attendances.length, total: attendances.length, isComplete: false };
    }
    const weekDays = getWeekDates(w);
    const markedCount = weekDays.filter((dayObj) =>
      attendances.some(
        (a) => a.date === dayObj.date || a.formattedDate === dayObj.formattedDate
      )
    ).length;
    return {
      markedCount,
      total: weekDays.length,
      isComplete: markedCount === weekDays.length && weekDays.length > 0
    };
  };

  const currentWeekRange = useMemo(() => {
    if (selectedWeek === 'All') return '';
    return getWeekRangeText(selectedWeek);
  }, [selectedWeek]);

  const currentWeekCompletion = useMemo(() => {
    return getWeekCompletion(selectedWeek);
  }, [selectedWeek, attendances]);

  // Week navigation arrows
  const handlePrevWeek = () => {
    if (selectedWeek === 'All') {
      setSelectedWeek(1);
      return;
    }
    if (selectedWeek > 1) {
      setSelectedWeek(selectedWeek - 1);
    }
  };

  const handleNextWeek = () => {
    if (selectedWeek === 'All') {
      setSelectedWeek(1);
      return;
    }
    if (selectedWeek < visibleWeeks) {
      setSelectedWeek(selectedWeek + 1);
    }
  };

  // Generate Raw Records for Active View (Week or All)
  const rawRecordsForView = useMemo(() => {
    if (selectedWeek === 'All') {
      return [...attendances].sort((a, b) => (b.date || '').localeCompare(a.date || ''));
    }

    const weekDays = getWeekDates(selectedWeek);
    // Display Monday at the top through Saturday at the bottom
    return weekDays.map((dayObj) => {
      const found = attendances.find(
        (a) => a.date === dayObj.date || a.formattedDate === dayObj.formattedDate
      );

      if (found) {
        return {
          ...found,
          isUnmarked: false
        };
      }

      // Unmarked record with standard timetable schedule
      return {
        id: `unmarked-${dayObj.date}`,
        date: dayObj.date,
        formattedDate: dayObj.formattedDate,
        day: dayObj.day,
        slots: dayObj.defaultSlots.map((s) => ({
          ...s,
          status: null
        })),
        overallStatus: null,
        remarks: '',
        isUnmarked: true
      };
    });
  }, [selectedWeek, attendances]);

  // Filter records
  const filteredAttendances = useMemo(() => {
    return rawRecordsForView.filter((att) => {
      const formattedDate = att.formattedDate || formatDateDDMMMMYYYY(att.date);
      const query = searchTerm.toLowerCase();

      // Search match across formattedDate, day, subject names, notes, remarks
      const matchSearch =
        !searchTerm ||
        formattedDate.toLowerCase().includes(query) ||
        (att.day && att.day.toLowerCase().includes(query)) ||
        (att.remarks && att.remarks.toLowerCase().includes(query)) ||
        (att.slots &&
          att.slots.some(
            (s) =>
              (s.subject && s.subject.toLowerCase().includes(query)) ||
              (s.room && s.room.toLowerCase().includes(query)) ||
              (s.notes && s.notes.toLowerCase().includes(query))
          ));

      const matchDay = dayFilter === 'All' || att.day === dayFilter;

      const matchStatus =
        statusFilter === 'All' ||
        (!att.isUnmarked && att.overallStatus === statusFilter) ||
        (!att.isUnmarked && att.slots && att.slots.some((s) => s.status === statusFilter)) ||
        (att.isUnmarked && statusFilter === 'Not Marked');

      const matchSubject =
        subjectFilter === 'All' ||
        (att.slots && att.slots.some((s) => s.subject === subjectFilter));

      return matchSearch && matchDay && matchStatus && matchSubject;
    });
  }, [rawRecordsForView, searchTerm, dayFilter, statusFilter, subjectFilter]);

  // Handle Date Input Change in Modal
  const handleDateChange = (newDateStr) => {
    setFormDate(newDateStr);
    if (!newDateStr) {
      setFormDay('');
      setFormFormattedDate('');
      return;
    }

    const dayName = getDayOfWeek(newDateStr);
    const formatted = formatDateDDMMMMYYYY(newDateStr);
    setFormDay(dayName);
    setFormFormattedDate(formatted);

    // If day changed and not editing, prefill template subjects for that day
    if (!editingAttendance && WEEKLY_TIMETABLE_TEMPLATE[dayName]) {
      const template = WEEKLY_TIMETABLE_TEMPLATE[dayName];
      setFormSlots(
        template.map((s, idx) => ({
          slotId: s.slotId || `slot-${idx + 1}`,
          time: s.time || (ATTENDANCE_TIME_SLOTS[idx]?.time || '7:00 – 8:30'),
          subject: s.subject || '',
          status: 'Present',
          room: s.room || '',
          teacher: s.teacher || '',
          notes: s.notes || ''
        }))
      );
    }
  };

  const isFormSunday = useMemo(() => {
    if (!formDate) return false;
    return getDayOfWeek(formDate) === 'Sunday';
  }, [formDate]);

  // Open Add Modal
  const handleOpenAddModal = () => {
    setEditingAttendance(null);
    const todayInfo = getTodayAcademicInfo();
    const dayName = todayInfo.day;
    const template = WEEKLY_TIMETABLE_TEMPLATE[dayName] || [];

    setFormDate(todayInfo.isoDate);
    setFormDay(dayName);
    setFormFormattedDate(todayInfo.formattedDate);
    setFormRemarks('');

    setFormSlots(
      template.length === 3
        ? template.map((s, idx) => ({
            slotId: s.slotId || `slot-${idx + 1}`,
            time: s.time || (ATTENDANCE_TIME_SLOTS[idx]?.time || '7:00 – 8:30'),
            subject: s.subject || '',
            status: 'Present',
            room: s.room || '',
            teacher: s.teacher || '',
            notes: s.notes || ''
          }))
        : [
            { slotId: 'slot-1', time: '7:00 – 8:30', subject: '', status: 'Present', room: '', teacher: '', notes: '' },
            { slotId: 'slot-2', time: '8:45 – 10:15', subject: '', status: 'Present', room: '', teacher: '', notes: '' },
            { slotId: 'slot-3', time: '10:15 – 11:45', subject: '', status: 'Present', room: '', teacher: '', notes: '' }
          ]
    );
    setIsModalOpen(true);
  };

  // Open Record / Edit for a Specific Day (e.g. from table or cards)
  const handleOpenRecordDay = (record) => {
    const isUnmarked = !!record.isUnmarked;
    setEditingAttendance(isUnmarked ? null : record);
    setFormDate(record.date);
    setFormDay(record.day);
    setFormFormattedDate(record.formattedDate || formatDateDDMMMMYYYY(record.date));
    setFormRemarks(record.remarks || '');

    const templateSlots =
      record.slots && record.slots.length === 3
        ? record.slots
        : WEEKLY_TIMETABLE_TEMPLATE[record.day] || [];

    setFormSlots(
      templateSlots.map((s, idx) => ({
        slotId: s.slotId || `slot-${idx + 1}`,
        time: s.time || (ATTENDANCE_TIME_SLOTS[idx]?.time || '7:00 – 8:30'),
        subject: s.subject || '',
        status: s.status || 'Present',
        room: s.room || '',
        teacher: s.teacher || '',
        notes: s.notes || ''
      }))
    );
    setIsModalOpen(true);
  };

  // Open Edit Modal for an already saved record
  const handleOpenEditModal = (record) => {
    handleOpenRecordDay(record);
  };

  // Quick action: Mark all slots present
  const handleMarkAllPresent = () => {
    setFormSlots((prev) => prev.map((s) => ({ ...s, status: 'Present' })));
    addToast(t('markAllPresent'), 'info');
  };

  // Slot field update
  const handleSlotChange = (index, field, value) => {
    setFormSlots((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  // Submit Modal
  const handleFormSubmit = (e) => {
    e.preventDefault();

    if (!formDate) {
      addToast(t('errorInvalidDate'), 'error');
      return;
    }

    if (!isAllowedDay(formDate)) {
      addToast(t('errorSundayNotAllowed'), 'error');
      return;
    }

    const hasAnySubject = formSlots.some((s) => s.subject && s.subject.trim() !== '');
    if (!hasAnySubject) {
      addToast(t('errorSlotSubjects'), 'warning');
      return;
    }

    const recordData = {
      date: formDate,
      formattedDate: formFormattedDate || formatDateDDMMMMYYYY(formDate),
      day: formDay || getDayOfWeek(formDate),
      slots: formSlots,
      remarks: formRemarks
    };

    if (editingAttendance && editingAttendance.id && !String(editingAttendance.id).startsWith('unmarked-')) {
      updateAttendance(editingAttendance.id, recordData);
      addToast(t('attendanceUpdatedSuccess'), 'success');
    } else {
      addAttendance(recordData);
      addToast(t('attendanceAddedSuccess'), 'success');
    }

    setIsModalOpen(false);
  };

  // Bulk Mark Entire Week as Present
  const handleMarkEntireWeekPresent = () => {
    if (selectedWeek === 'All') return;

    const weekDays = getWeekDates(selectedWeek);
    const recordsToSave = weekDays.map((dayObj) => {
      const existing = attendances.find(
        (a) => a.date === dayObj.date || a.formattedDate === dayObj.formattedDate
      );
      if (existing) {
        return {
          ...existing,
          slots: (existing.slots || []).map((s) => ({
            ...s,
            status: s.status || 'Present'
          })),
          overallStatus: 'Present'
        };
      }
      return {
        date: dayObj.date,
        formattedDate: dayObj.formattedDate,
        day: dayObj.day,
        slots: dayObj.defaultSlots.map((s) => ({
          ...s,
          status: 'Present'
        })),
        overallStatus: 'Present',
        remarks: ''
      };
    });

    batchAddAttendances(recordsToSave);
    addToast(
      lang === 'kh'
        ? `បានកត់ត្រាវត្តមានសម្រាប់សប្ដាហ៍ទី ${selectedWeek} រួចរាល់!`
        : `Week ${selectedWeek} marked as present successfully!`,
      'success'
    );
  };

  // Confirm Delete
  const handleConfirmDelete = () => {
    if (deleteTarget) {
      deleteAttendance(deleteTarget.id);
      addToast(t('itemDeletedSuccess'), 'success');
      setDeleteTarget(null);
    }
  };

  // Export Attendance report as CSV
  const handleExportCSV = () => {
    if (attendances.length === 0) {
      addToast(t('noAttendanceFound'), 'warning');
      return;
    }

    let csvContent = 'data:text/csv;charset=utf-8,';
    csvContent +=
      'Date (DD-MMMM-YYYY),Day,7:00 – 8:30 Subject,Slot 1 Status,8:45 – 10:15 Subject,Slot 2 Status,10:15 – 11:45 Subject,Slot 3 Status,Overall Status,Remarks\n';

    attendances.forEach((a) => {
      const s1 = a.slots?.[0] || {};
      const s2 = a.slots?.[1] || {};
      const s3 = a.slots?.[2] || {};
      const row = [
        `"${a.formattedDate || formatDateDDMMMMYYYY(a.date)}"`,
        `"${a.day}"`,
        `"${s1.subject || ''}"`,
        `"${s1.status || ''}"`,
        `"${s2.subject || ''}"`,
        `"${s2.status || ''}"`,
        `"${s3.subject || ''}"`,
        `"${s3.status || ''}"`,
        `"${a.overallStatus || ''}"`,
        `"${(a.remarks || '').replace(/"/g, '""')}"`
      ].join(',');
      csvContent += row + '\n';
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `attendance_records_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  // Helper for status badge
  const getStatusBadge = (status) => {
    if (!status) return null;
    switch (status) {
      case 'Present':
        return <Badge variant="success" icon="ri-checkbox-circle-line">{t('statusPresent')}</Badge>;
      case 'Late':
        return <Badge variant="warning" icon="ri-time-line">{t('statusLate')}</Badge>;
      case 'Absent':
        return <Badge variant="danger" icon="ri-close-circle-line">{t('statusAbsent')}</Badge>;
      case 'Excused':
        return <Badge variant="info" icon="ri-shield-check-line">{t('statusExcused')}</Badge>;
      case 'No Class':
        return <Badge variant="default" icon="ri-pause-circle-line">{t('statusNoClass')}</Badge>;
      default:
        return <Badge variant="primary">{status}</Badge>;
    }
  };

  const getDayDisplayName = (dayName) => {
    if (lang === 'kh' && DAY_NAMES_MAP[dayName]) {
      return DAY_NAMES_MAP[dayName].kh;
    }
    return dayName;
  };

  const weekTabs = useMemo(() => {
    const list = [];
    for (let i = 1; i <= visibleWeeks; i++) {
      list.push(i);
    }
    return list;
  }, [visibleWeeks]);

  return (
    <div className="attendance-page">
      {/* Page Header */}
      <div className="page-header-bar">
        <div className="page-title-group">
          <h2>
            <i className="ri-calendar-check-line" style={{ color: 'var(--primary-light)', marginRight: '10px' }}></i>
            {t('attendanceHeading')}
          </h2>
          <p>{t('attendanceSubheading')}</p>
        </div>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <Button
            variant="outline"
            onClick={handleExportCSV}
            icon={<i className="ri-download-2-line"></i>}
          >
            {t('exportData')}
          </Button>
          <Button
            variant="primary"
            onClick={handleOpenAddModal}
            icon={<i className="ri-add-circle-line"></i>}
          >
            {t('inputAttendance')}
          </Button>
        </div>
      </div>

      {/* Summary Stat Cards */}
      <div className="stats-grid" style={{ marginBottom: '24px' }}>
        <StatCard
          title={t('statAttendanceRate')}
          value={`${stats.rate}%`}
          description={t('attendedClasses')}
          icon={<i className="ri-percent-line"></i>}
          accentColor="linear-gradient(135deg, #059669, #10b981)"
        />
        <StatCard
          title={t('statDaysLogged')}
          value={`${stats.totalDays}`}
          description={t('monToSatDays')}
          icon={<i className="ri-calendar-event-line"></i>}
          accentColor="linear-gradient(135deg, #047857, #34d399)"
        />
        <StatCard
          title={t('presentSessionsCount')}
          value={`${stats.presentCount} / ${stats.totalSlots}`}
          description={`${Math.round((stats.presentCount / (stats.totalSlots || 1)) * 100)}% on time`}
          icon={<i className="ri-checkbox-circle-fill"></i>}
          accentColor="linear-gradient(135deg, #10b981, #6ee7b7)"
        />
        <StatCard
          title={t('absentLimitTitle')}
          value={`${stats.absentDays} / 19`}
          description={
            stats.isDanger
              ? t('absentLimitDangerDesc')
              : stats.isWarning
              ? `${t('absentLimitWarningDesc')} (${stats.remainingAbsents} left)`
              : `${stats.remainingAbsents} ${t('absentLimitSafeDesc')}`
          }
          icon={
            <i
              className={
                stats.isDanger
                  ? 'ri-error-warning-fill'
                  : stats.isWarning
                  ? 'ri-alert-fill'
                  : 'ri-shield-check-line'
              }
            ></i>
          }
          accentColor={
            stats.isDanger
              ? 'linear-gradient(135deg, #dc2626, #ef4444)'
              : stats.isWarning
              ? 'linear-gradient(135deg, #d97706, #f59e0b)'
              : 'linear-gradient(135deg, #059669, #10b981)'
          }
        />
      </div>

      {/* Absence Danger Banner (>= 19 absences) */}
      {stats.isDanger && (
        <div className="absence-alert-banner banner-danger" style={{ marginBottom: '22px' }}>
          <div className="absence-alert-icon">
            <i className="ri-error-warning-fill"></i>
          </div>
          <div className="absence-alert-body">
            <h4>{t('absentLimitDangerDesc')}</h4>
            <p>{t('absentDangerBannerText')}</p>
            <div className="absence-meter-track">
              <div
                className="absence-meter-fill fill-danger"
                style={{ width: `${Math.min(100, (stats.absentDays / 19) * 100)}%` }}
              ></div>
            </div>
            <span className="absence-meter-label">
              {stats.absentDays} / 19 {t('absentDaysCount')} (0 {t('absentLimitSafeDesc')})
            </span>
          </div>
        </div>
      )}

      {/* Absence Warning Banner (>= 10 absences) */}
      {stats.isWarning && !stats.isDanger && (
        <div className="absence-alert-banner banner-warning" style={{ marginBottom: '22px' }}>
          <div className="absence-alert-icon">
            <i className="ri-alert-fill"></i>
          </div>
          <div className="absence-alert-body">
            <h4>{t('absentLimitWarningDesc')} ({stats.absentDays}/19)</h4>
            <p>{t('absentWarningBannerText').replace('{count}', stats.absentDays)}</p>
            <div className="absence-meter-track">
              <div
                className="absence-meter-fill fill-warning"
                style={{ width: `${Math.min(100, (stats.absentDays / 19) * 100)}%` }}
              ></div>
            </div>
            <span className="absence-meter-label">
              {stats.absentDays} / 19 {t('absentDaysCount')} ({stats.remainingAbsents} {t('absentLimitSafeDesc')})
            </span>
          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* ACADEMIC WEEK NAVIGATION BAR                         */}
      {/* ==================================================== */}
      <div className="week-selector-card" style={{ marginBottom: '22px' }}>
        {/* Top Header of the Week Card */}
        <div className="week-selector-header">
          <div className="week-header-info">
            <div className="week-badge-title">
              <i className="ri-calendar-todo-line"></i>
              <span>
                {selectedWeek === 'All'
                  ? t('allWeeks')
                  : `${lang === 'kh' ? 'សប្ដាហ៍ទី' : 'Week'} ${selectedWeek}`}
              </span>
            </div>
            {selectedWeek !== 'All' && (
              <span className="week-date-range-text">
                <i className="ri-time-line"></i> {currentWeekRange}
              </span>
            )}
          </div>

          <div className="week-header-status-actions">
            {selectedWeek !== 'All' && (
              <div className="week-completion-pill">
                {currentWeekCompletion.isComplete ? (
                  <span className="pill-complete">
                    <i className="ri-checkbox-circle-fill"></i> {currentWeekCompletion.markedCount}/6 {t('daysMarked')}
                  </span>
                ) : (
                  <span className="pill-pending">
                    <i className="ri-time-line"></i> {currentWeekCompletion.markedCount}/6 {t('daysMarked')}
                  </span>
                )}
              </div>
            )}

            {selectedWeek !== 'All' && !currentWeekCompletion.isComplete && (
              <button
                type="button"
                className="btn-mark-week-action"
                onClick={handleMarkEntireWeekPresent}
                title="Mark all 6 days in this week as present"
              >
                <i className="ri-check-double-line"></i>
                <span>{t('markAllWeekPresent')}</span>
              </button>
            )}

            {selectedWeek === visibleWeeks && visibleWeeks > 1 && (
              <button
                type="button"
                className="btn-remove-week-action"
                onClick={handleRemoveLatestWeek}
                title={t('removeWeekTooltip')}
              >
                <i className="ri-delete-bin-line"></i>
                <span>{t('removeWeek')}</span>
              </button>
            )}
          </div>
        </div>

        {/* Scrollable Week Pills List with Navigation Arrows */}
        <div className="week-nav-container">
          <button
            type="button"
            className="week-nav-arrow"
            onClick={handlePrevWeek}
            disabled={selectedWeek === 1}
            title="Previous Week"
          >
            <i className="ri-arrow-left-s-line"></i>
          </button>

          <div className="week-pills-scroll-track">
            {weekTabs.map((w) => {
              const comp = getWeekCompletion(w);
              const isActive = selectedWeek === w;
              return (
                <button
                  key={w}
                  type="button"
                  className={`week-pill-tab ${isActive ? 'active' : ''} ${comp.isComplete ? 'is-complete' : ''}`}
                  onClick={() => setSelectedWeek(w)}
                >
                  <span className="week-tab-label">
                    {lang === 'kh' ? `សប្ដាហ៍ ${w}` : `Week ${w}`}
                  </span>
                  <span className={`week-tab-indicator ${comp.isComplete ? 'dot-complete' : 'dot-pending'}`}>
                    {comp.isComplete ? (
                      <i className="ri-check-line"></i>
                    ) : (
                      `${comp.markedCount}/6`
                    )}
                  </span>
                </button>
              );
            })}

            {visibleWeeks < TOTAL_SEMESTER_WEEKS && (
              <button
                type="button"
                className="week-pill-tab week-pill-add-btn"
                onClick={handleAddWeek}
                title={`${t('addWeek')} (${lang === 'kh' ? 'សប្ដាហ៍ទី' : 'Week'} ${visibleWeeks + 1})`}
              >
                <i className="ri-add-line" style={{ fontSize: '1.05rem', color: 'var(--primary-light)' }}></i>
                <span className="week-tab-label">{t('addWeek')}</span>
              </button>
            )}

            <button
              type="button"
              className={`week-pill-tab ${selectedWeek === 'All' ? 'active' : ''}`}
              onClick={() => setSelectedWeek('All')}
            >
              <span className="week-tab-label">
                <i className="ri-list-check" style={{ marginRight: '4px' }}></i>
                {t('allWeeks')}
              </span>
              <span className="week-tab-indicator dot-neutral">
                {attendances.length}
              </span>
            </button>
          </div>

          <button
            type="button"
            className="week-nav-arrow"
            onClick={handleNextWeek}
            disabled={selectedWeek === visibleWeeks || selectedWeek === 'All'}
            title="Next Week"
          >
            <i className="ri-arrow-right-s-line"></i>
          </button>
        </div>
      </div>

      {/* Filter and View Mode Toolbar */}
      <div className="card toolbar-card" style={{ padding: '16px 20px', marginBottom: '22px' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '14px', alignItems: 'center', justifyContent: 'space-between' }}>
          {/* Search Bar */}
          <div className="search-bar" style={{ minWidth: '260px', flex: 1 }}>
            <i className="ri-search-line search-icon"></i>
            <input
              type="text"
              placeholder={t('searchAttendancePlaceholder')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
            {searchTerm && (
              <button
                className="search-clear-btn"
                onClick={() => setSearchTerm('')}
                title="Clear search"
              >
                <i className="ri-close-line"></i>
              </button>
            )}
          </div>

          {/* Filter Dropdowns */}
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            {/* Filter by Day (Mon-Sat) */}
            <select
              value={dayFilter}
              onChange={(e) => setDayFilter(e.target.value)}
              className="filter-select"
            >
              <option value="All">{t('allDays')}</option>
              {ALLOWED_DAYS.map((day) => (
                <option key={day} value={day}>
                  {getDayDisplayName(day)}
                </option>
              ))}
            </select>

            {/* Filter by Status */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="filter-select"
            >
              <option value="All">{t('allStatuses')}</option>
              <option value="Present">{t('statusPresent')}</option>
              <option value="Late">{t('statusLate')}</option>
              <option value="Absent">{t('statusAbsent')}</option>
              <option value="Excused">{t('statusExcused')}</option>
              <option value="No Class">{t('statusNoClass')}</option>
              <option value="Not Marked">{t('notMarked')}</option>
            </select>

            {/* Filter by Subject */}
            <select
              value={subjectFilter}
              onChange={(e) => setSubjectFilter(e.target.value)}
              className="filter-select"
            >
              <option value="All">{t('allSubjects')}</option>
              {subjects.map((sub) => (
                <option key={sub.id} value={sub.name}>
                  {sub.name}
                </option>
              ))}
            </select>

            {/* View Mode Toggle */}
            <div className="view-mode-pill-group">
              <button
                type="button"
                className={`view-pill-btn ${viewMode === 'table' ? 'active' : ''}`}
                onClick={() => setViewMode('table')}
                title={t('viewModeTable')}
              >
                <i className="ri-table-line"></i>
                <span className="hide-mobile">{t('viewModeTable')}</span>
              </button>
              <button
                type="button"
                className={`view-pill-btn ${viewMode === 'cards' ? 'active' : ''}`}
                onClick={() => setViewMode('cards')}
                title={t('viewModeCards')}
              >
                <i className="ri-layout-grid-line"></i>
                <span className="hide-mobile">{t('viewModeCards')}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      {filteredAttendances.length === 0 ? (
        <div className="card" style={{ padding: '48px 24px' }}>
          <div className="empty-state">
            <div className="empty-state-icon">
              <i className="ri-calendar-check-line"></i>
            </div>
            <h3>{t('noAttendanceFound')}</h3>
            <p style={{ color: 'var(--text-muted)', marginBottom: '16px' }}>
              {t('attendanceSubheading')}
            </p>
            <Button
              variant="primary"
              onClick={handleOpenAddModal}
              icon={<i className="ri-add-line"></i>}
            >
              {t('inputAttendance')}
            </Button>
          </div>
        </div>
      ) : viewMode === 'table' ? (
        /* TABLE VIEW (Standard Academic SETEC Table matching screenshot) */
        <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
          <div className="table-responsive">
            <table className="custom-table attendance-table">
              <thead>
                <tr>
                  <th style={{ minWidth: '170px' }}>
                    {lang === 'kh' ? 'កាលបរិច្ឆេទ (DD-MMMM-YYYY)' : 'Date (DD-MMMM-YYYY)'}
                  </th>
                  <th style={{ minWidth: '120px' }}>
                    {lang === 'kh' ? 'ថ្ងៃនៃសប្ដាហ៍' : 'Day'}
                  </th>
                  <th style={{ minWidth: '190px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <span style={{ fontWeight: 700 }}>7:00 – 8:30</span>
                      <small style={{ color: 'var(--primary-light)', fontWeight: 600, fontSize: '0.74rem' }}>SLOT 1</small>
                    </div>
                  </th>
                  <th style={{ minWidth: '190px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <span style={{ fontWeight: 700 }}>8:45 – 10:15</span>
                      <small style={{ color: 'var(--primary-light)', fontWeight: 600, fontSize: '0.74rem' }}>SLOT 2</small>
                    </div>
                  </th>
                  <th style={{ minWidth: '190px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <span style={{ fontWeight: 700 }}>10:15 – 11:45</span>
                      <small style={{ color: 'var(--primary-light)', fontWeight: 600, fontSize: '0.74rem' }}>SLOT 3</small>
                    </div>
                  </th>
                  <th style={{ minWidth: '130px' }}>
                    {lang === 'kh' ? 'ស្ថានភាព' : 'Status'}
                  </th>
                  <th style={{ textAlign: 'right', minWidth: '130px' }}>
                    {lang === 'kh' ? 'សកម្មភាព' : 'Action'}
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredAttendances.map((att) => {
                  const s1 = att.slots?.[0] || {};
                  const s2 = att.slots?.[1] || {};
                  const s3 = att.slots?.[2] || {};
                  const formattedDate = att.formattedDate || formatDateDDMMMMYYYY(att.date);
                  const isUnmarked = !!att.isUnmarked;

                  return (
                    <tr key={att.id} className={isUnmarked ? 'attendance-row-unmarked' : ''}>
                      {/* Date */}
                      <td>
                        <strong style={{ color: isUnmarked ? '#e2e8f0' : '#ffffff', fontSize: '0.92rem' }}>
                          {formattedDate}
                        </strong>
                      </td>

                      {/* Day */}
                      <td>
                        <span className="day-table-pill">{getDayDisplayName(att.day)}</span>
                      </td>

                      {/* Slot 1 */}
                      <td>
                        <div className="table-slot-cell">
                          <span className="table-subject-title">{s1.subject || '—'}</span>
                          {isUnmarked || !s1.status ? (
                            <span className="unmarked-slot-pill">—</span>
                          ) : (
                            getStatusBadge(s1.status)
                          )}
                        </div>
                      </td>

                      {/* Slot 2 */}
                      <td>
                        <div className="table-slot-cell">
                          <span className="table-subject-title">{s2.subject || '—'}</span>
                          {isUnmarked || !s2.status ? (
                            <span className="unmarked-slot-pill">—</span>
                          ) : (
                            getStatusBadge(s2.status)
                          )}
                        </div>
                      </td>

                      {/* Slot 3 */}
                      <td>
                        <div className="table-slot-cell">
                          <span className="table-subject-title">{s3.subject || '—'}</span>
                          {isUnmarked || !s3.status ? (
                            <span className="unmarked-slot-pill">—</span>
                          ) : (
                            getStatusBadge(s3.status)
                          )}
                        </div>
                      </td>

                      {/* Overall Status */}
                      <td>
                        {isUnmarked ? (
                          <Badge variant="default" icon="ri-time-line">
                            {t('notMarked')}
                          </Badge>
                        ) : (
                          getStatusBadge(att.overallStatus || 'Present')
                        )}
                      </td>

                      {/* Actions */}
                      <td style={{ textAlign: 'right' }}>
                        {isUnmarked ? (
                          <button
                            type="button"
                            className="btn-mark-day-action"
                            onClick={() => handleOpenRecordDay(att)}
                            title={t('markAttendance')}
                          >
                            <i className="ri-checkbox-circle-line"></i>
                            <span>{t('markAttendance')}</span>
                          </button>
                        ) : (
                          <div style={{ display: 'inline-flex', gap: '6px' }}>
                            <button
                              type="button"
                              className="btn-icon-soft"
                              onClick={() => handleOpenEditModal(att)}
                              title={t('edit')}
                            >
                              <i className="ri-edit-line"></i>
                            </button>
                            <button
                              type="button"
                              className="btn-icon-soft btn-icon-danger"
                              onClick={() => setDeleteTarget(att)}
                              title={t('delete')}
                            >
                              <i className="ri-delete-bin-line"></i>
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* CARDS / SCHEDULE VIEW */
        <div className="attendance-cards-list">
          {filteredAttendances.map((att) => {
            const formattedDate = att.formattedDate || formatDateDDMMMMYYYY(att.date);
            const isUnmarked = !!att.isUnmarked;

            return (
              <div
                key={att.id}
                className={`card attendance-record-card ${isUnmarked ? 'card-unmarked-record' : ''}`}
              >
                {/* Record Header */}
                <div className="attendance-card-header">
                  <div className="attendance-date-badge-group">
                    <div className="attendance-date-main">
                      <i className="ri-calendar-2-line" style={{ color: 'var(--primary-light)' }}></i>
                      <span className="attendance-date-text">{formattedDate}</span>
                    </div>
                    <span className="attendance-day-tag">
                      <i className="ri-sun-line"></i> {getDayDisplayName(att.day)}
                    </span>
                  </div>

                  <div className="attendance-card-actions">
                    {isUnmarked ? (
                      <Badge variant="default" icon="ri-time-line">
                        {t('notMarked')}
                      </Badge>
                    ) : (
                      getStatusBadge(att.overallStatus || 'Present')
                    )}

                    {isUnmarked ? (
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => handleOpenRecordDay(att)}
                        icon={<i className="ri-checkbox-circle-line"></i>}
                      >
                        {t('markAttendance')}
                      </Button>
                    ) : (
                      <>
                        <button
                          type="button"
                          className="btn-icon-soft"
                          onClick={() => handleOpenEditModal(att)}
                          title={t('edit')}
                        >
                          <i className="ri-edit-line"></i>
                        </button>
                        <button
                          type="button"
                          className="btn-icon-soft btn-icon-danger"
                          onClick={() => setDeleteTarget(att)}
                          title={t('delete')}
                        >
                          <i className="ri-delete-bin-line"></i>
                        </button>
                      </>
                    )}
                  </div>
                </div>

                {/* 3 Predefined Time Slots Grid */}
                <div className="attendance-slots-grid">
                  {att.slots && att.slots.length > 0 ? (
                    att.slots.map((slot, sIdx) => {
                      return (
                        <div key={slot.slotId || sIdx} className="attendance-slot-box">
                          <div className="slot-box-header">
                            <span className="slot-time-badge">
                              <i className="ri-time-line"></i> {slot.time}
                            </span>
                            <span className="slot-status-pill">
                              {isUnmarked || !slot.status ? (
                                <span className="unmarked-slot-pill">—</span>
                              ) : (
                                getStatusBadge(slot.status)
                              )}
                            </span>
                          </div>
                          <div className="slot-subject-name">
                            {slot.subject || <span style={{ color: 'var(--text-muted)' }}>— No Subject —</span>}
                          </div>
                          {(slot.room || slot.teacher) && (
                            <div className="slot-meta-row">
                              {slot.room && (
                                <span className="slot-meta-item">
                                  <i className="ri-map-pin-line"></i> {slot.room}
                                </span>
                              )}
                              {slot.teacher && (
                                <span className="slot-meta-item">
                                  <i className="ri-user-star-line"></i> {slot.teacher}
                                </span>
                              )}
                            </div>
                          )}
                          {slot.notes && (
                            <div className="slot-notes-text">
                              <i className="ri-sticky-note-line"></i> {slot.notes}
                            </div>
                          )}
                        </div>
                      );
                    })
                  ) : (
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>No slots data</div>
                  )}
                </div>

                {/* Daily Remarks if any */}
                {att.remarks && (
                  <div className="attendance-card-footer">
                    <i className="ri-chat-1-line" style={{ color: 'var(--primary-light)' }}></i>
                    <span><strong>{t('colDescription')}:</strong> {att.remarks}</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* ========================================== */}
      {/* RECORD / EDIT ATTENDANCE MODAL             */}
      {/* ========================================== */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingAttendance ? t('modalEditAttendance') : t('modalAddAttendance')}
        maxWidth="740px"
      >
        <form onSubmit={handleFormSubmit} className="custom-form attendance-modal-form">
          {/* Date & Day Header Selector */}
          <div className="form-row-2">
            <div className="form-group">
              <label htmlFor="attendance-date" className="form-label">
                {t('fieldDate')} <span style={{ color: 'var(--danger)' }}>*</span>
              </label>
              <input
                id="attendance-date"
                type="date"
                className={`form-input ${isFormSunday ? 'input-error' : ''}`}
                value={formDate}
                onChange={(e) => handleDateChange(e.target.value)}
                required
              />
              <small style={{ color: 'var(--text-muted)', display: 'block', marginTop: '4px' }}>
                Formatted: <strong style={{ color: 'var(--primary-light)' }}>{formFormattedDate || 'DD-MMMM-YYYY'}</strong>
              </small>
            </div>

            <div className="form-group">
              <label className="form-label">{t('fieldDay')}</label>
              <div
                className={`day-computed-display ${isFormSunday ? 'day-sunday-invalid' : 'day-valid'}`}
              >
                <i className={isFormSunday ? 'ri-error-warning-line' : 'ri-sun-fill'}></i>
                <span>{formDay ? getDayDisplayName(formDay) : 'Select a date'}</span>
              </div>
              <small style={{ color: 'var(--text-muted)', display: 'block', marginTop: '4px' }}>
                Allowed: Monday – Saturday
              </small>
            </div>
          </div>

          {/* Sunday Validation Error Banner */}
          {isFormSunday && (
            <div className="validation-alert-banner">
              <i className="ri-alert-fill" style={{ fontSize: '1.2rem', color: '#ef4444' }}></i>
              <div>
                <strong>{t('errorSundayNotAllowed')}</strong>
                <p style={{ margin: 0, fontSize: '0.84rem' }}>
                  Please pick any day from Monday through Saturday.
                </p>
              </div>
            </div>
          )}

          {/* Time & Subject Breakdown Section Header */}
          <div className="slots-section-header">
            <div>
              <h4 style={{ margin: 0, color: '#ffffff', fontSize: '1rem', fontWeight: 700 }}>
                <i className="ri-time-line" style={{ color: 'var(--primary-light)', marginRight: '6px' }}></i>
                {t('timeAndSubjectSchedule')}
              </h4>
              <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                3 Academic slots: 7:00 – 8:30, 8:45 – 10:15, 10:15 – 11:45
              </p>
            </div>
            <button
              type="button"
              className="btn-quick-fill"
              onClick={handleMarkAllPresent}
              title="Quickly set all slots to Present"
            >
              <i className="ri-check-double-line"></i> {t('markAllPresent')}
            </button>
          </div>

          {/* The 3 Predefined Slots */}
          <div className="slots-inputs-container">
            {formSlots.map((slot, index) => (
              <div key={slot.slotId || index} className="slot-input-card">
                <div className="slot-input-card-header">
                  <span className="slot-badge-label">
                    <i className="ri-time-fill"></i> {slot.time}
                  </span>
                  <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                    Slot {index + 1}
                  </span>
                </div>

                <div className="slot-inputs-grid">
                  {/* Subject selector or text input */}
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label" style={{ fontSize: '0.8rem' }}>
                      {t('colSubject')} <span style={{ color: 'var(--danger)' }}>*</span>
                    </label>
                    <div style={{ position: 'relative' }}>
                      <input
                        type="text"
                        list={`subject-list-${index}`}
                        className="form-input"
                        placeholder={t('placeholderSlotSubject')}
                        value={slot.subject}
                        onChange={(e) => handleSlotChange(index, 'subject', e.target.value)}
                        required
                      />
                      <datalist id={`subject-list-${index}`}>
                        {subjects.map((sub) => (
                          <option key={sub.id} value={sub.name}>
                            {sub.code ? `(${sub.code}) ` : ''}{sub.name}
                          </option>
                        ))}
                      </datalist>
                    </div>
                  </div>

                  {/* Status select */}
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label" style={{ fontSize: '0.8rem' }}>
                      {t('slotStatus')}
                    </label>
                    <select
                      className="form-select"
                      value={slot.status}
                      onChange={(e) => handleSlotChange(index, 'status', e.target.value)}
                    >
                      {ATTENDANCE_STATUSES.map((st) => (
                        <option key={st.value} value={st.value}>
                          {lang === 'kh' ? st.labelKh : st.labelEn}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Room / Notes */}
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label" style={{ fontSize: '0.8rem' }}>
                      {t('slotNotes')}
                    </label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder={t('placeholderSlotNotes')}
                      value={slot.notes}
                      onChange={(e) => handleSlotChange(index, 'notes', e.target.value)}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Daily Remarks / Notes */}
          <div className="form-group" style={{ marginTop: '16px' }}>
            <label htmlFor="attendance-remarks" className="form-label">
              {t('fieldRemarks')}
            </label>
            <textarea
              id="attendance-remarks"
              rows="2"
              className="form-textarea"
              placeholder={t('placeholderAttendanceRemarks')}
              value={formRemarks}
              onChange={(e) => setFormRemarks(e.target.value)}
            ></textarea>
          </div>

          {/* Modal Footer Actions */}
          <div className="modal-actions" style={{ marginTop: '20px' }}>
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsModalOpen(false)}
            >
              {t('cancel')}
            </Button>
            <Button
              type="submit"
              variant="primary"
              disabled={isFormSunday || !formDate}
              icon={<i className="ri-save-line"></i>}
            >
              {editingAttendance ? t('save') : t('create')}
            </Button>
          </div>
        </form>
      </Modal>

      {/* ========================================== */}
      {/* DELETE CONFIRMATION MODAL                  */}
      {/* ========================================== */}
      <ConfirmModal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleConfirmDelete}
        title={t('confirmDeleteTitle')}
        message={`${t('confirmDeleteMessage')} (${deleteTarget?.formattedDate || deleteTarget?.date} - ${deleteTarget?.day})`}
      />

      {/* ========================================== */}
      {/* DELETE WEEK CONFIRMATION MODAL             */}
      {/* ========================================== */}
      <ConfirmModal
        isOpen={!!deleteWeekTarget}
        onClose={() => setDeleteWeekTarget(null)}
        onConfirm={handleConfirmDeleteWeek}
        title={t('confirmDeleteWeekTitle')}
        message={`${t('confirmDeleteWeekMessage')} (${lang === 'kh' ? 'សប្ដាហ៍ទី' : 'Week'} ${deleteWeekTarget})`}
      />
    </div>
  );
};

export default Attendance;
