import api from './api';

export const adminService = {
  async getAdmins() {
    const res = await api.get('/admin/admins');
    return res.data?.admins || [];
  },

  async createAdmin(adminData) {
    const res = await api.post('/admin/admins', adminData);
    return res.data?.user;
  },

  async getFaculty() {
    const res = await api.get('/admin/faculty');
    return res.data?.faculty || [];
  },

  async createFaculty(facultyData) {
    const res = await api.post('/admin/faculty', facultyData);
    return res.data?.user;
  },

  async getStudents() {
    const res = await api.get('/admin/students');
    return res.data?.students || [];
  },
};
