import { api } from './api';

export const contactApi = {
  send: (payload) => api.post('/contact', payload),
  list: () => api.get('/contact'),
  get: (id) => api.get(`/contact/${id}`),
  remove: (id) => api.delete(`/contact/${id}`),
};
