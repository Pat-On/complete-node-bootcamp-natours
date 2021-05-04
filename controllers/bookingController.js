const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const Tour = require('../model/tourModel');
// const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
// const factoryFunction = require('./handlerFactory');

exports.getCheckoutSession = catchAsync(async (req, res, next) => {
  // 1) get the currently booked tour

  const tour = await Tour.findById(req.params.tourID);
  // 2) create checkout session
  //this is async because it is going to call many api req to stripe
  const session = await stripe.checkout.sessions.create({
    // only 3 are really required - information about session
    payment_method_types: ['card'],
    success_url: `${req.protocol}://${req.get('host')}/`,
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
