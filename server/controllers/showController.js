const Show = require('../models/Show');
const Movie = require('../models/Movie');
const Theatre = require('../models/Theatre');
const SeatInventory = require('../models/SeatInventory');
const Booking = require('../models/Booking');
const AppError = require('../utils/appError');
const AuditLog = require('../models/AuditLog');

// Helper to generate seat inventory from theatre screen layout
const initializeShowSeats = async (show, theatre) => {
  const screen = theatre.screens.find((s) => s.screenNumber === show.screenNumber) || theatre.screens[0];
  const seatLayout = screen.seatLayout || {
    rows: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'],
    seatsPerRow: 12,
    categoryMap: {
      recliner: ['A'],
      premium: ['B', 'C', 'D'],
      regular: ['E', 'F', 'G', 'H'],
    },
  };

  const seatsToInsert = [];

  for (const row of seatLayout.rows) {
    let category = 'regular';
    if (seatLayout.categoryMap.recliner && seatLayout.categoryMap.recliner.includes(row)) {
      category = 'recliner';
    } else if (seatLayout.categoryMap.premium && seatLayout.categoryMap.premium.includes(row)) {
      category = 'premium';
    }

    const price = show.seatPricing[category] || show.seatPricing.regular;

    for (let num = 1; num <= seatLayout.seatsPerRow; num++) {
      seatsToInsert.push({
        showId: show._id,
        seatNumber: `${row}${num}`,
        row,
        number: num,
        category,
        price,
        status: 'available',
      });
    }
  }

  if (seatsToInsert.length > 0) {
    await SeatInventory.insertMany(seatsToInsert, { ordered: false });
  }
};

// @desc    Get shows with filtering by movie, theatre, city, and date
// @route   GET /api/shows
// @access  Public
const getShows = async (req, res, next) => {
  try {
    const { movieId, theatreId, city, date, format } = req.query;
    const query = { status: 'active' };

    if (movieId) query.movieId = movieId;
    if (theatreId) query.theatreId = theatreId;
    if (date) query.showDate = date;
    if (format) query.format = format;

    // If city is requested, filter theatres in that city
    if (city) {
      const theatres = await Theatre.find({ city: { $regex: city, $options: 'i' } }).select('_id');
      const theatreIds = theatres.map((t) => t._id);
      query.theatreId = { $in: theatreIds };
    }

    const shows = await Show.find(query)
      .populate('movieId', 'title posterUrl duration certification rating genres')
      .populate('theatreId', 'name city address facilities screens')
      .sort('startTime');

    res.status(200).json({
      status: 'success',
      results: shows.length,
      data: { shows },
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get single show by ID
// @route   GET /api/shows/:id
// @access  Public
const getShowById = async (req, res, next) => {
  try {
    const show = await Show.findById(req.params.id)
      .populate('movieId')
      .populate('theatreId');

    if (!show) {
      return next(new AppError('No show found with that ID', 404));
    }

    res.status(200).json({
      status: 'success',
      data: { show },
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Create show with overlap checking and seat inventory creation
// @route   POST /api/shows
// @access  Private (Admin)
const createShow = async (req, res, next) => {
  try {
    const {
      movieId,
      theatreId,
      screenNumber,
      screenName,
      showDate,
      startTime,
      endTime,
      seatPricing,
      format,
      language,
    } = req.body;

    // Validate movie and theatre references
    const [movie, theatre] = await Promise.all([
      Movie.findById(movieId),
      Theatre.findById(theatreId),
    ]);

    if (!movie) {
      return next(new AppError('Referenced movie not found', 404));
    }
    if (!theatre) {
      return next(new AppError('Referenced theatre not found', 404));
    }

    const start = new Date(startTime);
    const end = new Date(endTime);

    if (end <= start) {
      return next(new AppError('Show end time must be after start time', 400));
    }

    // Check for overlapping shows on the same screen at the same theatre
    const overlappingShow = await Show.findOne({
      theatreId,
      screenNumber,
      status: 'active',
      $or: [
        { startTime: { $lt: end }, endTime: { $gt: start } },
      ],
    });

    if (overlappingShow) {
      return next(
        new AppError(
          `Overlapping show conflict: Screen ${screenNumber} is already scheduled from ${overlappingShow.startTime.toLocaleTimeString()} to ${overlappingShow.endTime.toLocaleTimeString()}`,
          409
        )
      );
    }

    const show = await Show.create({
      movieId,
      theatreId,
      screenNumber,
      screenName: screenName || `Screen ${screenNumber}`,
      showDate,
      startTime: start,
      endTime: end,
      seatPricing,
      format: format || 'Standard 2D',
      language: language || (movie.languages && movie.languages[0]) || 'English',
      status: 'active',
    });

    // Initialize seat inventory for this show
    await initializeShowSeats(show, theatre);

    // Audit log
    await AuditLog.create({
      adminId: req.user.id,
      action: 'CREATE_SHOW',
      targetType: 'Show',
      targetId: show._id.toString(),
      details: {
        movieId,
        theatreId,
        screenNumber,
        showDate,
        startTime,
      },
      ipAddress: req.ip,
    });

    res.status(201).json({
      status: 'success',
      data: { show },
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update show
// @route   PUT /api/shows/:id
// @access  Private (Admin)
const updateShow = async (req, res, next) => {
  try {
    const show = await Show.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!show) {
      return next(new AppError('No show found with that ID', 404));
    }

    await AuditLog.create({
      adminId: req.user.id,
      action: 'UPDATE_SHOW',
      targetType: 'Show',
      targetId: show._id.toString(),
      details: req.body,
      ipAddress: req.ip,
    });

    res.status(200).json({
      status: 'success',
      data: { show },
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete or cancel show
// @route   DELETE /api/shows/:id
// @access  Private (Admin)
const deleteShow = async (req, res, next) => {
  try {
    const show = await Show.findById(req.params.id);
    if (!show) {
      return next(new AppError('No show found with that ID', 404));
    }

    // Check if there are active bookings
    const activeBookings = await Booking.countDocuments({
      showId: show._id,
      bookingStatus: 'confirmed',
    });

    if (activeBookings > 0) {
      return next(
        new AppError(
          `Cannot delete show with ${activeBookings} confirmed booking(s). Please cancel the show instead.`,
          400
        )
      );
    }

    await SeatInventory.deleteMany({ showId: show._id });
    await Show.findByIdAndDelete(req.params.id);

    await AuditLog.create({
      adminId: req.user.id,
      action: 'DELETE_SHOW',
      targetType: 'Show',
      targetId: show._id.toString(),
      details: { showDate: show.showDate },
      ipAddress: req.ip,
    });

    res.status(200).json({
      status: 'success',
      message: 'Show and seat inventory deleted successfully',
      data: null,
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getShows,
  getShowById,
  createShow,
  updateShow,
  deleteShow,
};
