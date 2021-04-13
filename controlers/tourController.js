const fs = require('fs');

const tours = JSON.parse(
  fs.readFileSync(`${__dirname}/../dev-data/data/tours-simple.json`)
);

//to check id middleware
exports.checkID = (req, res, next) => {
  console.log(`tour id is: ${val}`);
  console.log(req.params.id);
  if (req.params.id * 1 > tours.length - 1) {
    return res.status(404).json({
      status: 'fail',
      message: 'Invalid ID',
    });
  }
  next();
};

exports.checkBody = (req, res, next) => {
  console.log(req.body.name);
  console.log('???');
  if (!req.body.name || !req.body.price) {
    return res.status(400).json({
      status: 'fail',
      message: 'Not containing all required data',
    });
  }
  next();
};

// exports.checkBody = (req, res, next) => {
//   if (!req.body.name || !req.body.price) {
//     return res.status(400).json({
//       status: 'fail',
//       message: 'Missing name or price',
//     });
//   }
//   next();
// };

exports.getAllTours = (req, res) => {
  console.log(req.requestTime);

  res.status(200).json({
    status: 'success',

    results: tours.length, // it is not exactly from specification but it is useful for front app to do it
    data: {
      tours: tours, //ES6 just tours - k and v the same
    },
  });
};
exports.createTour = (req, res) => {
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

exports.getTour = (req, res) => {
  //   console.log(req.params);
  const id = req.params.id * 1; // trick in JS :>

  //   if (id > tours.length) {
  //     return res.status(404).json({
  //       status: 'fail',
  //       message: 'Invalid ID',
  //     });
  //   }

  const tour = tours.find((el) => el.id === id);

  res.status(200).json({
    status: 'success',
    //envelope: (enveloping)
    data: {
      tour, //ES6 just tours - k and v the same
    },
  });
};

exports.updateTour = (req, res) => {
  //   if (+req.params.id > tours.length) {
  //     return res.status(404).json({
  //       status: 'fail',
  //       message: 'Invalid ID',
  //     });
  //   }
  //we are not going to implement it here because it is to much work
  // we will work on it base on the db
  res.status(200).json({
    status: 'success',
    data: {
      tour: '<Updated Tour here...>',
    },
  });
};

exports.deleteTour = (req, res) => {
  res.status(204).json({
    status: 'success',
    data: null, //null mean that the data is no longer existing
  });
};
