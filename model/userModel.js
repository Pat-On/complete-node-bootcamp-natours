const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');

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
    validate: {
      //this only works on CREATE and SAVE
      validator: function (el) {
        return el === this.password; //abc == abc
      },
      message: 'Passwords are not the same',
    },
  },
});

//middleware function which is going to encrypted data between getting data and saving it to DB
userSchema.pre('save', async function (next) {
  //only run this function when the password is really modified
  //updating only password when needed
  if (!this.isModified('password')) return next();

  //hash the password with a cost of 12
  this.password = await bcrypt.hash(this.password, 12);

  this.passwordConfirm = undefined; //deleting the password from schema ... model which is going to DB
  next(); // haha I forgot about it
});

// MODEL
const User = mongoose.model('User', userSchema);

module.exports = User;
