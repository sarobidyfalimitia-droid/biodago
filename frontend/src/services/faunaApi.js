import { api } from './api';

export const faunaApi = {
  list: (params) => api.get('/fauna', { params }),
  mapLocations: () => api.get('/fauna/map-locations'),
  get: (id) => api.get(`/fauna/${id}`),
  create: (formData) => api.post('/fauna', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  update: (id, formData) => {
    formData.append('_method', 'PUT');
    return api.post(`/fauna/${id}`, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
  },
  remove: (id) => api.delete(`/fauna/${id}`),
  removeImage: (imageId) => api.delete(`/fauna/images/${imageId}`),
  downloadUrl: (id) => `/api/species/fauna/${id}/download`,
};
