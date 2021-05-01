const express = require('express');
const tourController = require('../controllers/tourController');
const authController = require('../controllers/authController');
// const reviewController = require('../controllers/reviewController');
const reviewRouter = require('./reviewRouter');

const router = express.Router();

//v158 nested routed with express - router is just middleware
//mounting the routes like in app.js
router.use('/:tourId/reviews', reviewRouter);

// router.use(express.json());
//param middleware
//when it is called here, it would pass the id to function so the id is going to be defined
// router.param('id', tourController.checkID);

router
  .route('/top-5-cheap')
  .get(tourController.aliasTopTours, tourController.getAllTours);

router.route('/tours-stats').get(tourController.getTourStats);
router
  .route('/monthly-plan/:year')
  .get(
    authController.protect,
    authController.restrictTo('admin', 'lead-guid', 'guide'),
    tourController.getMonthlyPlan
  );

router
  .route('/')
  // this authController.protect - is going actively protect not log in users to get access to it
  .get(tourController.getAllTours)
  .post(
    authController.protect,
    authController.restrictTo('admin', 'lead-guid'),
    tourController.createTour
  );

router
  .route('/:id')
  .get(tourController.getTour)
  .patch(
    authController.protect,
    authController.restrictTo('admin', 'lead-guid'),
    tourController.updateTour
  )
  //first middleware - if logged second if has permission
  .delete(
    authController.protect,
    authController.restrictTo('admin', 'lead-guid'),
    tourController.deleteTour
  );

//Post /tour/id_of_Tour/reviews and user id is coming from currently
//logged user
// this is example of the nester route - clear parent child relationship

//simple nested route reviews belong to tours
// router
//   .route('/:tourId/reviews')
//   .post(
//     authController.protect,
//     authController.restrictTo('user'),
//     reviewController.createReview
//   );

module.exports = router;
