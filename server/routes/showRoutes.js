const express = require('express');
const router = express.Router();
const showController = require('../controllers/showController');
const seatController = require('../controllers/seatController');
const { protect } = require('../middleware/auth');
const { restrictTo } = require('../middleware/admin');

router
  .route('/')
  .get(showController.getShows)
  .post(protect, restrictTo('admin'), showController.createShow);

router
  .route('/:id')
  .get(showController.getShowById)
  .put(protect, restrictTo('admin'), showController.updateShow)
  .delete(protect, restrictTo('admin'), showController.deleteShow);

// Seats for a show
router.get('/:id/seats', seatController.getShowSeats);

module.exports = router;
