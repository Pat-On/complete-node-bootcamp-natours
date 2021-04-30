// const fs = require('fs');
const Tour = require('../model/tourModel');
// const APIFeatures = require('../utils/apiFeatures');
// const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const factoryFunction = require('./handlerFactory');

//our middleware modifying the req.query
exports.aliasTopTours = (req, res, next) => {
  req.query.limit = '5';
  req.query.sort = '-ratingsAverage,price';
  req.query.fields = 'name,price,ratingsAverage,summary,difficulty';
  next();
};
exports.getAllTours = factoryFunction.getAll(Tour);

// exports.getAllTours = catchAsync(async (req, res, next) => {
//   // try {
//   // !IMPORTANT in that case we would have to do documentation, to teach user how to use it

//   // EXECUTE QUERY
//   const features = new APIFeatures(Tour.find(), req.query)
//     .filter()
//     .sort()
//     .limitFields()
//     .paginate();
//   const tours = await features.query;
//   //basically it is just chaining the methods
//   //query.sort().select().skip().limit() <- chained method of query object -> mongoose

//   //SEND RESPONSE
//   res.status(200).json({
//     status: 'success',

//     results: tours.length, // it is not exactly from specification but it is useful for front app to do it
//     data: {
//       tours: tours, //ES6 just tours - k and v the same
//     },
//   });
//   // } catch (err) {
//   //   res.status(404).json({
//   //     status: 'fail',
//   //     message: err,
//   //   });
//   // }
// });

exports.getTour = factoryFunction.getOne(Tour, { path: 'reviews' });

// exports.getTour = catchAsync(async (req, res, next) => {
//   // try {
//   // const tour = await Tour.findById(req.params.id).populate({
//   //   path: 'guides',
//   //   select: '-__v -passwordChangedAt',
//   // });
//   const tour = await Tour.findById(req.params.id)
//     // .populate({
//     //   path: 'guides',
//     //   select: '-__v -passwordChangedAt',
//     // })
//     .populate('reviews');
//   //Tour.findOne({_id: req.params.id})- normal solution

//   if (!tour) {
//     return next(new AppError('no Tour found with that ID', 404));
//   }

//   res.status(201).json({
//     status: 'success',
//     data: {
//       tour,
//     },
//   });
//   // } catch (err) {
//   //   res.status(400).json({
//   //     status: 'fail',
//   //     message: 'Invalid data sent!',
//   //   });
//   // }
// });

// Factory function
exports.createTour = factoryFunction.createOne(Tour);

// exports.createTour = catchAsync(async (req, res, next) => {
//   const newTour = await Tour.create(req.body);

//   res.status(201).json({
//     status: 'success',
//     data: {
//       tour: newTour,
//     },
//   });

//   // try {
//   //   // const newTours = new Tour({})
//   //   // newTours.save

//   //   //we call create function on the model itself - create return promise
//   //   const newTour = await Tour.create(req.body);

//   //   res.status(201).json({
//   //     status: 'success',
//   //     data: {
//   //       tour: newTour,
//   //     },
//   //   });
//   // } catch (err) {
//   //   res.status(400).json({
//   //     status: 'fail',
//   //     message: err,
//   //   });
//   // }
// });

// Factory function
exports.updateTour = factoryFunction.updateOne(Tour);

// exports.updateTour = catchAsync(async (req, res, next) => {
//   // try {
//   // we are going to update the item by id - logical
//   const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
//     // options
//     new: true, // new updated document would be returned to client
//     runValidators: true, // we are going to trigger check again - validator base on the model's schema nice!
//   });

//   if (!tour) {
//     return next(new AppError('no Tour found with that ID', 404));
//   }

//   res.status(200).json({
//     status: 'success',
//     data: {
//       tour,
//     },
//   });
//   // } catch (err) {
//   //   res.status(400).json({
//   //     status: 'fail',
//   //     message: err,
//   //   });
//   // }
// });
// FACTORY FUNCTION SOLUTION
exports.deleteTour = factoryFunction.deleteOne(Tour);

//old solution// exports.deleteTour = catchAsync(async (req, res, next) => {
//   // try {
//   const tour = await Tour.findByIdAndDelete(req.params.id);

//   if (!tour) {
//     return next(new AppError('no Tour found with that ID', 404));
//   }

//   res.status(204).json({
//     status: 'success',
//     data: null, //null mean that the data is no longer existing
//   });
//   // } catch (err) {
//   //   res.status(400).json({
//   //     status: 'fail',
//   //     message: err,
//   //   });
//   // }
// });

//aggregation-pipeline
exports.getTourStats = catchAsync(async (req, res, next) => {
  // try {
  // it is like normal query but we can do manipulate data in  couple of steps

  const stats = await Tour.aggregate([
    //each of the stages is the object
    {
      //it is like query
      $match: { ratingsAverage: { $gte: 4.5 } },
    },
    {
      $group: {
        //here real magic is happen -> we are going to use accumulator
        //we can calculate here for example rating
        // _id: null,
        // _id: '$difficulty',
        _id: { $toUpper: '$difficulty' },
        numTours: { $sum: 1 },
        numRatings: { $sum: '$ratingsQuantity' },
        avgRating: { $avg: '$ratingsAverage' },
        avgPrice: { $avg: '$price' },
        minPrice: { $min: '$price' },
        maxPrice: { $max: '$price' },
      },
    },
    {
      $sort: { avgPrice: -1 },
    },
    // {
    //   $match: { _id: { $ne: 'EASY' } },
    // },
  ]);

  res.status(200).json({
    status: 'success',
    data: stats, //null mean that the data is no longer existing
  });
  // } catch (err) {
  //   res.status(404).json({
  //     status: 'fail',
  //     message: err,
  //   });
  // }
});

exports.getMonthlyPlan = catchAsync(async (req, res, next) => {
  // try {
  const year = req.params.year * 1;

  const plan = await Tour.aggregate([
    {
      //deconstruct array filter and output one document for each element of the array
      $unwind: '$startDates',
    },
    {
      $match: {
        startDates: {
          //mongo is great for data comparision
          $gte: new Date(`${year}-01-01`),
          $lte: new Date(`${year}-12-31`),
        },
      },
    },
    {
      $group: {
        //the way how we want to group our results
        _id: { $month: '$startDates' },
        numTourStarts: { $sum: 1 },
        tours: { $push: '$name' },
      },
    },
    {
      $addFields: { month: '$_id' },
    },
    {
      $project: {
        //1 is showing 0 is hidding the key value
        _id: 0,
      },
    },
    {
      // $sort: { numTourStarts: -1 },
      $sort: { month: 1 },
    },
    // {
    //it will limit the output
    //   $limit: 6
    // }
  ]);

  res.status(200).json({
    status: 'success',
    data: plan, //null mean that the data is no longer existing
  });
  // } catch (err) {
  //   res.status(404).json({
  //     status: 'fail',
  //     message: err,
  //   });
  // }
});
