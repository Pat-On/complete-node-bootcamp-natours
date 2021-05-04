const express = require('express');
const viewsController = require('../controllers/viewsController');
const authController = require('../controllers/authController');
const bookingController = require('../controllers/bookingController');

const router = express.Router();

//PUG road - way of passing data to pug template
// router.get('/', (req, res) => {
//   //rendering template
//   res.status(200).render('base', {
//     //passing data to the PUG file
//     tour: 'The forest Hiker',
//     user: 'Jonas',
//   });
// });

//middleware which is going to be apply to everysingle road
// router.use(authController.isLoggedIn);

router.get(
  '/',
  bookingController.createBookingCheckout, // temporary solution totally not secure
  authController.isLoggedIn,
  viewsController.getOverview
);

router.get('/tour/:slug', authController.isLoggedIn, viewsController.getTour);

router.get('/login', authController.isLoggedIn, viewsController.getLoginForm);

router.get('/me', authController.protect, viewsController.getAccount);

router.get('/my-tours', authController.protect, viewsController.getMyTours);

router.post(
  '/submit-user-data',
  authController.protect,
  viewsController.updateUserData
);

module.exports = router;
