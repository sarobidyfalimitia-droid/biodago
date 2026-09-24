import { api } from './api';

export const regionApi = {
  list: () => api.get('/regions'),
};
