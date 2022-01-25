const { validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const HttpError = require('../models/http-error');
const User = require('../models/user');

//GET USERS

const getUsers = async (req, res, next) => {
  let users;

  try {
    users = await User.find({}, '-password');
  } catch (err) {
    const error = new HttpError(
      'Fetching users failed. Please try again.',
      500
    );
    return next(error);
  }

  res.json({ users: users.map((user) => user.toObject({ getters: true })) });
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
    const error = new HttpError('Signing up failed. Please try again.', 500);
    return next(error);
  }

  if (existingUser) {
    const error = new HttpError('User exists already. Please login.', 422);
    return next(error);
  }

  let hashedPassword;

  try {
    hashedPassword = await bcrypt.hash(password, 12);
  } catch (err) {
    const error = new Error('Could not create user.Please try again.', 500);
    return next(error);
  }

  const createdUser = new User({
    name,
    email,
    image: req.file.path,
    // image: req.file.path.replace("\\", "/"),
    password: hashedPassword,
    places: [],
  });

  try {
    await createdUser.save();
  } catch (err) {
    const error = new HttpError('Signing up failed. Please try again.', 500);
    return next(error);
  }

  let token;
  try {
    token = jwt.sign(
      { userId: createdUser.id, email: createdUser.email },
      'secret_private:key_to_be_changed',
      { expiresIn: '1h' }
    );
  } catch (err) {
    const error = new HttpError('Signing up failed. Please try again.', 500);
    return next(error);
  }

  res
    .status(201)
    .json({ userId: createdUser.id, email: createdUser.email, token: token });
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

  if (!existingUser) {
    const error = new HttpError('Invalid credentials. Please try again.', 403);
    return next(error);
  }

  let isValidpassword = false;
  try {
    isValidpassword = await bcrypt.compare(password, existingUser.password);
  } catch (err) {
    const error = new Error(
      'Could not log you in. Please check your credentials and try again',
      500
    );
    return next(error);
  }

  if (!isValidpassword) {
    const error = new HttpError('Invalid credentials. Please try again.', 401);
    return next(error);
  }

  let token;
  try {
    token = jwt.sign(
      { userId: existingUser.id, email: existingUser.email },
      'secret_private:key_to_be_changed',
      { expiresIn: '1h' }
    );
  } catch (err) {
    const error = new HttpError('Logging in failed. Please try again.', 500);
    return next(error);
  }

  res.status(200).json({
    userId: existingUser.id,
    email: existingUser.email,
    token: token
  });
};

exports.getUsers = getUsers;
exports.signup = signup;
exports.login = login;
