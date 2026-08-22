import api from './api';

export const userService = {
  async getFacultyList() {
    const res = await api.get('/users/faculty');
    return res.data?.faculty || [];
  },

  async getDashboardStats() {
    const res = await api.get('/users/stats');
    return res.data?.stats;
  },
};
