const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const Tour = require('../model/tourModel');
const Booking = require('../model/bookingModel');
// const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
// const factoryFunction = require('./handlerFactory');

exports.getCheckoutSession = catchAsync(async (req, res, next) => {
  // 1) get the currently booked tour
  console.log('<getcheckoutsession>' + req.params.tourId);
  const tour = await Tour.findById(req.params.tourId);
  // 2) create checkout session
  //this is async because it is going to call many api req to stripe
  const session = await stripe.checkout.sessions.create({
    // only 3 are really required - information about session
    payment_method_types: ['card'],
    // IMPORTANT
    // not secure temporary solution for development - possibility to create tour without payment
    success_url: `${req.protocol}://${req.get('host')}/?tour=${
      req.params.tourId
    }&user=${req.user.id}&price=${tour.price}`,
    cancel_url: `${req.protocol}://${req.get('host')}/tour/${tour.slug}`,
    customer_email: req.user.email,
    client_reference_id: req.params.tourID,
    //information about product
    line_items: [
      {
        // all coming from stripe
        name: `${tour.name} Tour`,
        description: tour.summary,
        images: [`https://www.natours.dev/img/tours/${tour.imageCover}`], // TODO change in production
        amount: tour.price * 100, //because price is going to be provide in cents
        currency: 'usd',
        quantity: 1,
      },
    ],
  });

  // 3) create session as response
  res.status(200).json({
    status: 'success',
    session,
  });
});

exports.createBookingCheckout = catchAsync(async (req, res, next) => {
  // temporary because it is unsecured: everyone can make bookings without paying
  const { tour, user, price } = req.query;

  // what is next middleware? -> check the / route

  if (!tour && !user && !price) return next();

  await Booking.create({ tour, user, price });

  // it is creating another request to route and we will re-hit that middleware but without query strings
  res.redirect(req.originalUrl.split('?')[0]);
});
