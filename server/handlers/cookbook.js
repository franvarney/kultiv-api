const Logger = require('franston')('server:handlers:cookbook')

const CookbookModel = require('../models/cookbook')
const Errors = require('../utils/errors')
const UserModel = require('../models/user')

const Cookbook = new CookbookModel()
const User = new UserModel()

exports.allByUser = function (request, reply) {
  Logger.debug('cookbook.allByUser')

  User.findById(request.params.user_id, (err) => {
    if (err) return Logger.error(err), reply(Errors.get(err))

    Cookbook.findByOwner(request.params.user_id, (err, cookbooks) => {
      if (err) return Logger.error(err), reply(Errors.get(err))
      return Logger.debug(cookbooks), reply.treeize(cookbooks).code(200)
    })
  })
}

exports.create = function (request, reply) {
  Logger.debug('cookbook.create')

  Cookbook.create(request.payload, (err, id) => {
    if (err) return Logger.error(err), reply(Errors.get(err))
    return Logger.debug({ id }), reply({ id }).code(201)
  })
}

exports.delete = function (request, reply) {
  Logger.debug('cookbook.delete')

  Cookbook.deleteById(request.params.id, (err) => {
    if (err) return Logger.error(err), reply(Errors.get(err))
    return reply().code(204)
  })
}

exports.get = function (request, reply) {
  Logger.debug('cookbook.get')

  Cookbook.findById(request.params.id, (err, cookbook) => {
    if (err) return Logger.error(err), reply(Errors.get(err))
    return reply().code(204)
  })
}

exports.update = function (request, reply) {
  //
}
