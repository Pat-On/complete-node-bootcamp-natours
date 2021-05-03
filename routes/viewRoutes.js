const express = require('express');
const viewsController = require('../controllers/viewsController');
const authController = require('../controllers/authController');

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
router.use(authController.isLoggedIn);

router.get('/', viewsController.getOverview);

router.get('/tour/:slug', viewsController.getTour);

router.get('/login', viewsController.getLoginForm);

module.exports = router;
