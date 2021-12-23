const HttpError = require('../models/http-error');

const DUMMY_PLACES = [
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
    creator: "u2",
  },
];

const getPlaceById = (req, res, next) => {
  const placeId = req.params.pid;
  const place = DUMMY_PLACES.find((p) => {
    return p.id === placeId;
  });
  console.log("GET Request in places");

  if (!place) {
    throw new HttpError("Could not find place", 404);
  }

  res.json({ place: place });
};

const getPlacesByUserId = (req, res, next) => {
  const userId = req.params.uid;
  const place = DUMMY_PLACES.find((p) => {
    return p.creator === userId;
  });

  console.log("users");

  if (!place) {
    return next(new HttpError("Could not find user", 404));
  }

  res.json({ place: place });
}; 

const createPlace = (req, res, next) => {
    const { title, description, coordinates, address, creator } = req.body
    // const { id, title, description, location, address, creator } = req.body;

    const createdPlace = {
        title,
        description,
        location: coordinates,
        address,
        creator,
    };

    DUMMY_PLACES.push(createPlace);

    res.status(201).json({place: createdPlace})
};

exports.getPlaceById = getPlaceById;
exports.getPlacesByUserId = getPlacesByUserId;
exports.createPlace = createPlace;
