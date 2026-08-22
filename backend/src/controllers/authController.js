const authService = require('../services/authService');
const ApiResponse = require('../utils/apiResponse');
const { getCookieOptions } = require('../utils/jwt');
const config = require('../config/env');

class AuthController {
  /**
   * Register a new user
   */
  async register(req, res, next) {
    try {
      const { user, token } = await authService.register(req.body);

      // Set secure HTTP-only cookie
      res.cookie(config.jwt.cookieName, token, getCookieOptions());

      return ApiResponse.created(res, 'Registration successful', { user });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Authenticate user with credentials
   */
  async login(req, res, next) {
    try {
      const { user, token } = await authService.login(req.body);

      // Set secure HTTP-only cookie
      res.cookie(config.jwt.cookieName, token, getCookieOptions());

      return ApiResponse.success(res, 'Login successful', { user });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Log out user and clear cookie
   */
  async logout(req, res, next) {
    try {
      const cookieOpts = getCookieOptions();
      delete cookieOpts.maxAge;

      res.clearCookie(config.jwt.cookieName, {
        ...cookieOpts,
      });

      return ApiResponse.success(res, 'Logout successful');
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get current authenticated user session
   */
  async getMe(req, res, next) {
    try {
      const user = await authService.getCurrentUser(req.user.id);
      return ApiResponse.success(res, 'Session retrieved successfully', { user });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new AuthController();
