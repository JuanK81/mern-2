const fs = require('fs');

const mongoose = require('mongoose');
const { validationResult } = require('express-validator');

const HttpError = require('../models/http-error');
const getCoordForAddress = require('../util/location');
const Place = require('../models/place');
const User = require('../models/user');

// GET PLACE BY ID

const getPlaceById = async (req, res, next) => {
  const placeId = req.params.pid;

  let place;

  try {
    place = await Place.findById(placeId);
    console.log('GET Request in places');
  } catch (err) {
    const error = new HttpError(
      'Something went wrong. Unable to find place',
      500
    );
    return next(error);
  }

  if (!place) {
    const error = new HttpError(
      'Could not find a place for the provided id.',
      404
    );
    return next(error);
  }

  res.json({ place: place.toObject({ getters: true }) });
};

//GET BY USER ID

const getPlacesByUserId = async (req, res, next) => {
  const userId = req.params.uid;

  let places;
  try {
    places = await Place.find({ creator: userId });
  } catch (err) {
    const error = new HttpError(
      'Fetching places failed. Please try again later',
      500
    );
    return next(error);
  }

  console.log('users');

  if (!places || places.length === 0) {
    return next(
      new HttpError('Could not find a places for the provided user id.', 404)
    );
  }

  res.json({
    places: places.map((place) => place.toObject({ getters: true })),
  });
};

//CREATE PLACE

const createPlace = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(new HttpError('Invalid inputs passed', 422));
  }

  const { title, description, address, creator } = req.body;

  let coordinates;
  console.log('coordinates', coordinates);

  try {
    coordinates = await getCoordForAddress(address);
  } catch (error) {
    return next(error);
  }

  const createdPlace = new Place({
    title,
    description,
    address,
    location: coordinates,
    image: req.file.path,
    // image: req.file.path.replace('\\', '/'),
    creator,
  });

  let user;

  try {
    user = await User.findById(creator);
  } catch (err) {
    const error = new HttpError(
      'Creating new place failed. Please try again.',
      500
    );
    return next(error);
  }
  console.log('clg 110 creator', creator);
  if (!user) {
    const error = new HttpError(
      'Could not fin user for provided id. Please try again.',
      404
    );
    return next(error);
  }

  console.log('clg 119 user', user);

  try {
    const sess = await mongoose.startSession();
    sess.startTransaction();
    await createdPlace.save({ session: sess });
    user.places.push(createdPlace);
    await user.save({ session: sess });
    await sess.commitTransaction();
  } catch (err) {
    console.log('clg 129 err', err);
    const error = new HttpError(
      'Creating new place failed. Please try again.',
      500
    );
    return next(error);
  }

  res.status(201).json({ place: createdPlace });
  console.log(createdPlace);
};

//UPDATE

const updatePlace = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.log(errors);
    return next(new HttpError('Invalid inputs passed', 422));
  }

  const { title, description } = req.body;
  const placeId = req.params.pid;

  let place;
  try {
    place = await Place.findById(placeId);
    console.log('update places');
  } catch (err) {
    const error = new HttpError(
      'Something went wrong. Unable to update place',
      500
    );
    return next(error);
  }

  if (place.creator.toString() !== req.userData.userId) {
    const error = new HttpError(
      'You are not allowed to edit this place.',
      403
    );
    return next(error);
  }

  place.title = title;
  place.description = description;

  try {
    await place.save();
  } catch (err) {
    const error = new HttpError(
      'Something went wrong. Unable to update place',
      500
    );
    return next(error);
  }

  res.status(200).json({ place: place.toObject({ getters: true }) });
};

//DELETE

const deletePlace = async (req, res, next) => {
  const placeId = req.params.pid;

  // let place = 'place';
  let place;

  try {
    place = await Place.findById(placeId).populate('creator');
  } catch (err) {
    const error = new HttpError(
      'Something went wrong. Unable to delete place.',
      500
    );
    return next(error);
  }

  if (!place) {
    const error = new HttpError(
      'Could not find place for this id. Please try again.',
      404
    );
    return next(error);
  }

  if (place.creator.id !== req.userData.userId) {
    const error = new HttpError('You are not allowed to delete this place.', 403);
    return next(error);
  }

  const imagePath = place.image;

  try {
    const sess = await mongoose.startSession();
    sess.startTransaction();
    await place.remove({ session: sess });
    place.creator.places.pull(place);
    await place.creator.save({ session: sess });
    await sess.commitTransaction();
  } catch (err) {
    const error = new HttpError(
      'Something went wrong. Unable to delete place',
      500
    );
    return next(error);
  }

  fs.unlink(imagePath, (err) => {
    console.log(err);
  });

  res.status(200).json({ message: 'Place deleted.' });
};

exports.getPlaceById = getPlaceById;
exports.getPlacesByUserId = getPlacesByUserId;
exports.createPlace = createPlace;
exports.updatePlace = updatePlace;
exports.deletePlace = deletePlace;
