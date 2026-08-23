const jwt = require('jsonwebtoken');
const config = require('../config/env');

/**
 * Sign JWT token for user payload
 */
function generateToken(user) {
  const payload = {
    id: user.id,
    email: user.email,
    role: user.role,
  };

  return jwt.sign(payload, config.jwt.secret, {
    expiresIn: config.jwt.expiresIn,
  });
}

/**
 * Verify JWT token
 */
function verifyToken(token) {
  return jwt.verify(token, config.jwt.secret);
}

/**
 * Get standardized cookie options
 */
function getCookieOptions() {
  const isProduction = config.nodeEnv === 'production';
  return {
    httpOnly: true,
    secure: isProduction,
    sameSite: "none",
    secure: true,
    maxAge: config.jwt.cookieMaxAge,
    path: '/',
  };
}

module.exports = {
  generateToken,
  verifyToken,
  getCookieOptions,
};
