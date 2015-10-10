const BaseModel = require('hapi-mongo-models').BaseModel;
const Bcrypt = require('bcrypt');
// const Debug = require('debug')('chillchat_api:lib_model_user');
const Joi = require('joi');
const ObjectAssign = require('object-assign');
const Parallel = require('run-parallel');
const ShortId = require('shortid');
const ShortId32 = require('shortid32');

const SALT_WORK_FACTOR = 10;
ShortId32.characters('23456789abcdefghjklmnpqrstuvwxyz');

var User = BaseModel.extend({
  constructor: function (attrs) {
    ObjectAssign(this, attrs);
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
  created: Joi.date().default(Date.now, 'Registered'),
  updated: Joi.date().raw(),
  deleted: Joi.date().raw()
});

User.indexes = [
  [{ email: 1 }, { unique: true }],
  [{ username: 1 }, { unique: true }],
  [{ authToke: 1 }, { unique: true }],
  [{ created: 1}, { unique: false }]
];

User.findByCredentials = function (username, password, done) {
  var query = {};

  if (username.indexOf('@') > -1) {
    query.email = username.toLowerCase();
  } else {
    query.username = username.toLowerCase();
  }

  User.findOne(query, done);
};

User.findByEmail = function (email, done) {
  var query = { email: email.toLowerCase() };
  User.findOne(query, done);
};

User.findByToken = function (token, done) {
  var query = { authToken: token };
  User.findOne(query, done);
};

User.findByUsername = function (username, done) {
  var query = { username: username.toLowerCase() };
  User.findOne(query, done);
};

User.hashPassword = function (password, done) {
  Bcrypt.genSalt(SALT_WORK_FACTOR, function (err, salt) {
    if (err) return done(err);

    Bcrypt.hash(password, salt, function (err, hashedPassword) {
      if (err) return done(err);
      done(null, hashedPassword);
    });
  });
};

User.isExisting = function (email, username, done) {
  var tasks = [];
  if (email.indexOf('@') === -1) {
    done = username;
    username = email;
    email = null;
  }

  if (email) tasks.push(User.findByEmail.bind(this, email));
  if (username) tasks.push(User.findByUsername.bind(this, username));

  Parallel(tasks, function (err, results) {
    if (err) return done(err);
    if (results[0] || results[1]) return done(null, results[0] || results[1]);
    done(null, false);
  });
};

User.isPasswordMatch = function (password, hashedPassword, done) {
  Bcrypt.compare(password, hashedPassword, done);
};

module.exports = User;
