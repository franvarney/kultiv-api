const Boom = require('boom')
const Logger = require('franston')('server:utils:errors')

exports.get = function (error) {
  if (Array.isArray(error)) {
    let type = error[0]
    let message = error[1]
    return Boom[type](message)
  }

  if (error.message) error = error.message
  return Boom.badRequest(error)
}

exports.validate = function (request, reply, source, error) {
  error = exports.get(error)
  if (error) return Logger.error(error), reply(error)
  return reply.continue()
}
