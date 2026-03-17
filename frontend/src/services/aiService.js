import axios from 'axios';

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  headers: { 'Content-Type': 'application/json' },
  timeout: 30000,
});

API.interceptors.request.use((config) => {
  const token = localStorage.getItem('tf_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

API.interceptors.response.use(
  (res) => res.data,
  (err) => Promise.reject(new Error(err.response?.data?.message || err.message || 'AI request failed.'))
);

export const getAISuggestion = (task) =>
  API.post('/ai/suggest', {
    title:       task.title,
    description: task.description || '',
    due_date:    task.due_date    || '',
    status:      task.status      || 'Pending',
    remarks:     task.remarks     || '',
  });