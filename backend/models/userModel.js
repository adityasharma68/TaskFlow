// models/userModel.js
const { pool } = require('../config/db');

const COLS = `id, name, email, avatar_color,
  DATE_FORMAT(created_at,'%Y-%m-%dT%H:%i:%sZ') AS created_at`;

const findByEmail = async (email) => {
  const [rows] = await pool.query(
    `SELECT ${COLS}, password FROM users WHERE email = ? LIMIT 1`,
    [email]
  );
  return rows[0] || null;
};

const findById = async (id) => {
  const [rows] = await pool.query(
    `SELECT ${COLS} FROM users WHERE id = ? LIMIT 1`,
    [id]
  );
  return rows[0] || null;
};

const createUser = async ({ name, email, hashedPassword, avatarColor }) => {
  const [result] = await pool.query(
    `INSERT INTO users (name, email, password, avatar_color) VALUES (?,?,?,?)`,
    [name, email, hashedPassword, avatarColor || '#14b8a6']
  );
  return findById(result.insertId);
};

const emailExists = async (email) => {
  const [rows] = await pool.query(
    'SELECT id FROM users WHERE email = ? LIMIT 1',
    [email]
  );
  return rows.length > 0;
};

module.exports = { findByEmail, findById, createUser, emailExists };
