const express = require('express');
const tourController = require('./../controlers/tourController');

const router = express.Router();
// router.use(express.json());
//param middleware
//when it is called here, it would pass the id to function so the id is going to be defined
// router.param('id', tourController.checkID);

router
  .route('/')
  .get(tourController.getAllTours)
  .post(tourController.checkBody, tourController.createTour);

router
  .route('/:id')
  .get(tourController.getTour)
  .patch(tourController.updateTour)
  .delete(tourController.deleteTour);

module.exports = router;
