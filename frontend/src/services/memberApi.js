import { api } from './api';

export const memberApi = {
  list: (params) => api.get('/members', { params }),
  approve: (id) => api.post(`/members/${id}/approve`),
  reject: (id) => api.post(`/members/${id}/reject`),
  suspend: (id) => api.post(`/members/${id}/suspend`),
  reactivate: (id) => api.post(`/members/${id}/reactivate`),
  remove: (id) => api.delete(`/members/${id}`),
};
