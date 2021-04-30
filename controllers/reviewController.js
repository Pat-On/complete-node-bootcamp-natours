const Review = require('../model/reviewModel');
const catchAsync = require('../utils/catchAsync');

exports.getAllReview = catchAsync(async (req, res, next) => {
  const reviews = await Review.find();

  res.status(200).json({
    status: 'success',
    results: reviews.length,
    data: {
      reviews,
    },
  });
});

exports.createReview = catchAsync(async (req, res, next) => {
  //allow nested routes
  console.log(req.params.tourId);
  if (!req.body.tour) req.body.tour = req.params.tourId;
  if (!req.body.user) req.body.user = req.user.id; // we are getting user from protected middleware

  const newReview = await Review.create(req.body); //if something is not existing in schema it would be lost

  res.status(201).json({
    status: 'success',
    data: {
      review: newReview,
    },
  });
});
