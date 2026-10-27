const express = require('express');
const router = express.Router();
const theatreController = require('../controllers/theatreController');
const { protect } = require('../middleware/auth');
const { restrictTo } = require('../middleware/admin');

router.get('/cities', theatreController.getCities);

router
  .route('/')
  .get(theatreController.getTheatres)
  .post(protect, restrictTo('admin'), theatreController.createTheatre);

router
  .route('/:id')
  .get(theatreController.getTheatreById)
  .put(protect, restrictTo('admin'), theatreController.updateTheatre)
  .delete(protect, restrictTo('admin'), theatreController.deleteTheatre);

module.exports = router;
