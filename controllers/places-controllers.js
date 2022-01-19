const nodeid = require('node-id');
const { validationResult } = require('express-validator');

const HttpError = require('../models/http-error');
const getCoordForAddress = require('../util/location');
const Place = require('../models/place');

let DUMMY_PLACES = [
  {
    id: 'p1',
    title: 'Churreria Paco',
    description: 'The best churros ever.',
    location: {
      lat: 39.573176,
      lng: 2.634656,
    },
    address: 'yes',
    creator: 'u1',
  },
  {
    id: 'p2',
    title: 'Churreria Pepe',
    description: 'The not so best churros ever.',
    location: {
      lat: 39.573126,
      lng: 2.634517,
    },
    address: 'Close to yes',
    creator: 'u1',
  },
];

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

  res.json({ place: place.toObject( { getters: true } ) });
};

const getPlacesByUserId = async (req, res, next) => {
  const userId = req.params.uid;

  let places;
  try {
    places = await Place.find( { creator: userId } );
} catch (err) {
  const error = new HttpError(
    'Fetching places failed. Please try again later',
    500
  );
  return next(error)
}

  console.log('users');

  if (!places || places.length === 0) {
    return next(
      new HttpError('Could not find a places for the provided user id.', 404)
    );
  }

  res.json({ places: places.map(place => place.toObject( { getters: true } )) });
};

const createPlace = async (req, res, next) => {
  // const uuid = () => {
  //   return (
  //     "p" + Math.floor(Math.random() * 1000) + Math.floor(Math.random() * 1000)
  //   );

  // }
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(new HttpError('Invalid inputs passed', 422));
  }

  const { title, description, address, creator } = req.body;

  let coordinates;
  console.log(coordinates);

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
    image:
      'https://images.pexels.com/photos/42093/pexels-photo-42093.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=750&w=1260',
    creator,
  });

  try {
    await createdPlace.save();
  } catch (err) {
    const error = new HttpError(
      'Creating new place failed. Please try again.',
      500
    );
    return next(error);
  }

  res.status(201).json({ place: createdPlace });
  console.log(createdPlace);
};

const updatePlace = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.log(errors);
    throw new HttpError('Invalid inputs passed', 422);
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

  res.status(200).json({ place: place.toObject( { getters: true } ) });
};

const deletePlace = async (req, res, next) => {
  const placeId = req.params.pid;

  let place;
  
  try {
    place = await Place.findById(placeId);
  } catch (err) {
    const error = new HttpError(
      'Something went wrong. Unable to delete place',
      500
    );
    return next(error);
  }

  try {
    place.remove();
  } catch (err) {
    const error = new HttpError(
      'Something went wrong. Unable to delete place',
      500
    );
    return next(error);
  }

  res.status(200).json({ message: 'Place deleted.' });
};

exports.getPlaceById = getPlaceById;
exports.getPlacesByUserId = getPlacesByUserId;
exports.createPlace = createPlace;
exports.updatePlace = updatePlace;
exports.deletePlace = deletePlace;
