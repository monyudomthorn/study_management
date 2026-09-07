/**
 * Date and Attendance Utilities for SETEC Study Management System
 * Standard format: DD-MMMM-YYYY (e.g. 07-September-2026)
 * Allowed days: Monday to Saturday (Sundays are strictly excluded)
 */

export const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

export const MONTH_NAMES_KH = [
  'មករា', 'កុម្ភៈ', 'មីនា', 'មេសា', 'ឧសភា', 'មិថុនា',
  'កក្កដា', 'សីហា', 'កញ្ញា', 'តុលា', 'វិច្ឆិកា', 'ធ្នូ'
];

export const ALLOWED_DAYS = [
  'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'
];

export const DAY_NAMES_MAP = {
  Monday: { en: 'Monday', kh: 'ថ្ងៃច័ន្ទ', shortKh: 'ច័ន្ទ' },
  Tuesday: { en: 'Tuesday', kh: 'ថ្ងៃអង្គារ', shortKh: 'អង្គារ' },
  Wednesday: { en: 'Wednesday', kh: 'ថ្ងៃពុធ', shortKh: 'ពុធ' },
  Thursday: { en: 'Thursday', kh: 'ថ្ងៃព្រហស្បតិ៍', shortKh: 'ព្រហស្បតិ៍' },
  Friday: { en: 'Friday', kh: 'ថ្ងៃសុក្រ', shortKh: 'សុក្រ' },
  Saturday: { en: 'Saturday', kh: 'ថ្ងៃសៅរ៍', shortKh: 'សៅរ៍' },
  Sunday: { en: 'Sunday', kh: 'ថ្ងៃអាទិត្យ', shortKh: 'អាទិត្យ' }
};

export const ATTENDANCE_TIME_SLOTS = [
  { id: 'slot-1', time: '7:00 – 8:30', label: 'Slot 1 (Morning Early)' },
  { id: 'slot-2', time: '8:45 – 10:15', label: 'Slot 2 (Morning Mid)' },
  { id: 'slot-3', time: '10:15 – 11:45', label: 'Slot 3 (Morning Late)' }
];

export const ATTENDANCE_STATUSES = [
  { value: 'Present', labelEn: 'Present', labelKh: 'វត្តមាន', color: '#10b981', bg: 'rgba(16, 185, 129, 0.16)', icon: 'ri-checkbox-circle-line' },
  { value: 'Late', labelEn: 'Late', labelKh: 'យឺត', color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.16)', icon: 'ri-time-line' },
  { value: 'Absent', labelEn: 'Absent', labelKh: 'អវត្តមាន', color: '#ef4444', bg: 'rgba(239, 68, 68, 0.16)', icon: 'ri-close-circle-line' },
  { value: 'Excused', labelEn: 'Excused (Permission)', labelKh: 'ច្បាប់ / អនុញ្ញាត', color: '#38bdf8', bg: 'rgba(56, 189, 248, 0.16)', icon: 'ri-shield-check-line' },
  { value: 'No Class', labelEn: 'No Class', labelKh: 'គ្មានថ្នាក់រៀន', color: '#94a3b8', bg: 'rgba(148, 163, 184, 0.16)', icon: 'ri-pause-circle-line' }
];

/**
 * Format a Date or ISO string (YYYY-MM-DD) to DD-MMMM-YYYY (e.g. 07-September-2026)
 * @param {string|Date} dateInput
 * @returns {string} Formatted date string
 */
export const formatDateDDMMMMYYYY = (dateInput) => {
  if (!dateInput) return '';

  let year, monthIdx, day;

  if (typeof dateInput === 'string') {
    // If already in DD-MMMM-YYYY format
    const ddMmmmMatch = dateInput.match(/^(\d{2})-([A-Za-z]+)-(\d{4})$/);
    if (ddMmmmMatch) {
      return dateInput;
    }

    // Match YYYY-MM-DD
    const isoMatch = dateInput.match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (isoMatch) {
      year = parseInt(isoMatch[1], 10);
      monthIdx = parseInt(isoMatch[2], 10) - 1;
      day = parseInt(isoMatch[3], 10);
    } else {
      const d = new Date(dateInput);
      if (isNaN(d.getTime())) return String(dateInput);
      year = d.getFullYear();
      monthIdx = d.getMonth();
      day = d.getDate();
    }
  } else if (dateInput instanceof Date) {
    if (isNaN(dateInput.getTime())) return '';
    year = dateInput.getFullYear();
    monthIdx = dateInput.getMonth();
    day = dateInput.getDate();
  } else {
    return '';
  }

  const paddedDay = String(day).padStart(2, '0');
  const monthName = MONTH_NAMES[monthIdx] || 'January';
  return `${paddedDay}-${monthName}-${year}`;
};

/**
 * Convert DD-MMMM-YYYY (e.g. 07-September-2026) to ISO YYYY-MM-DD (e.g. 2026-09-07)
 * @param {string} formattedDate
 * @returns {string} ISO Date string YYYY-MM-DD
 */
export const parseFormattedDateToISO = (formattedDate) => {
  if (!formattedDate) return '';
  const match = formattedDate.match(/^(\d{1,2})-([A-Za-z]+)-(\d{4})$/);
  if (!match) {
    // If it's already YYYY-MM-DD
    if (/^\d{4}-\d{2}-\d{2}$/.test(formattedDate)) return formattedDate;
    return '';
  }

  const day = String(parseInt(match[1], 10)).padStart(2, '0');
  const monthName = match[2];
  const year = match[3];

  const monthIdx = MONTH_NAMES.findIndex(
    (m) => m.toLowerCase() === monthName.toLowerCase()
  );
  if (monthIdx === -1) return '';

  const paddedMonth = String(monthIdx + 1).padStart(2, '0');
  return `${year}-${paddedMonth}-${day}`;
};

/**
 * Get English day name of the week from ISO string or Date
 * @param {string|Date} dateInput
 * @returns {string} Monday, Tuesday, ..., Saturday, Sunday
 */
export const getDayOfWeek = (dateInput) => {
  if (!dateInput) return '';

  let d;
  if (typeof dateInput === 'string') {
    if (/^\d{1,2}-[A-Za-z]+-\d{4}$/.test(dateInput)) {
      const iso = parseFormattedDateToISO(dateInput);
      if (!iso) return '';
      const parts = iso.split('-');
      d = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
    } else {
      const parts = dateInput.split('T')[0].split('-');
      if (parts.length === 3) {
        d = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
      } else {
        d = new Date(dateInput);
      }
    }
  } else if (dateInput instanceof Date) {
    d = dateInput;
  }

  if (!d || isNaN(d.getTime())) return '';

  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  return days[d.getDay()];
};

/**
 * Check if the day is an allowed academic day (Monday to Saturday)
 * @param {string|Date} dateInputOrDay
 * @returns {boolean} true if Monday–Saturday, false if Sunday
 */
export const isAllowedDay = (dateInputOrDay) => {
  if (!dateInputOrDay) return false;

  let dayName;
  if (ALLOWED_DAYS.includes(dateInputOrDay)) {
    return true;
  }
  if (dateInputOrDay === 'Sunday') {
    return false;
  }

  dayName = getDayOfWeek(dateInputOrDay);
  return ALLOWED_DAYS.includes(dayName);
};

/**
 * Get today's valid academic date info (if today is Sunday, returns next Monday)
 */
export const getTodayAcademicInfo = () => {
  const now = new Date();
  let target = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  if (target.getDay() === 0) {
    // If today is Sunday, shift to Monday for academic convenience
    target.setDate(target.getDate() + 1);
  }

  const year = target.getFullYear();
  const month = String(target.getMonth() + 1).padStart(2, '0');
  const day = String(target.getDate()).padStart(2, '0');
  const isoDate = `${year}-${month}-${day}`;

  return {
    isoDate,
    formattedDate: formatDateDDMMMMYYYY(isoDate),
    day: getDayOfWeek(isoDate)
  };
};

/**
 * Format a Date to localized Khmer string if required
 */
export const formatKhmerDate = (formattedDate) => {
  if (!formattedDate) return '';
  const match = formattedDate.match(/^(\d{2})-([A-Za-z]+)-(\d{4})$/);
  if (!match) return formattedDate;

  const day = match[1];
  const monthName = match[2];
  const year = match[3];

  const monthIdx = MONTH_NAMES.findIndex(
    (m) => m.toLowerCase() === monthName.toLowerCase()
  );
  const khMonth = monthIdx !== -1 ? MONTH_NAMES_KH[monthIdx] : monthName;

  return `${day}-${khMonth}-${year}`;
};
