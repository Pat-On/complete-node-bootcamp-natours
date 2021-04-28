const express = require('express');
const tourController = require('../controlers/tourController');
const authController = require('../controlers/authController');

const router = express.Router();

// router.use(express.json());
//param middleware
//when it is called here, it would pass the id to function so the id is going to be defined
// router.param('id', tourController.checkID);

router
  .route('/top-5-cheap')
  .get(tourController.aliasTopTours, tourController.getAllTours);

router.route('/tours-stats').get(tourController.getTourStats);
router.route('/monthly-plan/:year').get(tourController.getMonthlyPlan);

router
  .route('/')
  // this authController.protect - is going actively protect not log in users to get access to it
  .get(authController.protect, tourController.getAllTours)
  .post(tourController.createTour);

router
  .route('/:id')
  .get(tourController.getTour)
  .patch(tourController.updateTour)
  //first middleware - if logged second if has permission
  .delete(
    authController.protect,
    authController.restrictTo('admin', 'lead-guid'),
    tourController.deleteTour
  );

module.exports = router;
