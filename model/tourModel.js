const mongoose = require('mongoose');

//---------------------- mongoose ---------------------------
const tourSchema = new mongoose.Schema({
  //native for js types of data
  // name: String,
  name: {
    type: String,
    required: [true, 'A tour must have a name'], // <-proper name of it is validator <nice>
    unique: true, // base on this we can not have two the same name of the trip
  },
  rating: {
    type: Number,
    default: 4.5, // default value if not specify
  },
  // price: Number,
  price: {
    type: Number,
    required: [true, 'A tour must have a price'],
  },
});

// convention to use capital in that case - model declaration
const Tour = mongoose.model('Tour', tourSchema);

module.exports = Tour;
