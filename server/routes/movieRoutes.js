const express = require('express');
const router = express.Router();
const movieController = require('../controllers/movieController');
const { protect } = require('../middleware/auth');
const { restrictTo } = require('../middleware/admin');

router
  .route('/')
  .get(movieController.getMovies)
  .post(protect, restrictTo('admin'), movieController.createMovie);

router
  .route('/:id')
  .get(movieController.getMovieById)
  .put(protect, restrictTo('admin'), movieController.updateMovie)
  .delete(protect, restrictTo('admin'), movieController.deleteMovie);

module.exports = router;
