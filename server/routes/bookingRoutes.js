const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/bookingController');
const seatController = require('../controllers/seatController');
const { protect, optionalAuth } = require('../middleware/auth');

// Seat hold & release endpoints
router.post('/hold-seats', optionalAuth, seatController.holdSeats);
router.post('/release-hold', seatController.releaseHold);

// Customer bookings
router.post('/', protect, bookingController.createBooking);
router.get('/my', protect, bookingController.getMyBookings);
router.get('/:id', protect, bookingController.getBookingById);
router.post('/:id/cancel', protect, bookingController.cancelBooking);

module.exports = router;
