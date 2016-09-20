const Bcrypt = require('bcryptjs')
const Joi = require('joi')
const Logger = require('franston')('server:handlers:user')

const Errors = require('../utils/errors')
const User = require('../models/user')
const UserSchema = require('../schemas/user')

exports.create = function (request, reply) {
  Logger.debug('users.create')

  User
    .set({
      email: request.payload.email,
      username: request.payload.username
    })
    .findByEmailOrUsername((err, user) => {
      if (err) return Logger.error(err), reply(Errors.get(err))
      if (user) {
        return Logger.debug(user), reply(Errors.get(['badRequest', 'Invalid username/email']))
      }

      User
        .set(request.payload)
        .create((err, id) => {
          if (err) return Logger.error(err), reply(Errors.get(err))
          return Logger.debug({ id }), reply({ id }).code(201)
        })
    })
}

exports.delete = function (request, reply) {
  Logger.debug('users.delete')

  User
    .set({ id: request.params.id })
    .findById((err) => {
      if (err) return Logger.error(err), reply(Errors.get(err))

      User
        .set({ id: request.params.id })
        .deleteById((err) => {
          if (err) return Logger.error(err), reply(Errors.get(err))
          return reply().code(204)
        })
    })
}

exports.get = function (request, reply) {
  Logger.debug('users.get')

  User
    .set({ id: request.params.id })
    .findById((err, user) => {
      if (err) return Logger.error(err), reply(Errors.get(err))
      return Logger.debug(user), reply(user).code(200)
    })
}

exports.update = function (request, reply) {
  Logger.debug('users.update')

  User
    .set({ id: request.params.id })
    .findById((err, found) => {
      if (err) return Logger.error(err), reply(Errors.get(err))
      if (!found) {
        return Logger.error('User Not Found'), reply(Errors.get(['badRequest', 'User Not Found']))
      }

      User
        .set({ email: request.payload.email })
        .findByEmailOrUsername((err, user) => {
          if (err) return Logger.error(err), reply(Errors.get(err))
          if (user && user.id !== Number(request.params.id)) {
            return Logger.debug(user), reply(Errors.get(['badRequest', 'Invalid email']))
          }

          User
            .set(Object.assign({ id: request.params.id }, request.payload))
            .update((err) => {
              if (err) return Logger.error(err), reply(Errors.get(err))
              return reply().code(204)
            })
        })
    })
}
