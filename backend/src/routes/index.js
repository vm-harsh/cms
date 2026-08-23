const express = require('express');
const authRoutes = require('./authRoutes');
const courseRoutes = require('./courseRoutes');
const userRoutes = require('./userRoutes');
const adminRoutes = require('./adminRoutes');

const router = express.Router();

// Health check endpoint
router.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'Course Management System API',
  });
});

// Mount module routers
router.use('/auth', authRoutes);
router.use('/courses', courseRoutes);
router.use('/users', userRoutes);
router.use('/admin', adminRoutes);

module.exports = router;
