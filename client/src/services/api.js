import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  withCredentials: true, // Send HttpOnly cookies automatically
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to attach bearer token from localStorage if cookie is blocked in certain cross-origin setups
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('imovies_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for unified error message handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message =
      error.response?.data?.message ||
      error.message ||
      'An unexpected error occurred';
    return Promise.reject(new Error(message));
  }
);

export default api;
