import api from './api';

export const theatreService = {
  async getTheatres(params = {}) {
    const res = await api.get('/theatres', { params });
    return res.data;
  },

  async getCities() {
    const res = await api.get('/theatres/cities');
    return res.data;
  },

  async getTheatreById(id) {
    const res = await api.get(`/theatres/${id}`);
    return res.data;
  },

  async createTheatre(data) {
    const res = await api.post('/theatres', data);
    return res.data;
  },

  async updateTheatre(id, data) {
    const res = await api.put(`/theatres/${id}`, data);
    return res.data;
  },

  async deleteTheatre(id) {
    const res = await api.delete(`/theatres/${id}`);
    return res.data;
  },
};

export default theatreService;
