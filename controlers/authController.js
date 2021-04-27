const jwt = require('jsonwebtoken');
const User = require('../model/userModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });

exports.signup = catchAsync(async (req, res, next) => {
  //!IMPORTANT
  //in this way how it is done above you can register your user as a admin what is wrong!
  // You can add additional code!

  //   const NewUser = await User.create(req.body);

  //better solution: with this we are going only allow to get through data what we need to create the user
  // so anything manually addded by user is not going to go thorough

  //we can not add administrator from this sight
  const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
  });

  const token = signToken(newUser._id);

  // const token = jwt.sign(
  //   {
  //     //we are going to store data in token
  //     id: newUser._id, //mongoDB id from0 DB
  //   },
  //   process.env.JWT_SECRET, // our secret! salt
  //   { expiresIn: process.env.JWT_EXPIRES_IN } // expiration time
  // );

  console.log(newUser);
  // here we are not going to check anything because the user is created and we are going to send the token
  res.status(201).json({
    status: 'success',
    token,
    data: {
      //envelope
      user: newUser,
    },
  });
});

exports.login = catchAsync(async (req, res, next) => {
  //   const email = req.body.email;  // better is go for the object destructuring
  const { email, password } = req.body;

  //1) Check if email and password exist
  if (!email || !password) {
    //we are going to send error by global error handler middleware
    return next(new AppError('Please provide email and password!', 400));
  }
  //2) check if user exists && password is correct
  const user = await User.findOne({ email: email }).select('+password'); // adding password field to return
  console.log(user);
  // const correct = await user.correctPassword(password, user.password);

  // or statement if user does not exist it will not even run right side
  //!IMPORTANT in this way w are protecting data what is incorrect login or password
  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(new AppError('Incorrect email or password', 401)); //401 unauthorized
  }

  //3) If everything ok, send token to client
  const token = signToken(user._id);
  res.status(200).json({
    status: 'success',
    token,
  });
});

exports.protect = catchAsync(async (req, res, next) => {
  // 1) getting token and check of it's there
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return next(
      new AppError('You are not logged in! Please log in to get access.', 401)
    );
  }
  console.log(token);
  //2) Verification token -jwt is checking if token in proper

  //3)  check if user still exists

  //4) check if user changes password (token) after the JWT was issued

  // only if all test are going to be passed the next(); is going to be called
  // and middleware is going to bring us to the "route"
  next();
});
