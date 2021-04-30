const express = require('express');
const reviewController = require('../controllers/reviewController');
const authController = require('../controllers/authController');

const router = express.Router();

router.route('/').get(reviewController.getAllReview).post(
  authController.protect, //logged
  authController.restrictTo('user'), //restriction to user
  reviewController.createReview
);

module.exports = router;
