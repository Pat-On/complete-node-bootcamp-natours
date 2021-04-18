module.exports = (err, req, res, next) => {
  //printing error stack trace
  //   console.log(err.stack);

  //we are going to give default status code because we may have error
  err.statusCode = err.statusCode || 500;
  //the same like above
  err.status = err.status || 'error';
  //we are going to read the error from the error object
  res.status(err.statusCode).json({
    status: err.status,
    message: err.message,
  });
};
