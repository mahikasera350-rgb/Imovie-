import api from './api';

export const showService = {
  async getShows(params = {}) {
    const res = await api.get('/shows', { params });
    return res.data;
  },

  async getShowById(id) {
    const res = await api.get(`/shows/${id}`);
    return res.data;
  },

  async getShowSeats(id, holdToken) {
    const res = await api.get(`/shows/${id}/seats`, {
      params: { holdToken },
    });
    return res.data;
  },

  async createShow(data) {
    const res = await api.post('/shows', data);
    return res.data;
  },

  async updateShow(id, data) {
    const res = await api.put(`/shows/${id}`, data);
    return res.data;
  },

  async deleteShow(id) {
    const res = await api.delete(`/shows/${id}`);
    return res.data;
  },
};

export default showService;
