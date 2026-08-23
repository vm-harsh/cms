const adminService = require('../services/adminService');
const ApiResponse = require('../utils/apiResponse');

class AdminController {
  /**
   * Create a new Administrator (Admin-only)
   */
  async createAdmin(req, res, next) {
    try {
      const user = await adminService.createAdmin(req.body);
      return ApiResponse.created(res, 'Administrator created successfully', { user });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Create a new Faculty member (Admin-only)
   */
  async createFaculty(req, res, next) {
    try {
      const user = await adminService.createFaculty(req.body);
      return ApiResponse.created(res, 'Faculty member created successfully', { user });
    } catch (error) {
      next(error);
    }
  }

  /**
   * List all administrators
   */
  async getAdmins(req, res, next) {
    try {
      const admins = await adminService.getAdmins();
      return ApiResponse.success(res, 'Administrators retrieved successfully', { admins });
    } catch (error) {
      next(error);
    }
  }

  /**
   * List all faculty members
   */
  async getFaculty(req, res, next) {
    try {
      const faculty = await adminService.getFaculty();
      return ApiResponse.success(res, 'Faculty members retrieved successfully', { faculty });
    } catch (error) {
      next(error);
    }
  }

  /**
   * List all students
   */
  async getStudents(req, res, next) {
    try {
      const students = await adminService.getStudents();
      return ApiResponse.success(res, 'Students retrieved successfully', { students });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new AdminController();
