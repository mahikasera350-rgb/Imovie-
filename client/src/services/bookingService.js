import api from './api';

export const bookingService = {
  async holdSeats(data) {
    const res = await api.post('/bookings/hold-seats', data);
    return res.data;
  },

  async releaseHold(data) {
    const res = await api.post('/bookings/release-hold', data);
    return res.data;
  },

  async createBooking(data) {
    const res = await api.post('/bookings', data);
    return res.data;
  },

  async getMyBookings(params = {}) {
    const res = await api.get('/bookings/my', { params });
    return res.data;
  },

  async getBookingById(id) {
    const res = await api.get(`/bookings/${id}`);
    return res.data;
  },

  async cancelBooking(id, reason) {
    const res = await api.post(`/bookings/${id}/cancel`, { reason });
    return res.data;
  },
};

export default bookingService;
