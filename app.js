const express = require('express');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');

const path = require('path');

const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');

const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');
const reviewRouter = require('./routes/reviewRouter');

const app = express();
app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));

//serving the static files
// app.use(express.static(`${__dirname}/public`));
app.use(express.static(path.join(__dirname, 'public')));

// console.log(process.env.NODE_ENV);
//1) MIDDLEWARE GLOBAL
//SET SECURITY HTTP HEADERS
app.use(helmet());

//DEVELOPMENT LOGGING
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}
// LIMIT REQUESTS FROM SAME API
const limiter = rateLimit({
  max: 100, // it should be set in relation to how API is used.
  windowMs: 60 * 60 * 1000,
  message: 'Too many requests from this IP, please try again in an hour',
});

app.use('/api', limiter);

//BODY PARSER, READING DATA FRO< BODY into req.body
app.use(express.json({ limit: '10kb' })); // <-it really work nice! if we have body larget thant 10 kb It would not be ccepted

// DATA SANITIZATION AGAINST NoSQL query injection
app.use(mongoSanitize());

//DATA SANITIZATION against XSS
app.use(xss());

//prevent parameter pollution - should be use at the end because iti  clearing the query string.
app.use(
  hpp({
    whitelist: [
      //properties what we allow to duplicate
      'duration',
      'ratingsQuantity',
      'ratingsAverage',
      'maxGroupSize',
      'difficulty',
      'price',
    ],
  })
);

// Test middleware
app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  // console.log(req.headers);
  next();
});

//3) Routes

app.get('/', (req, res) => {
  //rendering template
  res.status(200).render('base');
});

//API ROUTER
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/reviews', reviewRouter); // function on the left is middleware function

app.all('*', (req, res, next) => {
  // res.status(404).json({
  //   status: 'fail',
  //   message: `Can't find ${req.originalUrl}`,
  // });

  //defining the error object with statuses
  // const err = new Error(`Can't find ${req.originalUrl}`);
  // err.status = 'fail';
  // err.statusCode = 404;

  next(new AppError(`Can't find ${req.originalUrl}`, 404));
});

app.use(globalErrorHandler);

module.exports = app;
