const AppError = require('../utils/appError');

const handleCastErrorDB = (err) => {
  const message = `Invalid ${err.path}: ${err.value}`;
  return new AppError(message, 400);
};

const handleDuplicateFieldsDB = (err) => {
  const values = Object.values(err.keyValue).join(', '); // join if there is more values
  const message = `Duplicate field value: ${values} Please use another value(s)!`;

  return new AppError(message, 400);

  //OLD CODE WHAT WE ARE NOT GETTING ANYMORE OUTDATED
  // const value = err.errmsg.match(/(["'])(\\?.)*?\1/);
  // console.log(value);
  // const message = `Duplicate field value: {} Please use another value!`;
};

const handleValidationErrorDB = (err) => {
  console.log('Did You get here?');
  const errors = Object.values(err.errors).map((item) => item.message);
  const message = `Invalid input data. ${errors.join('. ')}`;
  return new AppError(message, 400);
};

const handleJWTExpiredError = () =>
  new AppError('Your token has expired! Please log in again,', 401);

const sendErrorDev = (err, req, res) => {
  // A) API
  if (req.originalUrl.startsWith('/api')) {
    res.status(err.statusCode).json({
      status: err.status,
      error: err,
      message: err.message,
      stack: err.stack,
    });
  }
  // B)  RENDERED WEBSITE
  res.status(err.statusCode).render('error', {
    title: 'Something went wrong',
    msg: err.message,
  });
};

const handleJWTError = () =>
  new AppError('Invalid token. Please log in again!', 401);

//STANDARD WAY OF DEALING IT
const sendErrorProduction = (err, req, res) => {
  // A) API
  if (req.originalUrl.startsWith('/api')) {
    // A) Operational, trusted error: send message to client
    if (err.isOperational) {
      //Operational, trusted error: send message to client
      res.status(err.statusCode).json({
        status: err.status,
        message: err.message,
      });
      //Programming or other unknown error: don't leak error details
    }
    //1) Log error to console -> backend
    console.error('ERROR 💥', err);
    //2) send generic message
    return res.status(500).json({
      status: 'error',
      message: 'Something went wrong',
    });
  }

  // B) RENDERED WEBSITE
  // A) Operational, trusted error: send message to client
  if (err.isOperational) {
    // RENDERED WEBSITE
    res.status(err.statusCode).render('error', {
      title: 'Something went wrong',
      msg: err.message,
    });
  }
  // B) Programming or other unknown error: don't leak error details
  // 1) Log error
  console.error('ERROR 💥', err);
  // 2) Send generic message
  return res.status(err.statusCode).render('error', {
    title: 'Something went wrong!',
    msg: 'Please try again later.',
  });
};

module.exports = (err, req, res, next) => {
  //printing error stack trace
  //   console.log(err.stack);
  //we are going to give default status code because we may have error
  err.statusCode = err.statusCode || 500;
  //the same like above
  err.status = err.status || 'error';

  //distinguish between development and production
  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(err, req, res);
  } else if (process.env.NODE_ENV === 'production') {
    let error = { ...err };
    error.message = err.message;
    console.log(err.stack);

    //targeting the operational error which are coming from imported modules
    if (error.name === 'CastError') {
      error = handleCastErrorDB(error);
    }
    if (error.code === 11000) error = handleDuplicateFieldsDB(error);
    //another change in the mongo error object - no longer error.name
    if (error._message === 'Tour validation failed')
      error = handleValidationErrorDB(error);
    if (error.name === 'JsonWebTokenError') error = handleJWTError();
    //interesting approach based on error stack
    // if (err.stack.substr(0, 15) === 'ValidationError')
    //   error = handleValidationErrorDB(error);

    if (error.name === 'TokenExpiredError') error = handleJWTExpiredError();
    sendErrorProduction(error, req, res);
  }

  //we are going to read the error from the error object
};
