// const util = require('util');
const { promisify } = require('util');
const jwt = require('jsonwebtoken');
const User = require('../model/userModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const sendEmail = require('../utils/email');

console.log(process.env.JWT_EXPIRES_IN);
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
    passwordChangedAt: req.body.passwordConfirm,
    role: req.body.role,
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
  // console.log(token);
  // console.log('Did you get here???????????');
  if (!token) {
    console.log('Did you get here????');
    return next(
      new AppError('You are not logged in! Please log in to get access.', 401)
    );
  }

  //2) Verification token -jwt is checking if token in proper
  // verification process if nt successful will throw error :> altering etc
  // MOST important PART
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
  // console.log(decoded);
  // console.log('Did you get here?');

  //3)  check if user still exists
  const currentUser = await User.findById(decoded.id);
  if (!currentUser) {
    return next(
      new AppError(
        'The user belonging to this token does no longer exist.',
        401
      )
    );
  }
  //4) check if user changes password (token) after the JWT was issued
  //documents are instances of the model
  console.log(decoded);
  if (currentUser.changedPasswordAfter(decoded.iat)) {
    return next(
      new AppError('User recently changed password! Please log in again!', 401)
    );
  }

  // only if all test are going to be passed the next(); is going to be called
  // and middleware is going to bring us to the "route"
  req.user = currentUser;
  next(); //grant access to protected route
});

// how to pass the arguments to middleware! by wrapper function which is going to return the middleware
exports.restrictTo = (...roles) => (req, _res, next) => {
  // roles is array - es6 syntax

  // req.user.role -> coming from middleware before one
  if (!roles.includes(req.user.role)) {
    return next(
      new AppError('You do not have permission to perform this action', 403) //403 - forbidden
    );
  }
  next();
};

exports.forgotPassword = catchAsync(async (req, res, next) => {
  // 1) Get user based on POSTed email
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return next(new AppError('there is no user with that email address', 404));
  }
  // 2) Generate the random reset toke - once more user data instance!
  const resetToken = user.createPasswordResetToken();
  // await user.save(); // in this way it would give to use error because not all fields are provided
  await user.save({ validateBeforeSave: false });
  // 3 send it to user's email

  //reset url
  // const resetURL = `${req.protocol}://${req.get(
  //   'host'
  // )}/api/v1/users/resetPassword/${resetToken}`;

  const resetURL = `${req.protocol}://${req.get(
    'host'
  )}/api/v1/users/resetPassword/${resetToken}`;

  const message = `Forgot your password? Submit a PATCH request with your new password and passwordConfirm to: ${resetURL}. \n If you didn't forget your password, please ignore this email!`;

  //he decided to use it because we need to do more than just catch the error
  //like extension to the global middleware error handler!
  try {
    //sending email
    await sendEmail({
      email: user.email,
      subject: 'Your password reset token (valid for 10min)',
      message: message,
    });

    res.status(200).json({
      status: 'success',
      message: 'Token sent to email!',
      // never put here reset token because everybody can take it. So we use email to make it more secure!
    });
  } catch (err) {
    //we want here reset the token and expired
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;

    await user.save({ validateBeforeSave: false });

    return next(
      new AppError(
        'There was an error sending the email. Try again later!',
        500
      )
    ); // error what happen on server
  }
});

exports.resetPassword = (req, res, next) => {};
