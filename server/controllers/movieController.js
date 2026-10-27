const Movie = require('../models/Movie');
const Show = require('../models/Show');
const Theatre = require('../models/Theatre');
const AppError = require('../utils/appError');
const AuditLog = require('../models/AuditLog');

// @desc    Get all movies with filtering, search, pagination, and sorting
// @route   GET /api/movies
// @access  Public
const getMovies = async (req, res, next) => {
  try {
    const {
      search,
      genre,
      language,
      status, // 'now_showing' | 'coming_soon'
      city,
      featured,
      sort = '-releaseDate',
      page = 1,
      limit = 20,
    } = req.query;

    const query = {};

    // Filter by status
    if (status) {
      query.status = status;
    }

    // Filter by featured
    if (featured === 'true') {
      query.featured = true;
    }

    // Filter by genre (supports single or comma-separated)
    if (genre) {
      const genresArray = genre.split(',').map((g) => g.trim());
      query.genres = { $in: genresArray };
    }

    // Filter by language
    if (language) {
      const languagesArray = language.split(',').map((l) => l.trim());
      query.languages = { $in: languagesArray };
    }

    // Text search or title regex
    if (search && search.trim()) {
      query.$or = [
        { title: { $regex: search.trim(), $options: 'i' } },
        { description: { $regex: search.trim(), $options: 'i' } },
        { cast: { $regex: search.trim(), $options: 'i' } },
        { director: { $regex: search.trim(), $options: 'i' } },
      ];
    }

    // City filtering: If city is provided, filter movies that have active shows in that city
    if (city) {
      const theatresInCity = await Theatre.find({ city: { $regex: city, $options: 'i' } }).select('_id');
      const theatreIds = theatresInCity.map((t) => t._id);
      
      const activeShows = await Show.find({
        theatreId: { $in: theatreIds },
        status: 'active',
        endTime: { $gte: new Date() },
      }).distinct('movieId');

      // Intersect with existing query or filter
      query._id = { $in: activeShows };
    }

    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.max(1, Math.min(100, parseInt(limit, 10)));
    const skip = (pageNum - 1) * limitNum;

    // Sorting
    let sortField = sort;
    if (sort === 'rating') sortField = '-rating';
    if (sort === 'title') sortField = 'title';

    const [movies, total] = await Promise.all([
      Movie.find(query).sort(sortField).skip(skip).limit(limitNum),
      Movie.countDocuments(query),
    ]);

    res.status(200).json({
      status: 'success',
      results: movies.length,
      pagination: {
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum) || 1,
        totalResults: total,
      },
      data: { movies },
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get single movie by ID with optional active shows
// @route   GET /api/movies/:id
// @access  Public
const getMovieById = async (req, res, next) => {
  try {
    const movie = await Movie.findById(req.params.id);
    if (!movie) {
      return next(new AppError('No movie found with that ID', 404));
    }

    // Fetch related movies with similar genres
    const relatedMovies = await Movie.find({
      _id: { $ne: movie._id },
      genres: { $in: movie.genres },
    })
      .limit(6)
      .select('title posterUrl rating genres duration status');

    res.status(200).json({
      status: 'success',
      data: {
        movie,
        relatedMovies,
      },
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Create new movie
// @route   POST /api/movies
// @access  Private (Admin)
const createMovie = async (req, res, next) => {
  try {
    const movie = await Movie.create(req.body);

    // Audit log
    await AuditLog.create({
      adminId: req.user.id,
      action: 'CREATE_MOVIE',
      targetType: 'Movie',
      targetId: movie._id.toString(),
      details: { title: movie.title },
      ipAddress: req.ip,
    });

    res.status(201).json({
      status: 'success',
      data: { movie },
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update movie
// @route   PUT /api/movies/:id
// @access  Private (Admin)
const updateMovie = async (req, res, next) => {
  try {
    const movie = await Movie.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!movie) {
      return next(new AppError('No movie found with that ID', 404));
    }

    // Audit log
    await AuditLog.create({
      adminId: req.user.id,
      action: 'UPDATE_MOVIE',
      targetType: 'Movie',
      targetId: movie._id.toString(),
      details: { title: movie.title },
      ipAddress: req.ip,
    });

    res.status(200).json({
      status: 'success',
      data: { movie },
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete movie
// @route   DELETE /api/movies/:id
// @access  Private (Admin)
const deleteMovie = async (req, res, next) => {
  try {
    const movie = await Movie.findByIdAndDelete(req.params.id);

    if (!movie) {
      return next(new AppError('No movie found with that ID', 404));
    }

    // Audit log
    await AuditLog.create({
      adminId: req.user.id,
      action: 'DELETE_MOVIE',
      targetType: 'Movie',
      targetId: movie._id.toString(),
      details: { title: movie.title },
      ipAddress: req.ip,
    });

    res.status(200).json({
      status: 'success',
      message: 'Movie deleted successfully',
      data: null,
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getMovies,
  getMovieById,
  createMovie,
  updateMovie,
  deleteMovie,
};
