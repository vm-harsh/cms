const courseService = require('../services/courseService');
const ApiResponse = require('../utils/apiResponse');

class CourseController {
  /**
   * List courses based on role & search query
   */
  async getAllCourses(req, res, next) {
    try {
      const courses = await courseService.getCourses(req.user, req.query);
      return ApiResponse.success(
        res,
        'Courses fetched successfully',
        { courses, count: courses.length }
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get single course details
   */
  async getCourseById(req, res, next) {
    try {
      const course = await courseService.getCourseById(req.params.id, req.user);
      return ApiResponse.success(res, 'Course retrieved successfully', { course });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Create a new course
   */
  async createCourse(req, res, next) {
    try {
      const newCourse = await courseService.createCourse(req.body, req.user);
      return ApiResponse.created(res, 'Course created successfully', { course: newCourse });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update existing course
   */
  async updateCourse(req, res, next) {
    try {
      const updatedCourse = await courseService.updateCourse(
        req.params.id,
        req.body,
        req.user
      );
      return ApiResponse.success(res, 'Course updated successfully', {
        course: updatedCourse,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Delete course
   */
  async deleteCourse(req, res, next) {
    try {
      const result = await courseService.deleteCourse(req.params.id, req.user);
      return ApiResponse.success(res, `Course '${result.title}' deleted successfully`, {
        deletedId: result.id,
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new CourseController();
