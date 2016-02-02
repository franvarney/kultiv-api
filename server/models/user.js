const Knex = require('../connections/postgres');

exports.findById = function (id, done) {
  Knex('users').where({
    id: id,
    deleted_at: null
  })
  .then((user) => {
    if (user.length < 1) return done(null, false);
    return done(null, user[0]);
  })
  .catch((err) => done(err));
};
