const express = require('express');
const bookingController = require('../controllers/bookingController');
const authController = require('../controllers/authController');

//by default each router have access only to its specific params.
const router = express.Router();

// this route is not going to follow rest API because
// this API is going to be only to checkout session for user

router.get(
  '/checkout-session/:tourId',
  authController.protect,
  bookingController.getCheckoutSession
);

module.exports = router;
