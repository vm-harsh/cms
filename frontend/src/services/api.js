import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  withCredentials: true, // Crucial for sending/receiving HTTP-only cookies
  headers: {
    'Content-Type': 'application/json',
  },
});

// Response interceptor for centralized error parsing
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const errorResponse = error.response?.data || {};
    const message =
      errorResponse.message || error.message || 'An unexpected error occurred';
    
    return Promise.reject({
      status: error.response?.status || 500,
      message,
      errors: errorResponse.errors || [],
      raw: error,
    });
  }
);

export default api;
