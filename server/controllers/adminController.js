const User = require('../models/User');
const Movie = require('../models/Movie');
const Theatre = require('../models/Theatre');
const Show = require('../models/Show');
const Booking = require('../models/Booking');
const Payment = require('../models/Payment');
const AuditLog = require('../models/AuditLog');
const AppError = require('../utils/appError');

// @desc    Get aggregated admin dashboard metrics
// @route   GET /api/admin/dashboard
// @access  Private (Admin)
const getDashboardStats = async (req, res, next) => {
  try {
    const now = new Date();

    const [
      totalUsers,
      totalMovies,
      totalTheatres,
      upcomingShows,
      totalBookings,
      revenueResult,
      recentBookings,
      recentLogs,
    ] = await Promise.all([
      User.countDocuments(),
      Movie.countDocuments(),
      Theatre.countDocuments(),
      Show.countDocuments({ status: 'active', startTime: { $gte: now } }),
      Booking.countDocuments(),
      Payment.aggregate([
        { $match: { status: 'success' } },
        { $group: { _id: null, totalRevenue: { $sum: '$amount' } } },
      ]),
      Booking.find()
        .populate('userId', 'name email')
        .populate({
          path: 'showId',
          populate: [
            { path: 'movieId', select: 'title posterUrl' },
            { path: 'theatreId', select: 'name city' },
          ],
        })
        .sort('-createdAt')
        .limit(8),
      AuditLog.find()
        .populate('adminId', 'name email')
        .sort('-createdAt')
        .limit(10),
    ]);

    const totalRevenue = revenueResult.length > 0 ? parseFloat(revenueResult[0].totalRevenue.toFixed(2)) : 0;

    res.status(200).json({
      status: 'success',
      data: {
        metrics: {
          totalUsers,
          totalMovies,
          totalTheatres,
          upcomingShows,
          totalBookings,
          totalRevenue,
        },
        recentBookings,
        recentLogs,
      },
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get all bookings with admin filters and pagination
// @route   GET /api/admin/bookings
// @access  Private (Admin)
const getAdminBookings = async (req, res, next) => {
  try {
    const { search, status, paymentStatus, page = 1, limit = 20 } = req.query;
    const query = {};

    if (status) query.bookingStatus = status;
    if (paymentStatus) query.paymentStatus = paymentStatus;
    if (search) {
      query.bookingReference = { $regex: search.trim(), $options: 'i' };
    }

    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.max(1, Math.min(100, parseInt(limit, 10)));
    const skip = (pageNum - 1) * limitNum;

    const [bookings, total] = await Promise.all([
      Booking.find(query)
        .populate('userId', 'name email phone')
        .populate({
          path: 'showId',
          populate: [
            { path: 'movieId', select: 'title posterUrl' },
            { path: 'theatreId', select: 'name city' },
          ],
        })
        .sort('-createdAt')
        .skip(skip)
        .limit(limitNum),
      Booking.countDocuments(query),
    ]);

    res.status(200).json({
      status: 'success',
      results: bookings.length,
      pagination: {
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum) || 1,
        totalResults: total,
      },
      data: { bookings },
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get all users with admin filters and role toggle
// @route   GET /api/admin/users
// @access  Private (Admin)
const getAdminUsers = async (req, res, next) => {
  try {
    const { search, role, page = 1, limit = 20 } = req.query;
    const query = {};

    if (role) query.role = role;
    if (search) {
      query.$or = [
        { name: { $regex: search.trim(), $options: 'i' } },
        { email: { $regex: search.trim(), $options: 'i' } },
      ];
    }

    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.max(1, Math.min(100, parseInt(limit, 10)));
    const skip = (pageNum - 1) * limitNum;

    const [users, total] = await Promise.all([
      User.find(query).sort('-createdAt').skip(skip).limit(limitNum),
      User.countDocuments(query),
    ]);

    res.status(200).json({
      status: 'success',
      results: users.length,
      pagination: {
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum) || 1,
        totalResults: total,
      },
      data: { users },
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update user role (promote to admin or demote)
// @route   PATCH /api/admin/users/:id/role
// @access  Private (Admin)
const updateUserRole = async (req, res, next) => {
  try {
    const { role } = req.body;
    if (!['customer', 'admin'].includes(role)) {
      return next(new AppError('Invalid role specified', 400));
    }

    // Prevent demoting oneself
    if (req.params.id === req.user.id && role !== 'admin') {
      return next(new AppError('You cannot demote your own administrator account', 400));
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      { role },
      { new: true }
    );

    if (!updatedUser) {
      return next(new AppError('User not found', 404));
    }

    await AuditLog.create({
      adminId: req.user.id,
      action: 'UPDATE_USER_ROLE',
      targetType: 'User',
      targetId: updatedUser._id.toString(),
      details: { email: updatedUser.email, newRole: role },
      ipAddress: req.ip,
    });

    res.status(200).json({
      status: 'success',
      data: { user: updatedUser },
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getDashboardStats,
  getAdminBookings,
  getAdminUsers,
  updateUserRole,
};
