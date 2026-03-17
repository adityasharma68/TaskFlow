// config/db.js
// ============================================================
// MySQL Database Connection Pool
// Uses mysql2/promise for async/await support
// ============================================================

const mysql = require('mysql2/promise');
require('dotenv').config();

/**
 * Creates a MySQL connection pool.
 * Pooling reuses connections and avoids per-request overhead.
 */
const pool = mysql.createPool({
  host:            process.env.DB_HOST     || 'y3f79f.h.filess.io',
  port:            parseInt(process.env.DB_PORT) || 61031,
  user:            process.env.DB_USER     || 'TaskFlow_shopsaveit',
  password:        process.env.DB_PASSWORD || 'c9bf9d70a97cfa16b29c5e963471e1f875911c9e',
  database:        process.env.DB_NAME     || 'TaskFlow_shopsaveit',
  waitForConnections: true,
  connectionLimit: 10,      // Max simultaneous connections
  queueLimit:      0,       // Unlimited queued requests
  charset:         'utf8mb4',
  timezone:        '+00:00', // Store/retrieve in UTC
});

/**
 * Tests the database connection on startup.
 * Logs success or exits the process on failure.
 */
const testConnection = async () => {
  try {
    const connection = await pool.getConnection();
    console.log(`✅  MySQL connected → ${process.env.DB_NAME}@${process.env.DB_HOST}`);
    connection.release();
  } catch (err) {
    console.error('❌  MySQL connection failed:', err.message);
    process.exit(1); // Fatal – cannot run without a database
  }
};

module.exports = { pool, testConnection };
