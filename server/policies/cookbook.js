const Boom = require('boom')
const Logger = require('franston')('server:policies:cookbook')

const Cookbook = require('../models/cookbook')
const Errors = require('../utils/errors')

exports.authorizeUser = function (request, reply) {
  Logger.debug('cookbook.authorizeUser')

  Cookbook
    .set({ id: request.params.id })
    .findById((err, cookbook) => {
      if (err) return Logger.error(err), reply(Boom.badRequest()) // TODO is this the right error?

      if (cookbook.owner_id === request.auth.credentials.user ||
          request.auth.credentials.scope.indexOf('admin') >= 0) {
        return reply(cookbook.owner_id)
      }

      return reply(Boom.unauthorized())
    })
}
