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

const sendErrorDev = (err, res) => {
  res.status(err.statusCode).json({
    status: err.status,
    error: err,
    message: err.message,
    stack: err.stack,
  });
};

//STANDARD WAY OF DEALING IT
const sendErrorProduction = (err, res) => {
  //Operational, trusted error: send message to client
  if (err.isOperational) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });
    //Programming or other unknown error: don't leak error details
  } else {
    //1) Log error to console -> backend
    // console.error(err);

    //2) send generic message
    res.status(500).json({
      status: 'error',
      message: 'Something went wrong',
    });
  }
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
    sendErrorDev(err, res);
  } else if (process.env.NODE_ENV === 'production') {
    let error = { ...err };
    console.log(error.code);
    if (err.name === 'CastError') {
      error = handleCastErrorDB(error);
    }
    // IMPORTANT
    if (error.code === 11000) error = handleDuplicateFieldsDB(error);

    sendErrorProduction(error, res);
  }

  //we are going to read the error from the error object
};
