const jwt = require('jsonwebtoken');
const User = require('../model/userModel');
const catchAsync = require('../utils/catchAsync');

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

  const token = jwt.sign(
    {
      //we are going to store data in token
      id: newUser._id, //mongoDB id from0 DB
    },
    process.env.JWT_SECRET, // our secret! salt
    { expiresIn: process.env.JWT_EXPIRES_IN } // expiration time
  );

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
