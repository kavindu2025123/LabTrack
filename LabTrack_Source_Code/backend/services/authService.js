const pool = require('../config/db');
const { hashPassword, comparePassword } = require('../utils/bcrypt');
const { generateToken } = require('../utils/jwt');
const ApiError = require('../utils/ApiError');

async function register({ name, email, password, role }) {
  if (!name || !email || !password) {
    throw new ApiError(400, 'Name, email and password are required');
  }

  // Only allow public self-registration as Student.
  // Technical_Officer / Admin accounts should be created by an Admin (userService).
  const userRole = role === 'Student' || !role ? 'Student' : role;

  const existing = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
  if (existing.rows.length > 0) {
    throw new ApiError(400, 'Email already registered');
  }

  const hashedPassword = await hashPassword(password);

  const result = await pool.query(
    `INSERT INTO users (name, email, password_hash, role)
     VALUES ($1, $2, $3, $4)
     RETURNING user_id, name, email, role, created_at`,
    [name, email, hashedPassword, userRole]
  );

  const newUser = result.rows[0];
  const token = generateToken(newUser);

  return { user: newUser, token };
}

async function login({ email, password }) {
  if (!email || !password) {
    throw new ApiError(400, 'Email and password are required');
  }

  const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
  const user = result.rows[0];

  if (!user) {
    throw new ApiError(401, 'Invalid email or password');
  }

  const isMatch = await comparePassword(password, user.password_hash);
  if (!isMatch) {
    throw new ApiError(401, 'Invalid email or password');
  }

  const token = generateToken(user);

  return {
    user: {
      user_id: user.user_id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
    token,
  };
}

module.exports = { register, login };
