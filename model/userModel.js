const crypto = require('crypto');
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
  role: {
    type: String,
    enum: ['user', 'guide', 'lead-guide', 'admin'],
    default: 'user',
  },
  password: {
    type: String,
    required: [true, 'Please provide a password'],
    minlength: 8, // this is minimum length of password
    // it will never show up in any output !IMPORTANT
    select: false,
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
  passwordChangedAt: Date,
  passwordResetToken: String,
  passwordResetExpires: Date, //security measure like 10 minutes to do it
  active: {
    type: Boolean,
    default: true,
    select: false,
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

userSchema.pre('save', function (next) {
  //before new document is going to be saved
  if (!this.isModified('password') || this.isNew) return next(); //mongoose -> read documentation! It is crucial

  this.passwordChangedAt = Date.now() - 1000; // subtraction, because of the difference when is created the token and when was saved in DB
  // by this we are not going to have "error?" where time stamp is different on token and different in DB
  //always created after password was changed
  next();
});
// middleware
userSchema.pre(/^find/, function (next) {
  // this points to the current query -> so it is going to edit the query object
  this.find({ active: { $ne: false } });
  next();
});

// INSTANCE METHOD it is going to available on all models of certain collections
userSchema.methods.correctPassword = async function (
  candidatePassword, //not hashed
  userPassword //hashed
) {
  //this key word is not working because in output password is not available
  return await bcrypt.compare(candidatePassword, userPassword); //true if the same, false if not
};
//another instance method
userSchema.methods.changedPasswordAfter = function (JWTTimestamp) {
  // instances method this always point to current document
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10
    );

    console.log(changedTimestamp, JWTTimestamp);
    console.log(changedTimestamp < JWTTimestamp);
    return JWTTimestamp < changedTimestamp;
  }

  //False mean not changed

  return false;
};

userSchema.methods.createPasswordResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString('hex'); // it is like reset password!

  // we need to encrypt it like password because may be stolen and used by hacker
  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');
  console.log({ resetToken }, this.passwordResetToken);
  this.passwordResetExpires = Date.now() + 10 * 60 * 1000;

  return resetToken; //via email we are sending not encrypted version but in DB we store encrypted one!
};

// MODEL
const User = mongoose.model('User', userSchema);

module.exports = User;
