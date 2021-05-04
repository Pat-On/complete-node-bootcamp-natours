// const util = require('util');
const { promisify } = require('util');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const User = require('../model/userModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const Email = require('../utils/email');

// console.log(process.env.JWT_EXPIRES_IN);
const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });

const createSendToken = (user, statusCode, res) => {
  const token = signToken(user.id);

  const cookieOptions = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
    ), //expiration

    httpOnly: true, //not allowed modification on browser
  };
  if (process.env.NODE_ENV === 'production') cookieOptions.secure = true; //send only on https ss

  res.cookie('jwt', token, cookieOptions);

  //remove password from the output
  user.password = undefined;

  res.status(statusCode).json({
    status: 'success',
    token,
    data: {
      //envelope
      user: user,
    },
  });
};

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
    // passwordChangedAt: req.body.passwordConfirm, BUG WRRR! silly mistake quickly found!
    role: req.body.role,
  });
  const url = `${req.protocol}://${req.get('host')}/me`;
  console.log(url);
  await new Email(newUser, url).sendWelcome();
  // const token = signToken(newUser._id);

  // const token = jwt.sign(
  //   {
  //     //we are going to store data in token
  //     id: newUser._id, //mongoDB id from0 DB
  //   },
  //   process.env.JWT_SECRET, // our secret! salt
  //   { expiresIn: process.env.JWT_EXPIRES_IN } // expiration time
  // );

  createSendToken(newUser, 201, res);

  // console.log(newUser);
  // // here we are not going to check anything because the user is created and we are going to send the token
  // res.status(201).json({
  //   status: 'success',
  //   token,
  //   data: {
  //     //envelope
  //     user: newUser,
  //   },
  // });
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

  createSendToken(user, 200, res);

  // const token = signToken(user._id);
  // res.status(200).json({
  //   status: 'success',
  //   token,
  // });
});

exports.logout = (req, res) => {
  res.cookie('jwt', 'loggedout', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
  });
  res.status(200).json({
    status: 'success',
  });
};

exports.protect = catchAsync(async (req, res, next) => {
  // 1) getting token and check of it's there
  let token;
  if (
    // html header in req
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies.jwt) {
    //authentication users via the cookies received
    token = req.cookies.jwt;
  }

  if (!token) {
    // console.log(token);
    // console.log('Did you get here???????????');
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
  res.locals.user = currentUser;
  next(); //grant access to protected route
});

// this is only for rendering the pages so he mentioned that there is no error
exports.isLoggedIn = async (req, res, next) => {
  // we are going to catch errors locally

  // if there is cookie we have to go through entire auth tests
  if (req.cookies.jwt) {
    try {
      // 1) via token
      // authorization is going to happen via cookies always on out side/page
      const decoded = await promisify(jwt.verify)(
        req.cookies.jwt,
        process.env.JWT_SECRET
      );

      // 2) check if user still exists
      const currentUser = await User.findById(decoded.id);
      if (!currentUser) {
        return next();
      }

      // 3) check if user changed password after the token was issued
      if (currentUser.changedPasswordAfter(decoded.iat)) {
        return next();
      }

      // there is a logged in user
      //pug template will have access to it. - we passed the variable by this
      res.locals.user = currentUser;
      return next();
    } catch (error) {
      // error is going to appear because the tokken what we are sending here is not going to be correct token
      // there is another solution: you can just delete the cookie immediately by setting time to the past I hope someone sees this and uses this solution instead of the try catch block in the code

      res.cookie('jwt', 'null', {
        expires: new Date(Date.now() - 10 * 1000),
        httpOnly: true,
      });
      // console.log(error);
      return next();
    }
  }
  next();
};

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
  // 2) Generate the random reset toke - once more user method!  instance!
  const resetToken = user.createPasswordResetToken();
  // await user.save(); // in this way it would give to use error because not all fields are provided
  await user.save({ validateBeforeSave: false });

  // const message = `Forgot your password? Submit a PATCH request with your new password and passwordConfirm to: ${resetURL}. \n If you didn't forget your password, please ignore this email!`;

  //he decided to use it because we need to do more than just catch the error
  //like extension to the global middleware error handler!
  // 3 send it to user's email
  try {
    const resetURL = `${req.protocol}://${req.get(
      'host'
    )}/api/v1/users/resetPassword/${resetToken}`;
    //sending email
    // await sendEmail({
    //   email: user.email,
    //   subject: 'Your password reset token (valid for 10min)',
    //   message: message,
    // });
    await new Email(user, resetURL).sendPasswordReset();

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

exports.resetPassword = catchAsync(async (req, res, next) => {
  //1 ) get user based on the token

  const hashedToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  });
  // 2) if token has not expired, and there is user, set the new password
  // we are doing two things at the same time if token exist and if token expired
  if (!user) {
    return next(new AppError('Token is invalid or has expired', 400));
  }

  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  //cleaning the not needed fields
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;

  await user.save(); // we are not switching of the validation because we want to confirm that the password are the same
  //3;  update changedPasswordAt property for the user

  //4 log the user in, send JWT

  createSendToken(user, 200, res);

  // const token = signToken(user._id);

  // res.status(200).json({
  //   status: 'success',
  //   token,
  // });
});

exports.updatePassword = catchAsync(async (req, res, next) => {
  //this functionality we are going to only allow for authorized us4ers but as well we are going to
  //force user to put password again - security measures
  // 1) Get user from collection
  const user = await User.findById(req.user.id).select('+password');
  // 2) check if POSTed current password is correct
  if (!(await user.correctPassword(req.body.passwordCurrent, user.password))) {
    return next(new AppError('Your current password is wrong.', 401));
  }
  // 3) if so, update password
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  await user.save(); // we want validation to happen
  // 4) log user in, send JWT

  createSendToken(user, 200, res);

  //User.findByIDAndUpdate -> we can not use it because: validation is not going to work!  because mongo is not keeping curren object in memory so this.something would not work
  // and pre('save') middlewares are not going to work and the password is not going to be encrypted
});
