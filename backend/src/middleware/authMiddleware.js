const prisma = require('../config/db');
const config = require('../config/env');
const ApiError = require('../utils/apiError');
const { verifyToken } = require('../utils/jwt');

/**
 * Authenticate incoming requests using HTTP-only cookie or Bearer token header
 */
async function authenticateUser(req, res, next) {
  try {
    let token = null;

    // 1. Check HTTP-only cookie first (Preferred and Secure)
    if (req.cookies && req.cookies[config.jwt.cookieName]) {
      token = req.cookies[config.jwt.cookieName];
    }
    // 2. Fallback to Authorization Header (e.g., Bearer <token> for API tools/tests)
    else if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer ')
    ) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      throw ApiError.unauthorized('Authentication token is missing. Please log in.');
    }

    // 3. Verify JWT signature and expiration
    let decoded;
    try {
      decoded = verifyToken(token);
    } catch (jwtErr) {
      if (jwtErr.name === 'TokenExpiredError') {
        throw ApiError.unauthorized('Session has expired. Please log in again.');
      }
      throw ApiError.unauthorized('Invalid authentication token.');
    }

    // 4. Fetch user from database to ensure account is active and role is up-to-date
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      throw ApiError.unauthorized('The user belonging to this session no longer exists.');
    }

    // 5. Attach user object to request
    req.user = user;
    next();
  } catch (error) {
    next(error);
  }
}

module.exports = {
  authenticateUser,
};
