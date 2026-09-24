import { api } from './api';

export const categoryApi = {
  list: (params) => api.get('/categories', { params }),
  get: (id) => api.get(`/categories/${id}`),
  create: (formData) => api.post('/categories', formData),
  update: (id, payload) => api.put(`/categories/${id}`, payload),
  remove: (id, opts) => api.delete(`/categories/${id}`, { params: opts }),
};
