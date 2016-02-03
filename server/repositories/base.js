'use strict';

const Joi = require('joi');

const DB = require('../connections/postgres');

class Base {
  constructor(type, schema) {
    this.type = type;
    this.schema = schema;
  }

  findById(id, done) {
    DB(this.type)
      .where({
        id: id,
        deleted_at: null
      })
      .limit(1)
      .then((result) => {
        if (result.length < 1) return done(null, false);
        return done(null, result);
      })
      .catch((err) => done(err));
  }

  deleteById(id, done) {
    this.findById(id, (err, result) => {
      if (err) return done(err);
      if (!result) return done(null, false);

      DB(this.type)
        .where({
          id: id,
          deleted_at: null
        })
        .update('deleted_at', 'now()')
        .then((count) => done(null, count))
        .catch((err) => done(err));
    });
  }

  validate(payload, done) {
    Joi.validate(payload, this.schema, (err, validated) => {
      if (err) return done(err);
      done(null, validated);
    });
  }
}

module.exports = new Base();
