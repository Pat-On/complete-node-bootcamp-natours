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

const port = process.env.PORT || 3000;
const server = app.listen(port, () => {
  console.log(`App running on port ${port}...`);
});

process.on('unhandledRejection', (err) => {
  console.log(err.name, err.message);
  console.log('unhandled rejection!');
  //we are giving the time for server to finish all requests
  server.close(() => {
    process.exit(1); //it like forced shut down - do not take care for any req
  });
});

///here at this place we would have the software which is going to start up again the application
//dev ops?
