const Theatre = require('../models/Theatre');
const Show = require('../models/Show');
const AppError = require('../utils/appError');
const AuditLog = require('../models/AuditLog');

// @desc    Get all theatres with optional city filter
// @route   GET /api/theatres
// @access  Public
const getTheatres = async (req, res, next) => {
  try {
    const { city, search } = req.query;
    const query = {};

    if (city) {
      query.city = { $regex: city, $options: 'i' };
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { address: { $regex: search, $options: 'i' } },
      ];
    }

    const theatres = await Theatre.find(query).sort('city name');

    res.status(200).json({
      status: 'success',
      results: theatres.length,
      data: { theatres },
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get distinct list of cities with theatres
// @route   GET /api/theatres/cities
// @access  Public
const getCities = async (req, res, next) => {
  try {
    const cities = await Theatre.distinct('city');
    res.status(200).json({
      status: 'success',
      data: { cities: cities.sort() },
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get single theatre by ID
// @route   GET /api/theatres/:id
// @access  Public
const getTheatreById = async (req, res, next) => {
  try {
    const theatre = await Theatre.findById(req.params.id);
    if (!theatre) {
      return next(new AppError('No theatre found with that ID', 404));
    }

    res.status(200).json({
      status: 'success',
      data: { theatre },
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Create new theatre
// @route   POST /api/theatres
// @access  Private (Admin)
const createTheatre = async (req, res, next) => {
  try {
    const theatre = await Theatre.create(req.body);

    await AuditLog.create({
      adminId: req.user.id,
      action: 'CREATE_THEATRE',
      targetType: 'Theatre',
      targetId: theatre._id.toString(),
      details: { name: theatre.name, city: theatre.city },
      ipAddress: req.ip,
    });

    res.status(201).json({
      status: 'success',
      data: { theatre },
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update theatre
// @route   PUT /api/theatres/:id
// @access  Private (Admin)
const updateTheatre = async (req, res, next) => {
  try {
    const theatre = await Theatre.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!theatre) {
      return next(new AppError('No theatre found with that ID', 404));
    }

    await AuditLog.create({
      adminId: req.user.id,
      action: 'UPDATE_THEATRE',
      targetType: 'Theatre',
      targetId: theatre._id.toString(),
      details: { name: theatre.name },
      ipAddress: req.ip,
    });

    res.status(200).json({
      status: 'success',
      data: { theatre },
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete theatre
// @route   DELETE /api/theatres/:id
// @access  Private (Admin)
const deleteTheatre = async (req, res, next) => {
  try {
    const theatre = await Theatre.findByIdAndDelete(req.params.id);
    if (!theatre) {
      return next(new AppError('No theatre found with that ID', 404));
    }

    await AuditLog.create({
      adminId: req.user.id,
      action: 'DELETE_THEATRE',
      targetType: 'Theatre',
      targetId: theatre._id.toString(),
      details: { name: theatre.name },
      ipAddress: req.ip,
    });

    res.status(200).json({
      status: 'success',
      message: 'Theatre deleted successfully',
      data: null,
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getTheatres,
  getCities,
  getTheatreById,
  createTheatre,
  updateTheatre,
  deleteTheatre,
};
