import axios from 'axios';

const getBaseUrl = () => {
  let envUrl = import.meta.env.VITE_API_URL;
  
  // If not explicitly set in env, detect if running on production (Vercel/custom domain)
  if (!envUrl) {
    if (typeof window !== 'undefined' && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
      return 'https://hrms-wn16.onrender.com/api';
    }
    return 'http://localhost:5000/api';
  }
  
  // Trim trailing slashes
  envUrl = envUrl.replace(/\/+$/, '');
  if (!envUrl.endsWith('/api')) {
    envUrl += '/api';
  }
  return envUrl;
};

const api = axios.create({
  baseURL: getBaseUrl(),
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor: attach token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('hrms_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: redirect on 401
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Don't auto-redirect if checking auth status
      if (!error.config.url.includes('/auth/me')) {
        localStorage.removeItem('hrms_token');
        localStorage.removeItem('hrms_user');
      }
    }
    return Promise.reject(error);
  }
);

export default api;
