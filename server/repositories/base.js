'use strict';

const Joi = require('joi');

const DB = require('../connections/postgres');

class Base {
  constructor(name, schema) {
    this.name = name;
    this.schema = schema;
    this.knex = DB; // necessary for joins
    this.db = DB.from(this.name);
  }

  findById(id, done) {
    this.db
      .where('id', id)
      .whereNull('deleted_at')
      .first()
      .then((result) => {
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

  create(payload, done) {
    this.validate(payload, (err, validated) => {
      if (err) return done(err);

      this.db
        .insert(validated)
        .returning('id')
        .then((id) => done(null, id))
        .catch((err) => done(err));
    });
  }

  update(id, payload, done) {
    this.findById(id, (err, results) => {
      payload = Object.assign(results, payload);

      delete payload.id;
      delete payload.created_at;
      delete payload.updated_at;

      this.validate(payload, (err, validated) => {
        if (err) return done(err);

        this.db
          .update(validated)
          .returning('id')
          .then((id) => done(null, id))
          .catch((err) => done(err));
      });
    });
  }

  toggleIsPrivate(id, done) {
    this.findById(id, (err, result) => {
      if (err) return done(err);

      result
        .update('is_private', !result.is_private)
        .returning('id')
        .then((id) => done(null, true))
        .catch((err) => done(err));
    });
  }

  validate(payload, done) {
    Joi.validate(payload, this.schema, done);
  }
}

module.exports = Base;
