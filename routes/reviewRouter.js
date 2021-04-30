const express = require('express');
const reviewController = require('../controllers/reviewController');
const authController = require('../controllers/authController');

//by default each router have access only to its specific params.
const router = express.Router({ mergeParams: true });

router.route('/').get(reviewController.getAllReview).post(
  authController.protect, //logged
  authController.restrictTo('user'), //restriction to user
  reviewController.setTourUserIds,
  reviewController.createReview
);

router
  .route('/:id')
  .get(reviewController.getReview)
  .patch(reviewController.updateReview)
  .delete(reviewController.deleteReview);

module.exports = router;
