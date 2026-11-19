import axios from 'axios';

export const API_BASE = import.meta.env.VITE_API_URL || '';
const api = axios.create({ baseURL: `${API_BASE}/api`, timeout: 20000 });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('fpc_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401 && localStorage.getItem('fpc_token')) {
      localStorage.removeItem('fpc_token');
      window.dispatchEvent(new Event('fpc:logout'));
    }
    return Promise.reject(err);
  }
);

export const errMsg = (e) => e?.response?.data?.message || e?.message || 'Something went wrong';

export const imgUrl = (src) => {
  if (!src) return '/logo.png';
  if (/^https?:\/\//.test(src) || src.startsWith('/images') || src.startsWith('data:')) return src;
  return `${API_BASE}${src}`;
};

export default api;
