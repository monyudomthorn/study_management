// API Service for Laravel Backend & MySQL Database Integration
const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

/**
 * Generic fetch wrapper with JSON serialization & error handling
 */
async function request(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
  
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
      const errorMsg = data?.message || data?.error || `HTTP Error ${response.status}: ${response.statusText}`;
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
  getMe: () => request('/auth/me'),

  // 1. User Profile API
  getUserProfile: () => request('/user/profile'),
  updateUserProfile: (profileData) =>
    request('/user/profile', {
      method: 'POST',
      body: JSON.stringify(profileData)
    }),

  // 2. Teachers API
  getTeachers: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/teachers${query ? `?${query}` : ''}`);
  },
  createTeacher: (data) =>
    request('/teachers', {
      method: 'POST',
      body: JSON.stringify(data)
    }),
  updateTeacher: (id, data) =>
    request(`/teachers/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    }),
  deleteTeacher: (id) =>
    request(`/teachers/${id}`, {
      method: 'DELETE'
    }),

  // 3. Subjects API
  getSubjects: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/subjects${query ? `?${query}` : ''}`);
  },
  createSubject: (data) =>
    request('/subjects', {
      method: 'POST',
      body: JSON.stringify(data)
    }),
  updateSubject: (id, data) =>
    request(`/subjects/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    }),
  deleteSubject: (id) =>
    request(`/subjects/${id}`, {
      method: 'DELETE'
    }),

  // 4. Practices API
  getPractices: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/practices${query ? `?${query}` : ''}`);
  },
  createPractice: (data) =>
    request('/practices', {
      method: 'POST',
      body: JSON.stringify(data)
    }),
  updatePractice: (id, data) =>
    request(`/practices/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    }),
  togglePracticeComplete: (id) =>
    request(`/practices/${id}/toggle`, {
      method: 'PATCH'
    }),
  deletePractice: (id) =>
    request(`/practices/${id}`, {
      method: 'DELETE'
    }),

  // 5. Assignments API
  getAssignments: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/assignments${query ? `?${query}` : ''}`);
  },
  createAssignment: (data) =>
    request('/assignments', {
      method: 'POST',
      body: JSON.stringify(data)
    }),
  updateAssignment: (id, data) =>
    request(`/assignments/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    }),
  toggleAssignmentComplete: (id) =>
    request(`/assignments/${id}/toggle`, {
      method: 'PATCH'
    }),
  deleteAssignment: (id) =>
    request(`/assignments/${id}`, {
      method: 'DELETE'
    }),

  // 6. Dashboard Stats
  getDashboardStats: () => request('/dashboard/stats'),

  // 7. Reset / Seed Default Data
  resetToDefaultDatabase: () =>
    request('/seed-default', {
      method: 'POST'
    })
};
