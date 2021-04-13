const fs = require('fs');
const express = require('express');

const morgan = require('morgan');

const app = express();

//1) MIDDLEWARES
app.use(morgan('dev'));
app.use(express.json()); // <-it really work nice!

//our own middleware
app.use((req, res, next) => {
  //by adding next express know that we are creating here the middleware
  //next is the function - name is convention
  console.log('Hello from the middleware');
  next(); // if we are not going to add it the req would stuck here
});

app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();

  next();
});
const tours = JSON.parse(
  fs.readFileSync(`${__dirname}/dev-data/data/tours-simple.json`)
);

//2) ROUTES HANDLERS

const getAllTours = (req, res) => {
  console.log(req.requestTime);

  res.status(200).json({
    status: 'success',

    results: tours.length, // it is not exactly from specification but it is useful for front app to do it
    data: {
      tours: tours, //ES6 just tours - k and v the same
    },
  });
};
const createTour = (req, res) => {
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
};

const getTour = (req, res) => {
  console.log(req.params);
  const id = req.params.id * 1; // trick in JS :>

  if (id > tours.length) {
    return res.status(404).json({
      status: 'fail',
      message: 'Invalid ID',
    });
  }

  const tour = tours.find((el) => el.id === id);

  res.status(200).json({
    status: 'success',
    //envelope: (enveloping)
    data: {
      tour, //ES6 just tours - k and v the same
    },
  });
};

const updateTour = (req, res) => {
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
};

const deleteTour = (req, res) => {
  if (+req.params.id > tours.length) {
    return res.status(404).json({
      status: 'fail',
      message: 'Invalid ID',
    });
  }

  res.status(204).json({
    status: 'success',
    data: null, //null mean that the data is no longer existing
  });
};

//3) Routes
app.route('/api/v1/tours').get(getAllTours).post(createTour);

app
  .route('/api/v1/tours/:id')
  .get(getTour)
  .patch(updateTour)
  .delete(deleteTour);

// app.get('/api/v1/tours', getAllTours);
// app.post('/api/v1/tours', createTour);

// app.get('/api/v1/tours/:id', getTour);
// app.patch('/api/v1/tours/:id', updateTour);
// app.delete('/api/v1/tours/:id', deleteTour);

// 4) starting the server

const port = 3000;
app.listen(port, () => {
  console.log(`App running on port ${port}...`);
});
