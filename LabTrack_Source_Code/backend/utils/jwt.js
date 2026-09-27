const jwt = require('jsonwebtoken');
require('dotenv').config();

// Create a signed JWT for a logged-in user
function generateToken(user) {
  return jwt.sign(
    {
      user_id: user.user_id,
      role: user.role,
      email: user.email,
    },
    process.env.JWT_SECRET,
    { expiresIn: '1d' }
  );
}

// Verify a token and return its decoded payload (throws if invalid)
function verifyToken(token) {
  return jwt.verify(token, process.env.JWT_SECRET);
}

module.exports = { generateToken, verifyToken };
