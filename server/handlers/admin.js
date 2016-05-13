const DB = require('../connections/postgres')

exports.users = function (request, reply) {
  DB('users')
    .asCallback((err, users) => {
      if (err) return reply(err)
      return reply(users)
    })
}
