const Joi = require('joi')
const Logger = require('franston')('server:handlers:user')

const Errors = require('../utils/errors')
const User = require('../models/user')
const UserSchema = require('../schemas/user')

exports.create = function (request, reply) {
  Logger.debug('users.create')

  User
    .set(request.payload)
    .create((err, id) => {
      if (err) return Logger.error(err), reply(Errors.get(err))
      return Logger.debug({ id }), reply({ id }).code(201)
    })
}

exports.delete = function (request, reply) {
  Logger.debug('users.delete')

  User
    .set({ id: request.params.id })
    .deleteById((err) => {
      if (err) return Logger.error(err), reply(Errors.get(err))
      return reply().code(204)
    })
}

exports.get = function (request, reply) {
  Logger.debug('users.get')

  User
    .set({ id: request.params.id })
    .findById((err, user) => {
      if (err) return Logger.error(err), reply(Errors.get(err))

      Joi.validate(user, UserSchema.sanitize, (err, sanitized) => {
        if (err) return Logger.error(err), reply(Errors.get(err))
        return Logger.debug(sanitized), reply(sanitized).code(200)
      })
    })
}

exports.update = function (request, reply) {
  Logger.debug('users.update')

  User
    .set(Object.assign({}, { id: request.params.id }, request.payload))
    .update((err) => {
      if (err) return Logger.error(err), reply(Errors.get(err))
      return reply().code(204)
    })
}
