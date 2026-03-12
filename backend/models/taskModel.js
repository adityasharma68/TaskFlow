// models/taskModel.js
// ============================================================
// Task Model – All MySQL queries for the `tasks` table.
// CHANGE: Every query now filters by user_id so tasks are
//         completely isolated per user.
// ============================================================

const { pool } = require('../config/db');

/**
 * Columns selected on every query.
 * DATE_FORMAT converts timestamps to ISO-8601 strings for JSON.
 */
const COLUMNS = `
  id, title, description, due_date, status,
  remarks, created_by, updated_by,
  DATE_FORMAT(created_at, '%Y-%m-%dT%H:%i:%sZ') AS created_at,
  DATE_FORMAT(updated_at, '%Y-%m-%dT%H:%i:%sZ') AS updated_at
`;

// ── Get all tasks for a specific user ──────────────────────
// CHANGE: Added WHERE user_id = ? so each user sees only their tasks
const getAllTasks = async (userId) => {
  const [rows] = await pool.query(
    `SELECT ${COLUMNS} FROM tasks
     WHERE  user_id = ?
     ORDER  BY created_at DESC`,
    [userId]
  );
  return rows;
};

// ── Get single task — only if it belongs to this user ──────
// CHANGE: Added AND user_id = ? to prevent accessing other users' tasks
const getTaskById = async (id, userId) => {
  const [rows] = await pool.query(
    `SELECT ${COLUMNS} FROM tasks
     WHERE id = ? AND user_id = ?
     LIMIT 1`,
    [id, userId]
  );
  return rows[0] || null;
};

// ── Search tasks — scoped to logged-in user only ───────────
// CHANGE: Added AND user_id = ? so search only finds the user's own tasks
const searchTasks = async (keyword, userId) => {
  const like = `%${keyword}%`;
  const [rows] = await pool.query(
    `SELECT ${COLUMNS}
     FROM   tasks
     WHERE  user_id = ?
       AND  (title LIKE ? OR description LIKE ?)
     ORDER  BY created_at DESC`,
    [userId, like, like]
  );
  return rows;
};

// ── Create a task — automatically assign user_id ───────────
// CHANGE: user_id is now stored with every new task
const createTask = async ({ title, description, due_date, status, remarks, created_by, userId }) => {
  const [result] = await pool.query(
    `INSERT INTO tasks
       (title, description, due_date, status, remarks, created_by, updated_by, user_id)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      title,
      description  || null,
      due_date     || null,
      status       || 'Pending',
      remarks      || null,
      created_by   || 'System',
      created_by   || 'System',
      userId,                     // ← owner of this task
    ]
  );
  // Return the newly created task (scoped to this user)
  return getTaskById(result.insertId, userId);
};

// ── Update task — only if it belongs to this user ──────────
// CHANGE: WHERE clause includes AND user_id = ? to block editing others' tasks
const updateTask = async (id, { title, description, due_date, status, remarks, updated_by }, userId) => {
  const [result] = await pool.query(
    `UPDATE tasks
     SET    title       = ?,
            description = ?,
            due_date    = ?,
            status      = ?,
            remarks     = ?,
            updated_by  = ?
     WHERE  id = ? AND user_id = ?`,
    [
      title,
      description || null,
      due_date    || null,
      status,
      remarks     || null,
      updated_by  || 'System',
      id,
      userId,   // ← ensures user can only edit their own task
    ]
  );
  if (result.affectedRows === 0) return null; // not found or not owned by user
  return getTaskById(id, userId);
};

// ── Delete task — only if it belongs to this user ──────────
// CHANGE: WHERE clause includes AND user_id = ? to block deleting others' tasks
const deleteTask = async (id, userId) => {
  const task = await getTaskById(id, userId); // verify ownership first
  if (!task) return null;
  await pool.query(
    'DELETE FROM tasks WHERE id = ? AND user_id = ?',
    [id, userId]
  );
  return task; // return deleted task for the response payload
};

module.exports = {
  getAllTasks,
  getTaskById,
  searchTasks,
  createTask,
  updateTask,
  deleteTask,
};
