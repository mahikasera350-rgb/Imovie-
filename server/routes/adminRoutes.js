const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { protect } = require('../middleware/auth');
const { restrictTo } = require('../middleware/admin');

// All admin routes require authentication and admin role
router.use(protect, restrictTo('admin'));

router.get('/dashboard', adminController.getDashboardStats);
router.get('/bookings', adminController.getAdminBookings);
router.get('/users', adminController.getAdminUsers);
router.patch('/users/:id/role', adminController.updateUserRole);

module.exports = router;
