const express = require('express');
const morgan = require('morgan');

const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');

const app = express();

//1) MIDDLEWARES
app.use(morgan('dev'));
app.use(express.json()); // <-it really work nice!

//our own middleware
app.use((req, res, next) => {
  //by adding next express know that we are creating here the middleware
  //next is the function - name is convention
  console.log('Hello from the middleware');
  next(); // if we are not going to add it the req would stuck here
});

app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();

  next();
});

//3) Routes

app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);

module.exports = app;
