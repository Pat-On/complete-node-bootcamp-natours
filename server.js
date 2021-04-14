const mongoose = require('mongoose');

const dotenv = require('dotenv');

//it only need to happen once and then process has all variables accessible from every single file in proj
dotenv.config({ path: './config.env' });
const app = require('./app');

// 4) starting the server
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
  })
  .then(() => {
    // here we have ccess to the conection object
    // console.log(con.connections);
    console.log('DB connection successful!');
  });

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`App running on port ${port}...`);
});
