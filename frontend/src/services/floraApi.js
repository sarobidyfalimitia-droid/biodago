import { api } from './api';

export const floraApi = {
  list: (params) => api.get('/flora', { params }),
  mapLocations: () => api.get('/flora/map-locations'),
  get: (id) => api.get(`/flora/${id}`),
  create: (formData) => api.post('/flora', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  update: (id, formData) => {
    formData.append('_method', 'PUT');
    return api.post(`/flora/${id}`, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
  },
  remove: (id) => api.delete(`/flora/${id}`),
  removeImage: (imageId) => api.delete(`/flora/images/${imageId}`),
  downloadUrl: (id) => `/api/species/flora/${id}/download`,
};