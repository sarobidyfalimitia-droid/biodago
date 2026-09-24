import { api } from './api';

export const statsApi = {
  public: () => api.get('/stats'),
  admin: () => api.get('/stats/admin'),
  member: () => api.get('/stats/member'),
};
