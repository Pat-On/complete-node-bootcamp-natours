const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema(
  {
    review: {
      type: String,
      required: [true, 'Review can not be empty!'],
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    tour: {
      type: mongoose.Schema.ObjectId,
      ref: 'Tour',
      required: [true, 'Review must belong to a tour'],
    },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: [true, 'Review must belong to a user!'],
    },
  },
  {
    //option object we setting that virtual are going to be part of output
    // option to show data calculated in app not coming from DB
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

//middleware
reviewSchema.pre(/^find/, function (next) {
  //   this.populate({
  //     path: 'tour', //so mongoose is going to try find id in this collection
  //     select: 'name',
  //   }).populate({
  //     path: 'user',
  //     select: 'name photo', //we are specifying what we want to display
  //   });

  this.populate({
    path: 'user',
    select: 'name photo', //we are specifying what we want to display
  });

  next();
});

const Review = mongoose.model('Review', reviewSchema);

module.exports = Review;
