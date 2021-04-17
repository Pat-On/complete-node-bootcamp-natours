const mongoose = require('mongoose');

//---------------------- mongoose ---------------------------
const tourSchema = new mongoose.Schema(
  {
    //native for js types of data
    // name: String,
    name: {
      type: String,
      required: [true, 'A tour must have a name'], // <-proper name of it is validator <nice>
      unique: true, // base on this we can not have two the same name of the trip
      trim: true,
    },
    duration: {
      type: Number,
      required: [true, 'A tour must have a duration'],
    },
    maxGroupSize: {
      type: Number,
      required: [true, ' A tour must have a group size'],
    },
    difficulty: {
      type: String,
      required: [true, 'A tour must have a difficulty'],
    },
    ratingsAverage: {
      type: Number,
      default: 4.5, // default value if not specify
    },
    ratingsQuantity: {
      type: Number,
      default: 0,
    },
    // price: Number,
    price: {
      type: Number,
      required: [true, 'A tour must have a price'],
    },
    priceDiscount: Number,
    summary: {
      type: String,
      trim: true, // only work for strings ->  different schema types different config
      required: [true, 'A tour must have a description'],
    },
    description: {
      type: String,
      trim: true,
    },
    imageCover: {
      type: String, //e will store here just the reference to the picture, that is why it is string
      required: [true, 'A tour must have a cover image'],
    },
    images: [String],
    createdAt: {
      type: Date,
      default: Date.now(), //time stamp with a milliseconds in mong it is automatically converted to data
      select: false, //hiding it from the users eyes
    },
    startDates: [Date],
    //"2021-03-21" -> and mongo would pass it automatically to date
    //if it is can not parse it, t would then it would throw error
  },
  {
    //option object we setting that virual are going to be part of output
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

tourSchema.virtual('durationWeeks').get(function () {
  //we used regular function because arrow function is not getting its own
  //this key word
  return this.durration / 7;
});

// convention to use capital in that case - model declaration
const Tour = mongoose.model('Tour', tourSchema);

module.exports = Tour;
