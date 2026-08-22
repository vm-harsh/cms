const express = require('express');
const userController = require('../controllers/userController');
const { authenticateUser } = require('../middleware/authMiddleware');
const { requireRole } = require('../middleware/rbacMiddleware');
const { ROLES } = require('../constants/roles');

const router = express.Router();

// Apply authentication to all user routes
router.use(authenticateUser);

// Faculty list (accessible by Admin and Faculty)
router.get(
  '/faculty',
  requireRole(ROLES.ADMIN, ROLES.FACULTY),
  userController.getFacultyList
);

// Dashboard metrics (all authenticated users, tailored to role)
router.get('/stats', userController.getDashboardStats);

module.exports = router;
