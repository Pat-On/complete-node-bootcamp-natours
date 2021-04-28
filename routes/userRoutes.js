const express = require('express');
const userController = require('../controlers/userController');
const authController = require('../controlers/authController');

const router = express.Router();
// this is different that others because we are going to handle a lot of things
// like authorization, that is why we are going to have special routes
// signup - is like special case so it is not suitable to other endpoints - divide by philosophy :>
router.post('/signup', authController.signup); // in that case we are going to have route that is only send
router.post('/login', authController.login);

router.post('/forgotPassword', authController.forgotPassword);
router.patch('/resetPassword/:token', authController.resetPassword);

router.patch(
  '/updateMyPassword',
  authController.protect,
  authController.updatePassword
);

router.patch('/updateMe', authController.protect, userController.updateMe);

router
  .route('')
  .get(userController.getAllUsers)
  .post(userController.createUser);
router
  .route('/:id')
  .get(userController.getUser)
  .patch(userController.updateUser)
  .delete(userController.deleteUser);

module.exports = router;
