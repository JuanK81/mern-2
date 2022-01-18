const nodeid = require("node-id");
const { validationResult } = require('express-validator');

const HttpError = require("../models/http-error");

const DUMMY_USERS = [
  {
    id: "u1",
    name: "Paco",
    email: "something@something.something",
    password: "password",
  },
  {
    id: "u2",
    name: "Gallo",
    email: "pocpoc@something.something",
    password: "password",
  },
];

const getUsers = (req, res, next) => {
  res.status(200).json({ users: DUMMY_USERS });
};

const signup = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.log(errors);
    throw new HttpError("Invalid inputs passed", 422);
  } 

  const { name, email, password } = req.body;

  const hasUser = DUMMY_USERS.find((u) => u.email === email);
  if (hasUser) {
    throw new HttpError(
      "Could not create user, cemail allready exists.",
      422
    );
  }

  console.log("Signup", name, email, password);

  const createdUser = {
    id: nodeid(),
    name,
    email,
    password,
  };

  console.log(createdUser);

  DUMMY_USERS.push(createdUser);

  res.status(201).json({ user: createdUser });
};

const login = (req, res, next) => {
  const { email, password } = req.body;

  const identifiedUser = DUMMY_USERS.find((u) => u.email === email);
  console.log(identifiedUser.password, password);
  if (!identifiedUser || identifiedUser.password !== password) {
    throw new HttpError(
      "Could not identify user, credentials seem to be wrong.",
      401
    );
  }

  res.status(200).json({ message: "logged in!" });
};

exports.getUsers = getUsers;
exports.signup = signup;
exports.login = login;
