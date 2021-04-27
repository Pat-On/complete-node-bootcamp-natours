const User = require('../model/userModel');
const catchAsync = require('../utils/catchAsync');

exports.signup = catchAsync(async (req, res, next) => {
  const NewUser = await User.create(req.body);

  console.log(NewUser);
  res.status(201).json({
    status: 'success',
    data: {
      //envelope
      user: NewUser,
    },
  });
});
