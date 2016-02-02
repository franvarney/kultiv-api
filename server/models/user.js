'use strict';

const Bcrypt = require('bcryptjs');
const Joi = require('joi');
const Uuid = require('uuid4');

const Knex = require('../connections/postgres');

const SALT_WORK_FACTOR = 10;

const schema = Joi.object().keys({
  username: Joi.string().alphanum().min(3).max(50).required(),
  email: Joi.string().email().required(),
  password: Joi.string().regex(/^[a-zA-Z0-9]{3,30}$/).required(),
  first_name: Joi.string().min(3).max(50),
  last_name: Joi.string().min(3).max(50),
  location: Joi.string().min(3).max(50),
  is_admin: Joi.boolean(),
  auth_token: [Joi.string(), Joi.number()],
  updated_at: Joi.string().default('now()'),
  deleted_at: Joi.string().allow('now()')
});

function hashPassword(password, done) {
  Bcrypt.genSalt(SALT_WORK_FACTOR, function (err, salt) {
    if (err) return done(err);

    Bcrypt.hash(password, salt, function (err, hashed) {
      if (err) return done(err);
      done(null, hashed);
    });
  });
};

class User {
  create(payload, done) {
    this.findByEmailOrUsername(payload.email, payload.username, (err, user) => {
      if (err) return done(err);
      if (user.length > 0) return done(null, true);

      payload.auth_token = Uuid();
      this.validate(payload, (err, validated) => {
        if (err) return done(err);

        hashPassword(validated.password, (err, hashed) => {
          if (err) return done(err);

          validated.password = hashed;
          Knex('users').insert(validated).returning('id')
          .then((id) => done(null, false, id[0]))
          .catch((err) => done(err));
        });
      });
    });
  }

  findById(id, done) {
    Knex('users').where({
      id: id,
      deleted_at: null
    })
    .then((user) => {
      if (user.length < 1) return done(null, false);
      return done(null, user[0]);
    })
    .catch((err) => done(err));
  }

  findByEmailOrUsername(email, username, done) {
    Knex('users')
    .where('email', email)
    .orWhere('username', username)
    .andWhere('deleted_at', null)
    .limit(1)
    .then((user) => {
      if (!user) return done(null, false);
      return done(null, user);
    })
    .catch((err) => done(err));
  }

  deleteById(id, done) {
    this.findById(id, (err, user) => {
      if (err) return done(err);
      if (!user) return done(null, false);

      Knex('users').where({
        id: id,
        deleted_at: null
      })
      .update('deleted_at', 'now()')
      .then((count) => done(null, count))
      .catch((err) => done(err));
    });
  }

  validate(payload, done) {
    Joi.validate(payload, schema, (err, validated) => {
      if (err) return done(err);
      done(null, validated);
    });
  }
};

module.exports = new User();
