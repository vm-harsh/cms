import api from './api';

export const courseService = {
  async getAllCourses(params = {}) {
    const res = await api.get('/courses', { params });
    return res.data?.courses || [];
  },

  async getCourseById(id) {
    const res = await api.get(`/courses/${id}`);
    return res.data?.course;
  },

  async createCourse(courseData) {
    const res = await api.post('/courses', courseData);
    return res.data?.course;
  },

  async updateCourse(id, courseData) {
    const res = await api.patch(`/courses/${id}`, courseData);
    return res.data?.course;
  },

  async deleteCourse(id) {
    const res = await api.delete(`/courses/${id}`);
    return res.data;
  },
};
