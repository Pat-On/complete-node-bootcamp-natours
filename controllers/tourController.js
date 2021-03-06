const multer = require('multer');
const sharp = require('sharp'); // image processing library

// const fs = require('fs');
const Tour = require('../model/tourModel');
// const APIFeatures = require('../utils/apiFeatures');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const factoryFunction = require('./handlerFactory');

const multerStorage = multer.memoryStorage(); //img in buffer - faster photo processing

// MULTER FILTER
const multerFilter = (req, file, cb) => {
  // we are going to filter only pictures
  if (file.mimetype.startsWith('image')) {
    cb(null, true);
  } else {
    cb(new AppError('Not an Image! Please upload only images.', 400), false);
  }
};

//configuration of the multer uploader - without it the data in that case picture would be stored only in memory
// const upload = multer({ dest: 'public/img/users' });
const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
});

// from different fields
exports.uploadTourImages = upload.fields([
  { name: 'imageCover', maxCount: 1 },
  { name: 'images', maxCount: 3 },
]);

// when there is one field with many pictures and the same name ----- req.files
// upload.array("images", 5)
// when there is single image ------- req.file
// upload.single('image');

exports.resizeTourImages = catchAsync(async (req, res, next) => {
  if (!req.files.imageCover || !req.files.images) return next();
  // 1) Cover images
  // we are updating tur via entire body object on req and schema definition
  req.body.imageCover = `tour=${req.params.id}-${Date.now()}-cover.jpeg`;
  await sharp(req.files.imageCover[0].buffer)
    .resize(2000, 1333)
    .toFormat('jpeg')
    .jpeg({ quality: 90 }) //default it is going work like crop
    .toFile(`public/img/tours/${req.body.imageCover}`);

  // 2 ) cover images array
  req.body.images = [];

  //IMPORTANT
  //wrong async solution, because inner function is async but forEach() is not, so code is not going
  // to await forEach() it just going to jump to next leaving the req.body.images() as a empty array
  // req.files.images.forEach(async (file, i) => {
  //   const filename = `tour=${req.params.id}-${Date.now()}-${i + 1}.jpeg`;

  //   await sharp(req.files.imageCover[0].buffer)
  //     .resize(2000, 1333)
  //     .toFormat('jpeg')
  //     .jpeg({ quality: 90 }) //default it is going work like crop
  //     .toFile(`public/img/tours/${filename}`);

  //   req.body.images.push(filename);
  // });
  // !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
  // We are using map() to return the array of promisees and then we are going to await it by await Promise.all()
  await Promise.all(
    req.files.images.map(async (file, i) => {
      const filename = `tour-${req.params.id}-${Date.now()}-${i + 1}.jpeg`;

      await sharp(file.buffer)
        .resize(2000, 1333)
        .toFormat('jpeg')
        .jpeg({ quality: 90 }) //default it is going work like crop
        .toFile(`public/img/tours/${filename}`);

      req.body.images.push(filename);
    })
  );

  next();
});

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

// '/tours-within/:distance/center/:latlng/unit/:unit',
// /tours-within/233/center/-40,45/unit/mi    <-he said that looks cleaner
exports.getToursWithin = catchAsync(async (req, res, next) => {
  const { distance, latlng, unit } = req.params;

  const [lat, lng] = latlng.split(',');

  const radius = unit === 'mi' ? distance / 3964.2 : distance / 6378.1;

  if (!lat || !lng) {
    next(
      new AppError(
        'Please provide latitude and longitude in the format lat,lng',
        400
      )
    );
  }

  const tours = await Tour.find({
    startLocation: { $geoWithin: { $centerSphere: [[lng, lat], radius] } },
  });

  res.status(200).json({
    results: tours.length,
    data: { data: tours },
  });
});

exports.getDistances = catchAsync(async (req, res, next) => {
  const { latlng, unit } = req.params;

  const [lat, lng] = latlng.split(',');

  const multiplier = unit === 'mi' ? 0.000621371 : 0.001;

  if (!lat || !lng) {
    next(
      new AppError(
        'Please provide latitude and longitude in the format lat,lng',
        400
      )
    );
  }

  const distances = await Tour.aggregate([
    {
      //the only geo=Agregation special
      $geoNear: {
        //require one field with geospatial index
        near: {
          //geoJSON
          type: 'Point',
          coordinates: [lng * 1, lat * 1],
        },
        distanceField: 'distance',
        distanceMultiplier: multiplier, // field where are going to be stored calculated distances
      },
    },
    {
      $project: {
        distance: 1,
        name: 1,
      },
    },
  ]);

  res.status(200).json({
    data: { data: distances },
  });
});
