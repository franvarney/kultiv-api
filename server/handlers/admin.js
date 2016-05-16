const Logger = require('franston')('server:handlers:admin')

const DB = require('../connections/postgres')

exports.users = function (request, reply) {
  Logger.debug('admin.users')

  DB('users')
    .asCallback((err, users) => {
      if (err) return Logger.error(err), reply(err)
      return reply(users)
    })
}
