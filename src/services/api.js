// API Service for Laravel Backend & MySQL Database Integration
let rawBase = (import.meta.env.VITE_API_URL || '/api').trim().replace(/\/+$/, '');
if (rawBase && !rawBase.endsWith('/api') && rawBase !== '/api') {
  rawBase = `${rawBase}/api`;
}
const API_BASE_URL = rawBase;

/**
 * Generic fetch wrapper with JSON serialization & error handling
 */
async function request(endpoint, options = {}) {
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  const url = `${API_BASE_URL}${cleanEndpoint}`;
  
  const token = localStorage.getItem('study_auth_token');
  const headers = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    ...(options.headers || {})
  };

  const config = {
    ...options,
    headers
  };

  try {
    const response = await fetch(url, config);
    const contentType = response.headers.get('content-type') || '';
    let data = null;

    if (contentType.includes('application/json')) {
      data = await response.json();
    } else {
      data = await response.text();
    }

    if (!response.ok) {
      const errorMsg = data?.message || data?.error || (typeof data === 'string' && data.length < 100 ? data : `HTTP Error ${response.status}: ${response.statusText}`);
      const err = new Error(errorMsg);
      err.status = response.status;
      err.data = data;
      throw err;
    }

    return data;
  } catch (error) {
    throw error;
  }
}

export const api = {
  // Health / Ping
  ping: () => request('/ping'),

  // 0. Authentication API
  login: (credentials) =>
    request('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials)
    }),
  register: (userData) =>
    request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData)
    }),
  forgotPassword: (email) =>
    request('/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email })
    }),
  resetPassword: (payload) =>
    request('/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify(payload)
    }),
  logout: () =>
    request('/auth/logout', {
      method: 'POST'
    }),
  getCurrentUser: () => request('/auth/me'),

  // 1. User Profile
  getUserProfile: () => request('/user/profile'),
  updateUserProfile: (profileData) =>
    request('/user/profile', {
      method: 'POST',
      body: JSON.stringify(profileData)
    }),

  // 2. Teachers CRUD
  getTeachers: () => request('/teachers'),
  getTeacher: (id) => request(`/teachers/${id}`),
  createTeacher: (teacherData) =>
    request('/teachers', {
      method: 'POST',
      body: JSON.stringify(teacherData)
    }),
  updateTeacher: (id, teacherData) =>
    request(`/teachers/${id}`, {
      method: 'PUT',
      body: JSON.stringify(teacherData)
    }),
  deleteTeacher: (id) =>
    request(`/teachers/${id}`, {
      method: 'DELETE'
    }),

  // 3. Subjects CRUD
  getSubjects: () => request('/subjects'),
  getSubject: (id) => request(`/subjects/${id}`),
  createSubject: (subjectData) =>
    request('/subjects', {
      method: 'POST',
      body: JSON.stringify(subjectData)
    }),
  updateSubject: (id, subjectData) =>
    request(`/subjects/${id}`, {
      method: 'PUT',
      body: JSON.stringify(subjectData)
    }),
  deleteSubject: (id) =>
    request(`/subjects/${id}`, {
      method: 'DELETE'
    }),

  // 4. Practices CRUD + Toggle
  getPractices: () => request('/practices'),
  getPractice: (id) => request(`/practices/${id}`),
  createPractice: (practiceData) =>
    request('/practices', {
      method: 'POST',
      body: JSON.stringify(practiceData)
    }),
  updatePractice: (id, practiceData) =>
    request(`/practices/${id}`, {
      method: 'PUT',
      body: JSON.stringify(practiceData)
    }),
  togglePractice: (id) =>
    request(`/practices/${id}/toggle`, {
      method: 'PATCH'
    }),
  deletePractice: (id) =>
    request(`/practices/${id}`, {
      method: 'DELETE'
    }),

  // 5. Assignments CRUD + Toggle
  getAssignments: () => request('/assignments'),
  getAssignment: (id) => request(`/assignments/${id}`),
  createAssignment: (assignmentData) =>
    request('/assignments', {
      method: 'POST',
      body: JSON.stringify(assignmentData)
    }),
  updateAssignment: (id, assignmentData) =>
    request(`/assignments/${id}`, {
      method: 'PUT',
      body: JSON.stringify(assignmentData)
    }),
  toggleAssignment: (id) =>
    request(`/assignments/${id}/toggle`, {
      method: 'PATCH'
    }),
  deleteAssignment: (id) =>
    request(`/assignments/${id}`, {
      method: 'DELETE'
    }),

  // 6. Dashboard Stats
  getDashboardStats: () => request('/dashboard/stats'),

  // 7. Seed / Reset Database
  resetDatabase: () =>
    request('/seed-default', {
      method: 'POST'
    })
};
