const fs = require('fs');
const express = require('express');

const app = express();

//middleware
//data from the body is added to the req body -> more about it later
app.use(express.json()); // <-it really work nice!

//app method "link"
// app.get('/', (req, res) => {
//   // res.status(200).send('Hello from the server side');

//   res
//     .status(200)
//     .json({ message: 'Hello from the server side', app: 'Natours' });
// });

// app.post('/', (req, res) => {
//   res.send('You can post to this endpoint');
// });

//reading the data from file
// dev - datadata\datadata\data\tours - simple.json;
const tours = JSON.parse(
  fs.readFileSync(`${__dirname}/dev-data/data/tours-simple.json`)
);

app.get('/api/v1/tours', (req, res) => {
  res.status(200).json({
    status: 'success',
    //envelope: (enveloping)
    results: tours.length, // it is not exactly from specification but it is useful for front app to do it
    data: {
      tours: tours, //ES6 just tours - k and v the same
    },
  });
});

app.post('/api/v1/tours', (req, res) => {
  // console.log(req);
  // console.log(req.body);
  const newId = tours[tours.length - 1].id + 1;
  const newTour = Object.assign({ id: newId }, req.body);

  tours.push(newTour);
  fs.writeFile(
    `${__dirname}/dev-data/data/tours-simple.json`,
    JSON.stringify(tours),
    (err) => {
      res.status(201).json({
        status: 'success',
        data: {
          tour: newTour,
        },
      });
    }
  );
  // res.send('done');
});

app.get('/api/v1/tours/:id', (req, res) => {
  console.log(req.params);
  const id = req.params.id * 1; // trick in JS :>

  //pseudo solution - over simplistic - in real world we will have
  //  to check if the users code contain the proper input and if not contain "malwers"

  if (id > tours.length) {
    return res.status(404).json({
      status: 'fail',
      message: 'Invalid ID',
    });
  }

  //another way around is to check if id is define so
  //if (!tour) { ... }
  const tour = tours.find((el) => el.id === id);

  res.status(200).json({
    status: 'success',
    //envelope: (enveloping)
    data: {
      tour, //ES6 just tours - k and v the same
    },
  });
});

app.patch('/api/v1/tours/:id', (req, res) => {
  if (+req.params.id > tours.length) {
    return res.status(404).json({
      status: 'fail',
      message: 'Invalid ID',
    });
  }
  //we are not going to implement it here because it is to much work
  // we will work on it base on the db
  res.status(200).json({
    status: 'success',
    data: {
      tour: '<Updated Tour here...>',
    },
  });
});

//starting the server
const port = 3000;
app.listen(port, () => {
  console.log(`App running on port ${port}...`);
});
