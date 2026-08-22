import api from './api';

export const authService = {
  async register(userData) {
    const res = await api.post('/auth/register', userData);
    return res.data?.user;
  },

  async login(credentials) {
    const res = await api.post('/auth/login', credentials);
    return res.data?.user;
  },

  async logout() {
    return await api.post('/auth/logout');
  },

  async getCurrentUser() {
    const res = await api.get('/auth/me');
    return res.data?.user;
  },
};
