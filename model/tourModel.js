const mongoose = require('mongoose');

const slugify = require('slugify');

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
    slug: String,
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
    secretTour: {
      type: Boolean,
      default: false,
    },
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
  //this key word - we can not use them in query because they are not part of data base

  return this.durration / 7;
});
// DOCUMENT MIDDLEWARE: runs before .save() and .create() but .inserMany() is not going trigger it
tourSchema.pre('save', function (next) {
  // console.log(this); //this is going to be our document
  this.slug = slugify(this.name, { lower: true });
  next();
});
//after saving document to DB - last middleware after all changes
// tourSchema.post('save', function (doc, next) {
//   console.log(doc);
//   next();
// });

//QUERY MIDDLEWARE
//this regular expresion is going to trigger always when happen event starting with find wow
tourSchema.pre(/^find/, function (next) {
  // tourSchema.pre('find', function (next) {
  //this keq word is the query object mongoDB
  this.find({ secretTour: { $ne: true } });
  this.start = Date.now();
  next();
});

//run after query was executed so we have access to the docs
tourSchema.post(/^find/, function (docs, next) {
  console.log(`query took: ${Date.now() - this.start} milliseconds`);
  console.log(docs);

  next();
});

// convention to use capital in that case - model declaration
const Tour = mongoose.model('Tour', tourSchema);

module.exports = Tour;
