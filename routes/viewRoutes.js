const express = require('express');
const viewsController = require('../controllers/viewsController');

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

router.get('/', viewsController.getOverview);

router.get('/tour', viewsController.getTour);

module.exports = router;
