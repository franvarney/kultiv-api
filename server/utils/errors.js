const Boom = require('boom')

exports.get = function (error) {
  if (Array.isArray(error)) {
    let type = error[0]
    let message = error[1]
    return Boom[type](message)
  }

  return Boom.badRequest(error)
}
