const app = require('./app');

// 4) starting the server

const port = 3000;
app.listen(port, () => {
  console.log(`App running on port ${port}...`);
});