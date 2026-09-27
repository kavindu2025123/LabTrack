const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }, // required for Neon
});

// IMPORTANT: Neon can drop idle connections. Without this handler, that drop
// fires an unhandled 'error' event on the Pool and crashes the whole process.
pool.on('error', (err) => {
  console.error('Unexpected error on idle PostgreSQL client:', err.message);
});

// Test the connection once at startup, then release the client back to the pool
// (pool.connect() without release() leaves a client open indefinitely, which is
// what was causing the crash).
pool.connect()
  .then((client) => {
    console.log('Connected to PostgreSQL (Neon)');
    client.release();
  })
  .catch((err) => console.error('Database connection error:', err.message));

module.exports = pool;