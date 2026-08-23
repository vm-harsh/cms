const express = require('express');
const adminController = require('../controllers/adminController');
const { authenticateUser } = require('../middleware/authMiddleware');
const { requireRole } = require('../middleware/rbacMiddleware');
const validate = require('../middleware/validateMiddleware');
const { ROLES } = require('../constants/roles');
const { createUserSchema } = require('../validators/adminValidators');

const router = express.Router();

// Strict Access: Only authenticated users with ADMIN role can access any /api/admin route
router.use(authenticateUser);
router.use(requireRole(ROLES.ADMIN));

// Admin Management
router.post('/admins', validate(createUserSchema), adminController.createAdmin);
router.get('/admins', adminController.getAdmins);

// Faculty Management
router.post('/faculty', validate(createUserSchema), adminController.createFaculty);
router.get('/faculty', adminController.getFaculty);

// Student Overview
router.get('/students', adminController.getStudents);

module.exports = router;
