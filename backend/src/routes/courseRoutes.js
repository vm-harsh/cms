const express = require('express');
const courseController = require('../controllers/courseController');
const { authenticateUser } = require('../middleware/authMiddleware');
const { requireRole, requireCourseOwnership } = require('../middleware/rbacMiddleware');
const validate = require('../middleware/validateMiddleware');
const { ROLES } = require('../constants/roles');
const {
  createCourseSchema,
  updateCourseSchema,
  courseIdParamSchema,
  queryCoursesSchema,
} = require('../validators/courseValidators');

const router = express.Router();

// Apply authentication to all course routes
router.use(authenticateUser);

// List courses (scoped by role inside controller/service)
router.get(
  '/',
  validate(queryCoursesSchema),
  courseController.getAllCourses
);

// Get single course details
router.get(
  '/:id',
  validate(courseIdParamSchema),
  courseController.getCourseById
);

// Create new course (Admins & Faculty only, Students rejected with 403)
router.post(
  '/',
  requireRole(ROLES.ADMIN, ROLES.FACULTY),
  validate(createCourseSchema),
  courseController.createCourse
);

// Update course (Admins & Faculty owning the course only)
router.patch(
  '/:id',
  requireRole(ROLES.ADMIN, ROLES.FACULTY),
  requireCourseOwnership,
  validate(updateCourseSchema),
  courseController.updateCourse
);

// Delete course (Admins & Faculty owning the course only)
router.delete(
  '/:id',
  requireRole(ROLES.ADMIN, ROLES.FACULTY),
  requireCourseOwnership,
  validate(courseIdParamSchema),
  courseController.deleteCourse
);

module.exports = router;
