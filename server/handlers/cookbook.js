const Logger = require('franston')('server:handlers:cookbook')

const CookbookModel = require('../models/cookbook')
const Errors = require('../utils/errors')
const UserModel = require('../models/user')

exports.allByUser = function (request, reply) {
  Logger.debug('cookbooks.allByUser')

  const User = new UserModel({
    payload: { owner_id: request.params.id }
  })

  User.findById((err) => {
    if (err) return Logger.error(err), reply(Errors.get(err))

    const Cookbook = new CookbookModel({
      payload: { id: request.params.id }
    })

    Cookbook.findByOwner((err, cookbooks) => {
      if (err) return Logger.error(err), reply(Errors.get(err))
      return Logger.debug(cookbooks), reply.treeize(cookbooks).code(200)
    })
  })
}

exports.create = function (request, reply) {
  Logger.debug('cookbooks.create')

  request.payload.owner_id = request.auth.credentials.user

  const Cookbook = new CookbookModel({
    payload: request.payload
  })

  Cookbook.create((err, id) => {
    if (err) return Logger.error(err), reply(Errors.get(err))
    return Logger.debug({ id }), reply({ id }).code(201)
  })
}

exports.delete = function (request, reply) {
  Logger.debug('cookbooks.delete')

  const Cookbook = new CookbookModel({
    payload: { id: request.params.id }
  })

  Cookbook.deleteById((err) => {
    if (err) return Logger.error(err), reply(Errors.get(err))
    return reply().code(204)
  })
}

exports.get = function (request, reply) {
  Logger.debug('cookbooks.get')

  const Cookbook = new CookbookModel({
    payload: { id: request.params.id }
  })

  Cookbook.findById((err, cookbook) => {
    if (err) return Logger.error(err), reply(Errors.get(err))
    return Logger.debug(cookbook), reply(cookbook).code(200)
  })
}

exports.update = function (request, reply) {
  Logger.debug('cookbooks.update')

  const Cookbook = new CookbookModel({
    payload: Object.assign({}, { id: request.params.id }, request.payload)
  })

  Cookbook.update((err) => {
    if (err) return Logger.error(err), reply(Errors.get(err))
    return reply().code(204)
  })
}
