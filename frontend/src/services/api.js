import axios from 'axios';

// In production (Vercel), VITE_API_URL is set to the Render backend URL.
// In development, Vite's proxy forwards /api → localhost:5000, so baseURL stays '/api'.
const baseURL = import.meta.env.VITE_API_URL
  ? `${import.meta.env.VITE_API_URL}/api`
  : '/api';

const api = axios.create({ baseURL });

api.interceptors.request.use((config) => {
  const userInfo = localStorage.getItem('userInfo');
  if (userInfo) {
    const { token } = JSON.parse(userInfo);
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
