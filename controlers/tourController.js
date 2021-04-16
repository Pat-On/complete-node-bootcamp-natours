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
    // !IMPORTANT in that case we would have to do documentation, to teach user how to use it
    //BUILDING QUERY
    //1 ) filtering
    //we are kicking out the things what we do not want to query from DB
    const queryObj = { ...req.query };
    const excludedFields = ['page', 'sort', 'limit', 'fields'];
    excludedFields.forEach((el) => delete queryObj[el]);
    //.find() -> is doing basicaly everything for us - BSON/JSON to the js objects

    //2) Advanced filtering
    let queryString = JSON.stringify(queryObj);
    queryString = queryString.replace(
      /\b(gte|gt|lte|lt)\b/g,
      (match) => `$${match}`
    );
    // console.log(JSON.parse(queryString));
    // {difficulty: 'easy', duration: { $gte: 5}} <- manual writing for query in mongoose
    //{ difficulty: { gte: 'easy' }, page: '5' }
    //to replace gre, gt, lte, lt

    // const tours = await Tour.find();
    // console.log(req.query, queryObj);

    const query = Tour.find(JSON.parse(queryString));

    // console.log(query);
    //mongoose methods
    // const tours = await Tour.find()
    //   .where('duration')
    //   .equals(5)
    //   .where('difficulty')
    //   .equals('easy');

    // EXECUTE QUERY
    const tours = await query;

    //SEND RESPONSE
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
