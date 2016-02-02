'use strict';

const Knex = require('../connections/postgres');

class User {
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
};

module.exports = new User();
