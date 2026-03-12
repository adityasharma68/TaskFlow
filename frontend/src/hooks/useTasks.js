// src/hooks/useTasks.js
// ============================================================
// useTasks – Custom hook encapsulating all task state & logic.
// Components receive clean data + action handlers; no raw API calls.
// ============================================================

import { useState, useCallback } from 'react';
import toast from 'react-hot-toast';
import * as svc from '../services/taskService';

const useTasks = () => {
  const [tasks,   setTasks]   = useState([]);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState(null);

  // ── Load / search ──────────────────────────────────────────
  const loadTasks = useCallback(async (keyword = '') => {
    setLoading(true);
    setError(null);
    try {
      const res = keyword
        ? await svc.searchTasks(keyword)
        : await svc.fetchAllTasks();
      setTasks(res.data || []);
    } catch (err) {
      setError(err.message);
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  // ── Create ─────────────────────────────────────────────────
  const addTask = useCallback(async (payload) => {
    const res = await svc.createTask(payload);
    setTasks((prev) => [res.data, ...prev]);
    toast.success('Task created!');
    return res.data;
  }, []);

  // ── Update ─────────────────────────────────────────────────
  const editTask = useCallback(async (id, payload) => {
    const res = await svc.updateTask(id, payload);
    setTasks((prev) => prev.map((t) => (t.id === id ? res.data : t)));
    toast.success('Task updated!');
    return res.data;
  }, []);

  // ── Delete ─────────────────────────────────────────────────
  const removeTask = useCallback(async (id) => {
    await svc.deleteTask(id);
    setTasks((prev) => prev.filter((t) => t.id !== id));
    toast.success('Task deleted.');
  }, []);

  return {
    tasks,
    loading,
    error,
    loadTasks,
    addTask,
    editTask,
    removeTask,
  };
};

export default useTasks;
