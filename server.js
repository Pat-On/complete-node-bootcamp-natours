const mongoose = require('mongoose');

const dotenv = require('dotenv');

//it only need to happen once and then process has all variables accessible from every single file in proj
dotenv.config({ path: './config.env' });
const app = require('./app');

const DB = process.env.DATABASE.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD
);

mongoose
  .connect(DB, {
    //we need to specify to take care for deprecation
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true,
  })
  .then(() => {
    // here we have access to the connection object
    // console.log(con.connections);
    console.log('DB connection successful!');
  });

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

// convention to use capital in that case
const Tour = mongoose.model('Tour', tourSchema);

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`App running on port ${port}...`);
});
