const { validationResult } = require('express-validator');

const HttpError = require('../models/http-error');
const User = require('../models/user');


//GET USERS

const getUsers = async (req, res, next) => {
  
  let users;

  try {
    users = await User.find({}, '-password');
  } catch (err) {
    const error = new HttpError('Fetching users failed. Please try again.', 500);
    return next(error);
  }

  res.json({ users: users.map(user => user.toObject( { getters: true } ) ) })
};


//SIGNUP

const signup = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.log(errors);
    return next(new HttpError('Invalid inputs passed', 422));
  }

  const { name, email, password } = req.body;

  let existingUser;

  try {
    existingUser = await User.findOne({ email: email });
  } catch (err) {
    const error = new HttpError(
      'Signing up failed. Please try again.', 
      500
      );
    return next(error);
  }

  if (existingUser) {
    const error = new HttpError(
      'User exists already. Please login.',
      422
    );
    return next(error);
  }

  const createdUser = new User({
    name,
    email,
    image: req.file.path,
    // image: req.file.path.replace("\\", "/"),
    password,
    places: []
  });

  try {
    await createdUser.save();
  } catch (err) {
    const error = new HttpError(
      'Signing up failed. Please try again.',
      500
    );
    return next(error);
  }

  res.status(201).json({ user: createdUser.toObject({ getters: true }) });
};


//LOGIN

const login = async (req, res, next) => {
  const { email, password } = req.body;
  let existingUser;

  try {
    existingUser = await User.findOne({ email: email });
  } catch (err) {
    const error = new HttpError('Loging in failed. Please try again.', 500);
    return next(error);
  }

  if (!existingUser || existingUser.password !== password) {
    const error = new HttpError('Invalid credentials. Please try again.', 401);
    return next(error);
  }

  res.status(200).json({ message: 'logged in!', user: existingUser.toObject({ getters: true}) });
};

exports.getUsers = getUsers;
exports.signup = signup;
exports.login = login;
