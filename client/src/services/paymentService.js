import api from './api';

export const paymentService = {
  async createOrder(bookingId, provider = 'demo') {
    const res = await api.post('/payments/create-order', {
      bookingId,
      provider,
    });
    return res.data;
  },

  async verifyPayment(verificationData) {
    const res = await api.post('/payments/verify', verificationData);
    return res.data;
  },
};

export default paymentService;
