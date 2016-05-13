const DB = require('../connections/postgres')

exports.users = function (request, reply) {
  DB('users')
    .then((users) => reply(users))
    .catch((err) => reply(err))
}
