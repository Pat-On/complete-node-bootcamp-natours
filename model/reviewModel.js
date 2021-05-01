const mongoose = require('mongoose');
const Tour = require('./tourModel');

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

//static method NICE SOLUTION - static method is accessible on the model
reviewSchema.statics.calcAverageRatings = async function (tourId) {
  // console.log(tourId);
  const stats = await this.aggregate([
    { $match: { tour: tourId } },
    {
      $group: {
        _id: '$tour',
        nRating: { $sum: 1 },
        avgRating: { $avg: '$rating' },
      },
    },
  ]);
  console.log(stats);
  // updating the tour results - savings statistic to the current tour
  await Tour.findByIdAndUpdate(tourId, {
    ratingsQuantity: stats[0].nRating,
    ratingsAverage: stats[0].avgRating,
  });
};

reviewSchema.post('save', function () {
  //this points to current review
  // this.constructor; //it is model which is created the model - review

  this.constructor.calcAverageRatings(this.tour);
  // next();
});

const Review = mongoose.model('Review', reviewSchema);

module.exports = Review;
