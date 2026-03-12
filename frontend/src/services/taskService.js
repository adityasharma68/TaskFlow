// src/services/taskService.js — with JWT auth header
import axios from 'axios';

const API = axios.create({ baseURL: '/api', headers: { 'Content-Type': 'application/json' }, timeout: 10000 });

API.interceptors.request.use((config) => {
  const token = localStorage.getItem('tf_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

API.interceptors.response.use(
  (res) => res.data,
  (err) => Promise.reject(new Error(err.response?.data?.message || err.message || 'Error'))
);

export const fetchAllTasks  = ()            => API.get('/tasks');
export const searchTasks    = (keyword)     => API.get('/tasks/search', { params: { q: keyword } });
export const fetchTaskById  = (id)          => API.get(`/tasks/${id}`);
export const createTask     = (payload)     => API.post('/tasks', payload);
export const updateTask     = (id, payload) => API.put(`/tasks/${id}`, payload);
export const deleteTask     = (id)          => API.delete(`/tasks/${id}`);
