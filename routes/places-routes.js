const express = require("express");

const router = express.Router();

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

router.get("/:pid", (req, res, next) => {
  const placeId = req.params.pid;
  const place = DUMMY_PLACES.find((p) => {
    return p.id === placeId;
  });
  console.log("GET Request in places");

  if (!place) {
      const error = new Error("Could not find place");
      error.code = 404;
      return next(error)
  }

  res.json({ place: place });
});

router.get("/user/:uid", (req, res, next) => {
  const userId = req.params.uid;
  const place = DUMMY_PLACES.find((p) => {
    return p.creator === userId;
  });

  console.log("users");

  if (!place) {
    const error = new Error('Could not find user');
    error.code = 404
    throw error
  }

  res.json({ place: place });
});

module.exports = router;
