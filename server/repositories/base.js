'use strict';

const Joi = require('joi');

const DB = require('../connections/postgres');

class Base {
  constructor(type, schema) {
    this.type = type;
    this.schema = schema;
    this.db = DB(this.type);
  }

  findById(id, done){
    this.db
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

      this.db
        .where({
          id: id,
          deleted_at: null
        })
        .update('deleted_at', 'now()')
        .then((count) => done(null, count))
        .catch((err) => done(err));
    });
  }

  add(payload, done) {
    this.validate(payload, (err, validated) => {
      this.db
        .insert(validated)
        .returning('id')
        .then((id) => done(null, id))
        .catch((err) => done(err));
    });
  }

  validate(payload, done) {
    Joi.validate(payload, this.schema, done);
  }
}

module.exports = Base;
