const Review = require('../model/reviewModel');
const catchAsync = require('../utils/catchAsync');
const factoryFunction = require('./handlerFactory');

exports.getAllReview = catchAsync(async (req, res, next) => {
  //if the req is coming from nested rout it is going to filter only requested review
  let filter;
  if (req.params.tourId) filter = { tour: req.params.tourId };

  const reviews = await Review.find(filter);

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
  // console.log(req.params.tourId);
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

exports.deleteReview = factoryFunction.deleteOne(Review);
