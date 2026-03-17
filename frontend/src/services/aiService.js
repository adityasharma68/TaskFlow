// src/services/aiService.js
// ============================================================
// AI Service — Calls the backend AI suggestion endpoint.
// The backend then calls the Anthropic Claude API.
// ============================================================

import axios from 'axios';

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  headers: { 'Content-Type': 'application/json' },
  timeout: 30_000, // AI calls can take up to 30 seconds
});

// Attach JWT token to every request
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('tf_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

API.interceptors.response.use(
  (res) => res.data,
  (err) => Promise.reject(new Error(err.response?.data?.message || err.message || 'AI request failed.'))
);

/**
 * Get AI suggestions for completing a task.
 * @param {Object} task - { title, description, due_date, status, remarks }
 */
export const getAISuggestion = (task) =>
  API.post('/ai/suggest', {
    title:       task.title,
    description: task.description || '',
    due_date:    task.due_date    || '',
    status:      task.status      || 'Pending',
    remarks:     task.remarks     || '',
  });
