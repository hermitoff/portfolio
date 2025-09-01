// Core dependencies
const express = require('express');
const router = express.Router();
// Middleware
const { allowedLevel } = require('../middleware/permissionLevel');
// Import routes
const webRoutes = require('./web/web');
const adminWebRoutes = require('./web/admin');
const adminApiRoutes = require('./api/public-admin');
const adminPagesApiRoutes = require('./api/admin-pages');
//const { authenticate } = require('../middleware/authenticate');

// Frontend routes
router.use('/admin', adminWebRoutes);
router.use('/', webRoutes);
//Backend API routes
router.use('/api/admin', adminApiRoutes);
router.use('/api/admin', adminPagesApiRoutes);

module.exports = router;