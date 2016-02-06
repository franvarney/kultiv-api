'use strict';

const Bcrypt = require('bcryptjs');
const Uuid = require('uuid4');

const Base = require('./base');
const DB = require('../connections/postgres');
const UserModel = require('../models/user');

const SALT_WORK_FACTOR = 10;
const TABLE_NAME = 'users';

function hashPassword(password, done) {
  Bcrypt.genSalt(SALT_WORK_FACTOR, (err, salt) => {
    if (err) return done(err);

    Bcrypt.hash(password, salt, (err, hashed) => {
      if (err) return done(err);
      done(null, hashed);
    });
  });
}

class User extends Base {
  constructor() {
    super(TABLE_NAME, UserModel);
  }

  create(payload, done) {
    var email = payload.email, username = payload.username;

    this.findByEmailOrUsername(email, username, (err, user) => {
      if (err) return done(err);
      if (user.length > 0) return done(null, true);

      payload.auth_token = Uuid();
      hashPassword(payload.password, (err, hashed) => {
        if (err) return done(err);

        payload.password = hashed;
        this.add(payload, done);
      });
    });
  }

  findByEmailOrUsername(email, username, done) {
    this.db
      .where('email', email)
      .orWhere('username', username)
      .whereNull('deleted_at')
      .limit(1)
      .then((user) => {
        if (!user) return done(null, false);
        return done(null, user);
      })
      .catch((err) => done(err));
  }

  update() {
    //
  }
}

module.exports = new User();
