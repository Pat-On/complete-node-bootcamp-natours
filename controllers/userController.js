const multer = require('multer');
const sharp = require('sharp'); // image processing library

const User = require('../model/userModel');
// const APIFeatures = require('../utils/apiFeatures');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const factoryFunction = require('./handlerFactory');

//MULTER STORAGE
// const multerStorage = multer.diskStorage({
//   // cv is similar to next but it is not part of the express
//   destination: (req, file, cb) => {
//     cb(null, 'public/img/users');
//   },
//   filename: (req, file, cb) => {
//     //user-ID-time-stamp.jpeg
//     const ext = file.mimetype.split('/')[1];
//     cb(null, `user-${req.user.id}-${Date.now()}.${ext}`);
//   },
// });
const multerStorage = multer.memoryStorage(); //img in buffer

// MULTER FILTER
const multerFilter = (req, file, cb) => {
  // we are going to filter only pictures
  if (file.mimetype.startsWith('image')) {
    cb(null, true);
  } else {
    cb(new AppError('Not an Image! Please upload only images.', 400), false);
  }
};

//configuration of the multer uploader - without it the data in that case picture would be stored only in memory
// const upload = multer({ dest: 'public/img/users' });
const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
});

exports.UploadUserPhoto = upload.single('photo');

// PHOTO PROCESSING
exports.resizeUserPhoto = (req, res, next) => {
  //if there is no file return
  if (!req.file) return next();

  req.file.filename = `user-${req.user.id}-${Date.now()}.jpeg`;

  // from buffer because it is more faster
  sharp(req.file.buffer)
    .resize(500, 500)
    .toFormat('jpeg')
    .jpeg({ quality: 90 }) //default it is going work like crop
    .toFile(`public/img/users/${req.file.filename}`);

  next();
};

const filterObj = (obj, ...allowedFields) => {
  const newObj = {};
  Object.keys(obj).forEach((el) => {
    if (allowedFields.includes(el)) newObj[el] = obj[el];
  });
  return newObj;
};

exports.getMe = (req, res, next) => {
  req.params.id = req.user.id;
  next();
};

exports.getAllUsers = factoryFunction.getAll(User);

// exports.getAllUsers = catchAsync(async (req, res, next) => {
//   const users = await User.find();

//   //send response
//   res.status(200).json({
//     status: 'success',
//     results: users.length,
//     data: {
//       users,
//     },
//   });
// });

exports.updateMe = catchAsync(async (req, res, next) => {
  // console.log('did you get hre?');
  // console.log(req.file);
  // console.log(req.body);
  // 1)  create error if user POSTs password data
  if (req.body.password || req.body.passwordConfirm) {
    return next(
      new AppError(
        'This route is not for password updates/ please use /updateMyPassword',
        400
      )
    );
  }

  // 2) filtered out unwanted fields names that are not allowed to be updated

  const filteredBody = filterObj(req.body, 'name', 'email');
  //saving the name of the file to our db

  if (req.file) filteredBody.photo = req.file.filename;
  // 3) update user document
  const updatedUser = await User.findByIdAndUpdate(req.user.id, filteredBody, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    status: 'success',
    data: {
      user: updatedUser,
    },
  });
});

exports.deleteMe = catchAsync(async (req, res, next) => {
  await User.findByIdAndUpdate(req.user.id, { active: false });

  res.status(204).json({
    status: 'success',
    data: null,
  });
});

exports.getUser = factoryFunction.getOne(User);

exports.createUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'This route is not defined! Please use /signup instead',
  });
};

//It is going to be implemented for administrators
exports.updateUser = factoryFunction.updateOne(User); // <-only administrators
//reason when we are using findByIdAndUpdate all save middleware are not running
exports.deleteUser = factoryFunction.deleteOne(User);
