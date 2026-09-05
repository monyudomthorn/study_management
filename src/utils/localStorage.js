

const STORAGE_KEYS = {
  SUBJECTS: "studytrack_subjects_v5",
  TEACHERS: "studytrack_teachers_v5",
  PRACTICES: "studytrack_practices_v5",
  ASSIGNMENTS: "studytrack_assignments_v5",
  LANGUAGE: "studytrack_lang_v5",
  USER: "studytrack_user_v5",
  USERS_LIST: "studytrack_users_list_v5"
};

export const loadFromStorage = (key, fallback) => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : fallback;
  } catch (error) {
    console.error(`Error loading key "${key}" from localStorage:`, error);
    return fallback;
  }
};

export const saveToStorage = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error(`Error saving key "${key}" to localStorage:`, error);
  }
};

export const removeFromStorage = (key) => {
  try {
    localStorage.removeItem(key);
  } catch (error) {
    console.error(`Error removing key "${key}" from localStorage:`, error);
  }
};

export const clearAllStudyData = () => {
  try {
    localStorage.setItem(STORAGE_KEYS.SUBJECTS, JSON.stringify([]));
    localStorage.setItem(STORAGE_KEYS.TEACHERS, JSON.stringify([]));
    localStorage.setItem(STORAGE_KEYS.PRACTICES, JSON.stringify([]));
    localStorage.setItem(STORAGE_KEYS.ASSIGNMENTS, JSON.stringify([]));
  } catch (error) {
    console.error("Error clearing study data:", error);
  }
};

export { STORAGE_KEYS };
