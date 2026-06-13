import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' }
});

// Attach JWT token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => Promise.reject(error));

// Handle 401 globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getMe: () => api.get('/auth/me')
};

// Dashboard
export const dashboardAPI = {
  getData: () => api.get('/dashboard')
};

// Profile
export const profileAPI = {
  get: () => api.get('/profile'),
  update: (data) => api.put('/profile', data),
  uploadPhoto: (formData) => api.post('/profile/photo', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  })
};

// Timetable
export const timetableAPI = {
  getAll: (dayOrder) => api.get('/timetable', { params: dayOrder ? { dayOrder } : {} }),
  add: (data) => api.post('/timetable', data),
  update: (id, data) => api.put(`/timetable/${id}`, data),
  delete: (id) => api.delete(`/timetable/${id}`),
  // Automatic day order — no more manual setting
  getConfig: () => api.get('/timetable/config'),
  saveConfig: (data) => api.post('/timetable/config', data),
  getDayOrderForDate: (date) => api.get('/timetable/dayorder', { params: date ? { date } : {} }),
  getWeekPreview: () => api.get('/timetable/week')
};

// Holidays
export const holidayAPI = {
  getAll: () => api.get('/holidays'),
  add: (data) => api.post('/holidays', data),
  delete: (id) => api.delete(`/holidays/${id}`)
};

// Notes
export const notesAPI = {
  getAll: (params) => api.get('/notes', { params }),
  getSubjects: () => api.get('/notes/subjects'),
  upload: (formData) => api.post('/notes', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  delete: (id) => api.delete(`/notes/${id}`)
};

// Todos
export const todoAPI = {
  getAll: (params) => api.get('/todos', { params }),
  add: (data) => api.post('/todos', data),
  update: (id, data) => api.put(`/todos/${id}`, data),
  delete: (id) => api.delete(`/todos/${id}`),
  toggle: (id) => api.patch(`/todos/${id}/toggle`)
};

// Exams
export const examAPI = {
  getAll: (params) => api.get('/exams', { params }),
  add: (data) => api.post('/exams', data),
  update: (id, data) => api.put(`/exams/${id}`, data),
  delete: (id) => api.delete(`/exams/${id}`)
};

// Notifications
export const notificationAPI = {
  getAll: (params) => api.get('/notifications', { params }),
  markRead: (id) => api.patch(`/notifications/${id}/read`),
  markAllRead: () => api.patch('/notifications/read-all'),
  delete: (id) => api.delete(`/notifications/${id}`),
  clearAll: () => api.delete('/notifications')
};

export default api;
