const pool = require('../config/db');
const { hashPassword } = require('../utils/bcrypt');
const ApiError = require('../utils/ApiError');

async function listUsers() {
  const result = await pool.query(
    'SELECT user_id, name, email, role, created_at FROM users ORDER BY user_id'
  );
  return result.rows;
}

async function getUser(id) {
  const result = await pool.query(
    'SELECT user_id, name, email, role, created_at FROM users WHERE user_id = $1',
    [id]
  );
  if (result.rows.length === 0) throw new ApiError(404, 'User not found');
  return result.rows[0];
}

async function createUser({ name, email, password, role }) {
  if (!name || !email || !password || !role) {
    throw new ApiError(400, 'All fields are required');
  }

  const hashedPassword = await hashPassword(password);

  const result = await pool.query(
    `INSERT INTO users (name, email, password_hash, role)
     VALUES ($1, $2, $3, $4)
     RETURNING user_id, name, email, role, created_at`,
    [name, email, hashedPassword, role]
  );

  return result.rows[0];
}

async function updateUser(id, { name, role }) {
  const result = await pool.query(
    `UPDATE users SET name = COALESCE($1, name), role = COALESCE($2, role)
     WHERE user_id = $3
     RETURNING user_id, name, email, role, created_at`,
    [name, role, id]
  );

  if (result.rows.length === 0) throw new ApiError(404, 'User not found');
  return result.rows[0];
}

async function deleteUser(id) {
  const result = await pool.query('DELETE FROM users WHERE user_id = $1 RETURNING user_id', [id]);
  if (result.rows.length === 0) throw new ApiError(404, 'User not found');
  return { message: 'User deleted' };
}

module.exports = { listUsers, getUser, createUser, updateUser, deleteUser };
