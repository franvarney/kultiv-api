let User;

import {BaseModel} from 'hapi-mongo-models';
import Bcrypt from 'bcrypt';
import Joi from 'joi';
import Parallel from 'run-parallel';
import ShortId from 'shortid';
import ShortId32 from 'shortid32';

const SALT_WORK_FACTOR = 10;
ShortId32.characters('23456789abcdefghjklmnpqrstuvwxyz');

User = BaseModel.extend({
  constructor: function (attrs) {
    Object.assign(this, attrs);
  }
});

User._collection = 'users'; // eslint-disable-line

function toLower(string) {
  return string.toLowerCase();
}

User.schema = Joi.object().keys({
  _id: Joi.string().default(ShortId32.generate, 'Generate short id 32'),
  email: Joi.string().required().email().trim().default(toLower, 'Make lower case'),
  username: Joi.string().required().alphanum().min(2).max(20).trim().default(toLower, 'Make lower case'),
  password: Joi.string().required().regex(/[a-zA-Z0-9]{3,30}/),
  location: Joi.string().optional().allow('').trim(),
  isAdmin: Joi.boolean().default(false),
  authToken: Joi.string().default(ShortId.generate, 'Generate short id'),
  resetPassword: Joi.object().keys({
    token: Joi.string().required(),
    expires: Joi.date().required()
  }),
  created: Joi.date().raw().default(Date.now, 'Registered'),
  updated: Joi.date().raw(),
  deleted: Joi.date().raw()
});

User.indexes = [
  [{ email: 1 }, { unique: true }],
  [{ username: 1 }, { unique: true }],
  [{ authToken: 1 }, { unique: false }],
  [{ created: 1}, { unique: false }]
];

User.findByCredentials = function (username, password, done) {
  let query = {};

  if (username.indexOf('@') > -1) {
    query.email = username.toLowerCase();
  } else {
    query.username = username.toLowerCase();
  }

  User.findOne(query, done);
};

User.findByEmail = function (email, done) {
  let query = { email: email.toLowerCase() };
  User.findOne(query, done);
};

User.findByToken = function (token, done) {
  let query = { authToken: token };
  User.findOne(query, done);
};

User.findByUsername = function (username, done) {
  let query = { username: username.toLowerCase() };
  User.findOne(query, done);
};

User.hashPassword = function (password, done) {
  Bcrypt.genSalt(SALT_WORK_FACTOR, (err, salt) => {
    if (err) return done(err);

    Bcrypt.hash(password, salt, (err, hashedPassword) => {
      if (err) return done(err);
      done(null, hashedPassword);
    });
  });
};

User.isExisting = function (email, username, done) {
  let tasks = [];
  if (email.indexOf('@') === -1) {
    done = username;
    username = email;
    email = null;
  }

  if (email) tasks.push(User.findByEmail.bind(this, email));
  tasks.push(User.findByUsername.bind(this, username));

  Parallel(tasks, (err, results) => {
    if (err) return done(err);
    if (results[0] || results[1]) return done(null, results[0] || results[1]);
    done(null, false);
  });
};

User.isPasswordMatch = function (password, hashedPassword, done) {
  Bcrypt.compare(password, hashedPassword, done);
};

module.exports = User;
