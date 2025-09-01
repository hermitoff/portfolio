// Core dependencies
const express = require('express');
const router = express.Router();
// Middleware
const { allowedLevel } = require('../middleware/permissionLevel');
// Import routes
const webRoutes = require('./web/web');
const adminWebRoutes = require('./web/admin');
const adminApiRoutes = require('./api/public-admin');
//const { authenticate } = require('../middleware/authenticate');

// Frontend routes
router.use('/', webRoutes);
router.use('/admin', adminWebRoutes);
//Backend API routes
router.use('/api/admin', adminApiRoutes);

module.exports = router;