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
// limiting review - it may not work straight ahead
// reviewSchema.index({ tour: 1, user: 1 }, { unique: true });

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
  const stats = await this.aggregate([
    { $match: { tour: tourId } },
    // if there is no match we are going to have error in Tour.findByIdAndUpdate
    {
      $group: {
        _id: '$tour',
        nRating: { $sum: 1 },
        avgRating: { $avg: '$rating' },
      },
    },
  ]);

  // updating the tour results - savings statistic to the current tour

  if (stats.length > 0) {
    // against error
    await Tour.findByIdAndUpdate(tourId, {
      ratingsQuantity: stats[0].nRating,
      ratingsAverage: stats[0].avgRating,
    });
  } else {
    await Tour.findByIdAndUpdate(tourId, {
      ratingsQuantity: 0,
      ratingsAverage: 4.5,
    });
  }
};

reviewSchema.post('save', function () {
  //this points to current review
  // this.constructor; //it is model which is created the model - review

  //so basically here we are attaching it to constructor -> accessible on model!
  this.constructor.calcAverageRatings(this.tour);
  // next();
});

// we can not change here for post because query is already executed
reviewSchema.pre(/^findOneAnd/, async function (next) {
  this.r = await this.findOne(); //here is still old review object, before update

  next();
});

reviewSchema.post(/^findOneAnd/, async function () {
  // this.findOne(); does NOT work here, query has already executed

  // here is best time to call the static unction because the object was already ipdated

  await this.r.constructor.calcAverageRatings(this.r.tour);
});

const Review = mongoose.model('Review', reviewSchema);

module.exports = Review;
