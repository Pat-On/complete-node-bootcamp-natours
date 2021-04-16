// const fs = require('fs');
const Tour = require('../model/tourModel');

exports.getAllTours = async (req, res) => {
  try {
    //.find() -> is doing basicaly everything for us - BSON/JSON to the js objects
    const tours = await Tour.find();

    // console.log(req.requestTime);

    res.status(200).json({
      status: 'success',

      results: tours.length, // it is not exactly from specification but it is useful for front app to do it
      data: {
        tours: tours, //ES6 just tours - k and v the same
      },
    });
  } catch (err) {
    res.status(404).json({
      status: 'fail',
      message: err,
    });
  }
};

exports.createTour = async (req, res) => {
  try {
    // const newTours = new Tour({})
    // newTours.save

    //we call create function on the model itself - create return promise
    const newTour = await Tour.create(req.body);

    res.status(201).json({
      status: 'success',
      data: {
        tour: newTour,
      },
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: 'Invalid data sent!',
    });
  }
};

exports.getTour = async (req, res) => {
  try {
    const tour = await Tour.findById(req.params.id);

    res.status(201).json({
      status: 'success',
      data: {
        tour,
      },
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: 'Invalid data sent!',
    });
  }
};

exports.updateTour = (req, res) => {
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
