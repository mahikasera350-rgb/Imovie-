const crypto = require('crypto');
const Booking = require('../models/Booking');
const SeatInventory = require('../models/SeatInventory');
const Show = require('../models/Show');
const Notification = require('../models/Notification');
const AppError = require('../utils/appError');
const { broadcastSeatsReleased, emitNotificationToUser } = require('../services/socketService');

// Helper to generate human-readable unique booking reference
const generateBookingReference = () => {
  const characters = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let ref = 'IMV-';
  for (let i = 0; i < 7; i++) {
    ref += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return ref;
};

// @desc    Initiate a new booking from held seats
// @route   POST /api/bookings
// @access  Private
const createBooking = async (req, res, next) => {
  try {
    const { showId, holdToken, seatNumbers, idempotencyKey } = req.body;
    const userId = req.user.id;

    if (!showId || !holdToken || !seatNumbers || !Array.isArray(seatNumbers) || seatNumbers.length === 0) {
      return next(new AppError('Please provide showId, holdToken, and seatNumbers', 400));
    }

    // Check Idempotency: If this request has already been processed with this key, return the existing booking
    if (idempotencyKey) {
      const existingBooking = await Booking.findOne({ idempotencyKey, userId })
        .populate({
          path: 'showId',
          populate: [
            { path: 'movieId', select: 'title posterUrl duration certification rating' },
            { path: 'theatreId', select: 'name city address screens' },
          ],
        });

      if (existingBooking) {
        return res.status(200).json({
          status: 'success',
          isDuplicate: true,
          data: { booking: existingBooking },
        });
      }
    }

    const show = await Show.findById(showId);
    if (!show || show.status !== 'active') {
      return next(new AppError('Show not found or no longer active', 404));
    }

    const now = new Date();

    // Verify all requested seats are currently held with this holdToken and NOT expired
    const heldSeats = await SeatInventory.find({
      showId,
      seatNumber: { $in: seatNumbers },
      status: 'held',
      holdToken,
      holdExpiresAt: { $gt: now },
    });

    if (heldSeats.length !== seatNumbers.length) {
      return next(
        new AppError(
          'One or more of your selected seats have expired or are no longer on hold. Please re-select your seats.',
          409
        )
      );
    }

    // Calculate verified prices from database
    const verifiedSeats = heldSeats.map((s) => ({
      seatNumber: s.seatNumber,
      category: s.category,
      price: s.price,
    }));

    const subtotal = verifiedSeats.reduce((sum, s) => sum + s.price, 0);
    const convenienceFee = parseFloat((verifiedSeats.length * 1.5).toFixed(2));
    const taxes = parseFloat(((subtotal + convenienceFee) * 0.1).toFixed(2));
    const totalAmount = parseFloat((subtotal + convenienceFee + taxes).toFixed(2));

    const bookingReference = generateBookingReference();

    const booking = await Booking.create({
      bookingReference,
      userId,
      showId,
      seats: verifiedSeats,
      seatNumbers,
      subtotal,
      convenienceFee,
      taxes,
      totalAmount,
      bookingStatus: 'pending',
      paymentStatus: 'pending',
      idempotencyKey: idempotencyKey || null,
      holdToken,
    });

    // Link booking to seat inventory
    await SeatInventory.updateMany(
      {
        showId,
        seatNumber: { $in: seatNumbers },
        holdToken,
      },
      {
        $set: {
          bookingId: booking._id,
          heldByUserId: userId,
        },
      }
    );

    const populatedBooking = await Booking.findById(booking._id).populate({
      path: 'showId',
      populate: [
        { path: 'movieId', select: 'title posterUrl duration certification rating' },
        { path: 'theatreId', select: 'name city address screens' },
      ],
    });

    res.status(201).json({
      status: 'success',
      data: {
        booking: populatedBooking,
      },
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get user's personal booking history
// @route   GET /api/bookings/my
// @access  Private
const getMyBookings = async (req, res, next) => {
  try {
    const { status } = req.query;
    const query = { userId: req.user.id };

    if (status) {
      query.bookingStatus = status;
    }

    const bookings = await Booking.find(query)
      .populate({
        path: 'showId',
        populate: [
          { path: 'movieId', select: 'title posterUrl duration certification rating' },
          { path: 'theatreId', select: 'name city address facilities' },
        ],
      })
      .sort('-createdAt');

    res.status(200).json({
      status: 'success',
      results: bookings.length,
      data: { bookings },
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get booking details by ID
// @route   GET /api/bookings/:id
// @access  Private
const getBookingById = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate({
        path: 'showId',
        populate: [
          { path: 'movieId' },
          { path: 'theatreId' },
        ],
      })
      .populate('userId', 'name email phone');

    if (!booking) {
      return next(new AppError('No booking found with that ID', 404));
    }

    // Security check: Only the booking owner or an admin can access
    if (booking.userId._id.toString() !== req.user.id && req.user.role !== 'admin') {
      return next(new AppError('You do not have permission to view this booking', 403));
    }

    res.status(200).json({
      status: 'success',
      data: { booking },
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Cancel booking and release seats
// @route   POST /api/bookings/:id/cancel
// @access  Private
const cancelBooking = async (req, res, next) => {
  try {
    const { reason } = req.body;
    const booking = await Booking.findById(req.params.id).populate('showId');

    if (!booking) {
      return next(new AppError('No booking found with that ID', 404));
    }

    // Authorization
    if (booking.userId.toString() !== req.user.id && req.user.role !== 'admin') {
      return next(new AppError('You do not have permission to cancel this booking', 403));
    }

    if (booking.bookingStatus === 'cancelled') {
      return next(new AppError('This booking is already cancelled', 400));
    }

    // Check cancellation policy: Show must not have already started
    if (booking.showId && booking.showId.startTime) {
      const showStart = new Date(booking.showId.startTime);
      if (showStart <= new Date()) {
        return next(new AppError('Cannot cancel a booking for a show that has already started or completed', 400));
      }
    }

    // Transition booking status
    booking.bookingStatus = 'cancelled';
    booking.paymentStatus = booking.paymentStatus === 'completed' ? 'refunded' : booking.paymentStatus;
    booking.cancelledAt = new Date();
    booking.cancellationReason = reason || 'Customer requested cancellation';
    booking.refundAmount = booking.totalAmount; // full refund policy
    await booking.save();

    // Release seats in inventory back to available
    await SeatInventory.updateMany(
      {
        showId: booking.showId._id,
        seatNumber: { $in: booking.seatNumbers },
      },
      {
        $set: {
          status: 'available',
          holdToken: null,
          holdExpiresAt: null,
          heldByUserId: null,
          bookingId: null,
        },
      }
    );

    // Broadcast seat release to active users
    broadcastSeatsReleased(booking.showId._id.toString(), booking.seatNumbers);

    // In-app notification
    const notification = await Notification.create({
      userId: booking.userId,
      title: 'Booking Cancelled',
      type: 'booking_cancelled',
      message: `Your booking (${booking.bookingReference}) has been cancelled. Refund of $${booking.totalAmount} will be processed.`,
      data: { bookingId: booking._id, bookingReference: booking.bookingReference },
    });

    emitNotificationToUser(booking.userId.toString(), notification);

    res.status(200).json({
      status: 'success',
      message: 'Booking cancelled successfully and refund initiated',
      data: { booking },
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  createBooking,
  getMyBookings,
  getBookingById,
  cancelBooking,
};
