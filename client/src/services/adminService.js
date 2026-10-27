import api from './api';

export const adminService = {
  async getDashboard() {
    const res = await api.get('/admin/dashboard');
    return res.data;
  },

  async getBookings(params = {}) {
    const res = await api.get('/admin/bookings', { params });
    return res.data;
  },

  async getUsers(params = {}) {
    const res = await api.get('/admin/users', { params });
    return res.data;
  },

  async updateUserRole(id, role) {
    const res = await api.patch(`/admin/users/${id}/role`, { role });
    return res.data;
  },
};

export default adminService;
