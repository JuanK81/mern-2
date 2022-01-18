const nodeid = require("node-id");
const { validationResult } = require('express-validator')

const HttpError = require("../models/http-error");
const getCoordForAddress = require('../util/location');

let DUMMY_PLACES = [
  {
    id: "p1",
    title: "Churreria Paco",
    description: "The best churros ever.",
    location: {
      lat: 39.573176,
      lng: 2.634656,
    },
    address: "yes",
    creator: "u1",
  },
  {
    id: "p2",
    title: "Churreria Pepe",
    description: "The not so best churros ever.",
    location: {
      lat: 39.573126,
      lng: 2.634517,
    },
    address: "Close to yes",
    creator: "u1",
  },
];

const getPlaceById = (req, res, next) => {
  const placeId = req.params.pid;
  const place = DUMMY_PLACES.find((p) => {
    return p.id === placeId;
  });
  console.log("GET Request in places");

  if (!place) {
    throw new HttpError("Could not find a place for the provided id.", 404);
  }

  res.json({ place: place });
};

const getPlacesByUserId = (req, res, next) => {
  const userId = req.params.uid;

  const places = DUMMY_PLACES.filter((p) => {
    return p.creator === userId;
  });

  console.log("users");

  if (!places || places.length === 0) {
    return next(
      new HttpError("Could not find a places for the provided user id.", 404)
    );
  }

  res.json({ places: places });
};

const createPlace = async (req, res, next) => {
  // const uuid = () => {
  //   return (
  //     "p" + Math.floor(Math.random() * 1000) + Math.floor(Math.random() * 1000)
  //   );

  // }
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    next(new HttpError('Invalid inputs passed', 422));
  } 

  const { title, description, address, creator } = req.body;

  let coordinates;
  console.log(coordinates);

  try {
    coordinates = await getCoordForAddress(address)
  } catch (error) {
    return next(error);
  }
  
  const createdPlace = {
    id: nodeid(),
    title, //title, short for title: title....
    description,
    location: coordinates,
    // coordinates: location,
    address,
    creator,
  };
  
  DUMMY_PLACES.push(createPlace); //ushift(createPlace) to add te new element to the beginning of the list
  
  res.status(201).json({ place: createdPlace });
  console.log(createdPlace);
};

const updatePlace = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.log(errors);
    throw new HttpError("Invalid inputs passed", 422);
  } 

  const { title, description } = req.body;
  const placeId = req.params.pid;
  
  const updatedPlace = { ...DUMMY_PLACES.find(p => p.id === placeId) };
  const placeIndex = DUMMY_PLACES.findIndex((p) => p.id === placeId);
  updatedPlace.title = title;
  updatedPlace.description = description;
  
  DUMMY_PLACES[placeIndex] = updatedPlace;
  
    res.status(200).json({ place: updatedPlace })

};

const deletePlace = (req, res, next) => {
  const placeId = req.params.pid;

  if (!DUMMY_PLACES.find(p => p.id === placeId)) {
    throw new HttpError('Could notfind a place for that id.', 404);
  }

  DUMMY_PLACES = DUMMY_PLACES.filter(p => p.id !== placeId);

  res.status(200).json({message: "Place deleted."})
};

exports.getPlaceById = getPlaceById;
exports.getPlacesByUserId = getPlacesByUserId;
exports.createPlace = createPlace;
exports.updatePlace = updatePlace;
exports.deletePlace = deletePlace;
