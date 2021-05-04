const express = require('express');
const bookingController = require('../controllers/bookingController');
const authController = require('../controllers/authController');

//by default each router have access only to its specific params.
const router = express.Router();

// this route is not going to follow rest API because
// this API is going to be only to checkout session for user

router.use(authController.protect);

router.get('/checkout-session/:tourId', bookingController.getCheckoutSession);

router.use(authController.restrictTo('admin', 'lead-guide'));

router
  .route('/')
  .get(bookingController.getAllBookings)
  .post(bookingController.createBooking);

router
  .route('/:id')
  .get(bookingController.getBooking)
  .patch(bookingController.updateBooking)
  .delete(bookingController.deleteBooking);

module.exports = router;
