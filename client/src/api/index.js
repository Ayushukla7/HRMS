import api from './axios';

// Auth Endpoints
export const authApi = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  getMe: () => api.get('/auth/me'),
  updateProfile: (data) => api.put('/auth/profile', data),
  updatePassword: (data) => api.put('/auth/update-password', data),
};

// Employee Endpoints
export const employeeApi = {
  getAll: (params) => api.get('/employees', { params }),
  getById: (id) => api.get(`/employees/${id}`),
  create: (data) => api.post('/employees', data),
  update: (id, data) => api.put(`/employees/${id}`, data),
  delete: (id) => api.delete(`/employees/${id}`),
};

// Department Endpoints
export const departmentApi = {
  getAll: () => api.get('/departments'),
  getById: (id) => api.get(`/departments/${id}`),
  create: (data) => api.post('/departments', data),
  update: (id, data) => api.put(`/departments/${id}`, data),
  delete: (id) => api.delete(`/departments/${id}`),
};

// Attendance Endpoints
export const attendanceApi = {
  getAll: (params) => api.get('/attendance', { params }),
  getToday: () => api.get('/attendance/today'),
  checkIn: (data) => api.post('/attendance/check-in', data),
  checkOut: (data) => api.post('/attendance/check-out', data),
  markManual: (data) => api.post('/attendance/manual', data),
};

// Leave Endpoints
export const leaveApi = {
  getAll: (params) => api.get('/leaves', { params }),
  apply: (data) => api.post('/leaves', data),
  updateStatus: (id, data) => api.put(`/leaves/${id}/status`, data),
  getBalance: (employeeId) => api.get(`/leaves/balance${employeeId ? `/${employeeId}` : ''}`),
};

// Payroll Endpoints
export const payrollApi = {
  getAll: (params) => api.get('/payroll', { params }),
  getById: (id) => api.get(`/payroll/${id}`),
  create: (data) => api.post('/payroll', data),
  bulkGenerate: (data) => api.post('/payroll/bulk-generate', data),
  delete: (id) => api.delete(`/payroll/${id}`),
};

// Job / Recruitment Endpoints
export const jobApi = {
  getAll: (params) => api.get('/jobs', { params }),
  getById: (id) => api.get(`/jobs/${id}`),
  create: (data) => api.post('/jobs', data),
  update: (id, data) => api.put(`/jobs/${id}`, data),
  delete: (id) => api.delete(`/jobs/${id}`),
};

// Applicant Endpoints
export const applicationApi = {
  getAll: (params) => api.get('/applications', { params }),
  create: (data) => api.post('/applications', data),
  updateStatus: (id, data) => api.put(`/applications/${id}/status`, data),
  delete: (id) => api.delete(`/applications/${id}`),
};

// Performance Endpoints
export const performanceApi = {
  getAll: (params) => api.get('/performance', { params }),
  getEmployeeReviews: (employeeId) => api.get(`/performance/employee/${employeeId}`),
  create: (data) => api.post('/performance', data),
  update: (id, data) => api.put(`/performance/${id}`, data),
  addComments: (id, data) => api.post(`/performance/${id}/comments`, data),
};

// Notification Endpoints
export const notificationApi = {
  getAll: () => api.get('/notifications'),
  markRead: (id) => api.put(`/notifications/${id}/read`),
  markAllRead: () => api.put('/notifications/read-all'),
  delete: (id) => api.delete(`/notifications/${id}`),
};

// Dashboard Analytics
export const dashboardApi = {
  getAdminStats: () => api.get('/dashboard/stats'),
  getEmployeeStats: () => api.get('/dashboard/employee-stats'),
};
