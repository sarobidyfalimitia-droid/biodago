import { api } from './api';

export const superAdminApi = {
  listAccounts: (params) => api.get('/accounts', { params }),
  changeRole: (id, role) => api.post(`/accounts/${id}/role`, { role }),
  removeAccount: (id) => api.delete(`/accounts/${id}`),
  createAccount: (payload) => api.post('/accounts', payload),
};
