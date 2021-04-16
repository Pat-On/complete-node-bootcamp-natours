// const fs = require('fs');
const Tour = require('../model/tourModel');

exports.getTour = async (req, res) => {
  try {
    const tour = await Tour.findById(req.params.id);
    //Tour.findOne({_id: req.params.id})- normal solution

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

exports.updateTour = async (req, res) => {
  try {
    // we are going to update the item by id - logical
    const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
      // options
      new: true, // new updated document would be returned to client
      runValidators: true, // we are going to trigger check again - validator base on the model's schema nice!
    });
    res.status(200).json({
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

exports.deleteTour = async (req, res) => {
  try {
    await Tour.findByIdAndDelete(req.params.id);

    res.status(204).json({
      status: 'success',
      data: null, //null mean that the data is no longer existing
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err,
    });
  }
};
