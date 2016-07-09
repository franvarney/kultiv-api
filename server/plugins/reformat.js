const Boom = require('boom')
const Joi = require('joi')
const Logger = require('franston')('server:plugins:reformat')

const Errors = require('../utils/errors')

function validate(data, schema) {
  Joi.validate(data, schema, (err, payload) => {
    if (err) {
      Logger.error(err)
      return this.response(Errors.get(['badImplementation', 'Reformat Error']))
    }
    return this.response(payload)
  })
}

exports.register = function (server, defaults, next) {
  server.decorate('reply', 'reformat', function (data, schema) {
    return validate.call(this, data, schema)
  })

  return next()
}

exports.register.attributes = {
  name: 'reformat'
}
