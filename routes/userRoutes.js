const express = require('express');
const userController = require('../controllers/userController');
const authController = require('../controllers/authController');

const router = express.Router();
// this is different that others because we are going to handle a lot of things
// like authorization, that is why we are going to have special routes
// signup - is like special case so it is not suitable to other endpoints - divide by philosophy :>
router.post('/signup', authController.signup); // in that case we are going to have route that is only send
router.post('/login', authController.login);
router.get('/logout', authController.logout);

router.post('/forgotPassword', authController.forgotPassword);
router.patch('/resetPassword/:token', authController.resetPassword);

// all below - you need to be authenticated

//at this point we can use the route which is going to protect everything below
// because middleware are called sequentialy
router.use(authController.protect); //<= al routes bellow are protected

router.patch(
  '/updateMyPassword',
  authController.protect,
  authController.updatePassword
);
router.get(
  '/me',
  // authController.protect, //adding user in req.user
  userController.getMe, //adding from user.id id to req.params.id
  userController.getUser // normal
);
router.patch(
  '/updateMe',
  // authController.protect,
  userController.updateMe
);
router.delete(
  '/deleteMe',
  // authController.protect,
  userController.deleteMe
);

router.use(authController.restrictTo('admin')); //<= al routes bellow are protected

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
