const mongoose = require('mongoose');

const slugify = require('slugify');
// const validator = require('validator');
// const User = require('./userModel');

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
      maxlength: [40, 'A tour name must have less or equal then 40 characters'],
      minlength: [10, 'A tour must have more than 10 characters'],
      // validate: [validator.isAlpha, 'Tour name must only contain characters'], //validator imported from the validator import
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
      enum: {
        values: ['easy', 'medium', 'difficult'],
        message: 'Difficult is either: easy, medium or difficult',
      },
    },
    ratingsAverage: {
      type: Number,
      default: 4.5, // default value if not specify
      //min max work with dates too
      min: [1, 'Rating must be more than 1'],
      max: [5, 'Rating must be less than 5'],
      set: (val) => Math.round(val * 10) / 10, //rounding number - funny way :>
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
    priceDiscount: {
      type: Number,
      //val - coming from output
      validate: {
        validator: function (val) {
          //this only point to current document on NEW document creation
          return val < this.price;
        },
        //({VALUE}) - this syntax is coming from the Mongo.DB
        message: 'Discount price ({VALUE}) should be below regular price',
      },
    },
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
    startLocation: {
      //he decided to have start location not in array to ? have it more obvious?
      // You can put start location to array and have it on index0

      //GeoJSON
      // this object is really embedded object where we can specify some properties
      type: {
        //schema type options for type
        type: String,
        default: 'Point',
        enum: ['Point'], // limiting that field only to "Point" option
      },
      coordinates: [Number], //longitude first and then latitude:
      address: String,
      description: String,
    },
    //embedded documents
    locations: [
      {
        type: {
          type: String,
          default: 'Point',
          enum: ['Point'],
        },
        coordinates: [Number],
        address: String,
        description: String,
        day: Number, // when people would go to this location
      },
    ],
    guides: [
      {
        // /embedded documents -> we are using the type mongoose.Schema.ObjectId to point that
        // here we are going to have the id to other documents from MongoDB
        type: mongoose.Schema.ObjectId,
        ref: 'User', // by this we are establishing the reference by between the collections
      },
    ],
    // guides: Array, //embedded user's ids  -> embedded array of its of users - guides
  },
  {
    //option object we setting that virual are going to be part of output
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// tourSchema.index({ price: 1 }); //single field index
tourSchema.index({ price: 1, ratingsAverage: -1 }); //compound index are doing job for single req as well
tourSchema.index({ slug: 1 }); // 1 or -1 is not so important

tourSchema.index({ startLocation: '2dsphere' }); //geo json -> earth like sphere

tourSchema.virtual('durationWeeks').get(function () {
  //we used regular function because arrow function is not getting its own
  //this key word - we can not use them in query because they are not part of data base

  return this.duration / 7;
});

tourSchema.virtual('reviews', {
  ref: 'Review',
  foreignField: 'tour', // field in the Review model where is data stored
  localField: '_id', // where the id is stored in local field in Review
});

// DOCUMENT MIDDLEWARE: runs before .save() and .create() but .insertMany() is not going trigger it
tourSchema.pre('save', function (next) {
  this.slug = slugify(this.name, { lower: true });
  next();
});
//after saving document to DB - last middleware after all changes
// tourSchema.post('save', function (doc, next) {

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

// code which is going to full schema with the users
// tourSchema.pre('save', async function (next) {
//   const guidesPromises = this.guides.map(async (id) => await User.findById(id));
//   this.guides = await Promise.all(guidesPromises);

//   next();
// });

//run after query was executed so we have access to the docs
// tourSchema.post(/^find/, function (docs, next) {

// next();
// });

//All queries by this query middleware will populate the guides fields
// it is going to happen everywhere on the find methods
tourSchema.pre(/^find/, function (next) {
  this.populate({
    path: 'guides',
    select: '-__v -passwordChangedAt',
  });
  next();
});

//!IMPORTANT
//return to it - how to set it to work with geoNear
//AGGREGATION MIDDLEWARE
// tourSchema.pre('aggregate', function (next) {
//   this.pipeline().unshift({ $match: { secretTour: { $ne: true } } });

//   next();
// });

// convention to use capital in that case - model declaration
const Tour = mongoose.model('Tour', tourSchema);

module.exports = Tour;
