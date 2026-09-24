import { api } from './api';

export const authApi = {
  register: (payload) => api.post('/auth/register', payload),
  login: (payload) => api.post('/auth/login', payload),
  logout: () => api.post('/auth/logout'),
  me: () => api.get('/auth/me'),
  changePassword: (payload) => api.post('/auth/change-password', payload),
  resetPassword: (payload) => api.post('/auth/reset-password', payload),
  generateResetCode: (userId) => api.post(`/members/${userId}/generate-reset-code`),
};
