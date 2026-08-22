const userService = require('../services/userService');
const ApiResponse = require('../utils/apiResponse');

class UserController {
  /**
   * List all faculty members
   */
  async getFacultyList(req, res, next) {
    try {
      const faculty = await userService.getFacultyList();
      return ApiResponse.success(res, 'Faculty members retrieved', { faculty });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get dashboard metrics according to caller role
   */
  async getDashboardStats(req, res, next) {
    try {
      const stats = await userService.getDashboardStats(req.user);
      return ApiResponse.success(res, 'Dashboard statistics retrieved', { stats });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new UserController();
