import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('smartlease_token');

    if (token) {
      config.headers['x-auth-token'] = token;
    }

    if (config.data instanceof FormData) {
      delete config.headers['Content-Type'];
    }

    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error(
      'API Error:',
      error.response?.status,
      error.response?.data || error.message
    );

    return Promise.reject(error);
  }
);

export default api;