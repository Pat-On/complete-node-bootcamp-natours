const mongoose = require('mongoose');
const validator = require('validator');

//name, email, photo, password, passwordConfirm

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'A user must have a name'],
  },
  email: {
    //we are going to use this as a id for user to log in
    type: String,
    requited: [true, 'A user must have a email'],
    unique: true,
    lowercase: true, //it is not validator, it is just going to convert the email to it
    validate: [validator.isEmail, 'Please provide a valid email'], // <-documentation
  },
  photo: String, // photo in most web app is optional
  password: {
    type: String,
    required: [true, 'Please provide a password'],
    minlength: 8, // this is minimum length of password
  },
  passwordConfirm: {
    type: String,
    required: [true, 'Please confirm your password'],
  },
});

// MODEL
const User = mongoose.model('User', userSchema);

module.exports = User;
