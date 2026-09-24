import { api } from './api';

export const blogApi = {
  list: (params) => api.get('/blog', { params }),
  get: (slug) => api.get(`/blog/${slug}`),
  create: (formData) => api.post('/blog', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  update: (id, formData) => {
    formData.append('_method', 'PUT');
    return api.post(`/blog/${id}`, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
  },
  remove: (id) => api.delete(`/blog/${id}`),
  removeImage: (imageId) => api.delete(`/blog/images/${imageId}`),
};
