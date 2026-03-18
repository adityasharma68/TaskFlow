// models/taskModel.js
const { pool } = require('../config/db');

const COLUMNS = `
  id, title, description, due_date, status,
  remarks, created_by, updated_by,
  DATE_FORMAT(created_at, '%Y-%m-%dT%H:%i:%sZ') AS created_at,
  DATE_FORMAT(updated_at, '%Y-%m-%dT%H:%i:%sZ') AS updated_at
`;

const getAllTasks = async (userId) => {
  const [rows] = await pool.query(
    `SELECT ${COLUMNS} FROM tasks WHERE user_id = ? ORDER BY created_at DESC`,
    [userId]
  );
  return rows;
};

const getTaskById = async (id, userId) => {
  const [rows] = await pool.query(
    `SELECT ${COLUMNS} FROM tasks WHERE id = ? AND user_id = ? LIMIT 1`,
    [id, userId]
  );
  return rows[0] || null;
};

const searchTasks = async (keyword, userId) => {
  const like = `%${keyword}%`;
  const [rows] = await pool.query(
    `SELECT ${COLUMNS} FROM tasks
     WHERE user_id = ?
     AND (title LIKE ? OR description LIKE ?)
     ORDER BY created_at DESC`,
    [userId, like, like]
  );
  return rows;
};

const createTask = async ({ title, description, due_date, status, remarks, created_by, userId }) => {
  const [result] = await pool.query(
    `INSERT INTO tasks (title, description, due_date, status, remarks, created_by, updated_by, user_id)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [title, description || null, due_date || null, status || 'Pending',
     remarks || null, created_by || 'System', created_by || 'System', userId]
  );
  return getTaskById(result.insertId, userId);
};

const updateTask = async (id, { title, description, due_date, status, remarks, updated_by }, userId) => {
  const [result] = await pool.query(
    `UPDATE tasks SET title=?, description=?, due_date=?, status=?, remarks=?, updated_by=?
     WHERE id=? AND user_id=?`,
    [title, description || null, due_date || null, status,
     remarks || null, updated_by || 'System', id, userId]
  );
  if (result.affectedRows === 0) return null;
  return getTaskById(id, userId);
};

const deleteTask = async (id, userId) => {
  const task = await getTaskById(id, userId);
  if (!task) return null;
  await pool.query('DELETE FROM tasks WHERE id = ? AND user_id = ?', [id, userId]);
  return task;
};

module.exports = {
  getAllTasks,
  getTaskById,
  searchTasks,
  createTask,
  updateTask,
  deleteTask,
};
