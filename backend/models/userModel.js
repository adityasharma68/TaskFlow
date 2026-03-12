// models/userModel.js
// ============================================================
// User Model – DB queries for the `users` table.
// ============================================================

const { pool } = require('../config/db');

const COLS = `id, name, email, avatar_color,
  DATE_FORMAT(created_at,'%Y-%m-%dT%H:%i:%sZ') AS created_at`;

/** Find user by email (includes password hash for auth check) */
const findByEmail = async (email) => {
  const [rows] = await pool.query(
    `SELECT ${COLS}, password FROM users WHERE email = ? LIMIT 1`,
    [email]
  );
  return rows[0] || null;
};

/** Find user by id (no password returned) */
const findById = async (id) => {
  const [rows] = await pool.query(
    `SELECT ${COLS} FROM users WHERE id = ? LIMIT 1`,
    [id]
  );
  return rows[0] || null;
};

/** Create a new user */
const createUser = async ({ name, email, hashedPassword, avatarColor }) => {
  const [result] = await pool.query(
    `INSERT INTO users (name, email, password, avatar_color) VALUES (?,?,?,?)`,
    [name, email, hashedPassword, avatarColor || '#14b8a6']
  );
  return findById(result.insertId);
};

/** Check if email already exists */
const emailExists = async (email) => {
  const [rows] = await pool.query(
    'SELECT id FROM users WHERE email = ? LIMIT 1',
    [email]
  );
  return rows.length > 0;
};

module.exports = { findByEmail, findById, createUser, emailExists };
