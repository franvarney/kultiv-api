const Logger = require('franston')('server:handlers:cookbook')

const Cookbook = require('../models/cookbook')
const Errors = require('../utils/errors')
const User = require('../models/user')

exports.allByUser = function (request, reply) {
  Logger.debug('cookbooks.allByUser')

  User
    .set({ id: request.params.id })
    .findById((err) => {
      if (err) return Logger.error(err), reply(Errors.get(err))

      Cookbook
        .set({ owner_id: request.params.id })
        .findByOwner((err, cookbooks) => {
          if (err) return Logger.error(err), reply(Errors.get(err))
          return Logger.debug(cookbooks), reply.treeize(cookbooks).code(200)
        })
    })
}

exports.create = function (request, reply) {
  Logger.debug('cookbooks.create')

  request.payload.owner_id = request.auth.credentials.user

  Cookbook
    .set(request.payload)
    .create((err, id) => {
      if (err) return Logger.error(err), reply(Errors.get(err))
      return Logger.debug({ id }), reply({ id }).code(201)
    })
}

exports.delete = function (request, reply) {
  Logger.debug('cookbooks.delete')

  Cookbook
    .set({ id: request.params.id })
    .findById((err) => {
      if (err) return Logger.error(err), reply(Errors.get(err))

      Cookbook
        .set({ id: request.params.id })
        .deleteById((err) => {
          if (err) return Logger.error(err), reply(Errors.get(err))
          return reply().code(204)
        })
    })
}

exports.get = function (request, reply) {
  Logger.debug('cookbooks.get')

  Cookbook
    .set({ id: request.params.id })
    .findById((err, cookbook) => {
      if (err) return Logger.error(err), reply(Errors.get(err))

      User
        .set({ id: cookbook.owner_id })
        .setSelect('users.id AS creator:id', 'users.username AS users:username')
        .findById((err, user) => {
          if (err) return this._errors(err, done)

          delete cookbook.owner_id
          cookbook = Object.assign(cookbook, user)

          Logger.debug(cookbook)
          return reply.treeize(cookbook, { singleResult: true }).code(200)
        })
    })
}

exports.update = function (request, reply) {
  Logger.debug('cookbooks.update')

  Cookbook
    .set(Object.assign({}, { id: request.params.id }, request.payload))
    .update((err) => {
      if (err) return Logger.error(err), reply(Errors.get(err))
      return reply().code(204)
    })
}
