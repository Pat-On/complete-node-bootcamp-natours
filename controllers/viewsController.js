const Tour = require('../model/tourModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const User = require('../model/userModel');
const Booking = require('../model/bookingModel');

exports.getOverview = catchAsync(async (req, res, next) => {
  // 1) Get tour data from collection
  const tours = await Tour.find();
  // 2) build template

  // 3) Render that template using tour data from 1)

  res.status(200).render('overview', {
    title: 'All Tours',
    tours,
  });
});

exports.getTour = catchAsync(async (req, res, next) => {
  // 1) Get the data, for the requested tour (including reviews and guides)
  const tour = await Tour.findOne({ slug: req.params.slug }).populate({
    path: 'reviews',
    fields: 'review rating user',
  });

  if (!tour) {
    return next(new AppError('There is no tour with that name', 404));
  }

  // 2) Build template

  // 3) Render that template using tour data from 1)

  res
    .status(200)
    // .set(
    //   'Content-Security-Policy',
    //   'connect-src https://*.tiles.mapbox.com https://api.mapbox.com https://events.mapbox.com'
    // )
    .render('tour', {
      title: `${tour.name} Tour`,
      tour,
    });
});

exports.getLoginForm = (req, res) => {
  res
    .status(200)
    // .set(
    //   'Content-Security-Policy',
    //   "connect-src 'self' https://cdnjs.cloudflare.com"
    // )
    .render('login', {
      title: 'Log into your account',
    });
};

exports.getAccount = (req, res) => {
  //user is already passed via the authorization middleware
  res.status(200).render('account', {
    title: 'Your account',
    // user: req.user,
  });
};

exports.getMyTours = catchAsync(async (req, res, next) => {
  // find all tours what are booked by user
  // 1) find all bookings
  const bookings = await Booking.find({ user: req.user.id });
  // 2) find tours with the returned IDs

  const tourIds = bookings.map((el) => el.tour);
  // IMPORTANT
  // very handy operator $in
  const tours = await Tour.find({ _id: { $in: tourIds } });

  res.status(200).render('overview', {
    title: 'my Tours',
    tours,
  });
});

exports.updateUserData = catchAsync(async (req, res, next) => {
  const updatedUser = await User.findByIdAndUpdate(
    req.user.id,
    {
      // by this straight ahead assignment we are strip away not wanted data - for example from hack etc
      name: req.body.name,
      email: req.body.email,
    },
    {
      new: true,
      runValidators: true,
    }
  );
  res.status(200).render('account', {
    title: 'Your account',
    user: updatedUser, //passing updated user
  });
});
