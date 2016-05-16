const {badRequest} = require('boom')
const Logger = require('franston')('server:handlers:cookbook')

const Cookbook = require('../models/cookbook')

exports.allByUser = function (request, reply) {
  Logger.debug('cookbook.allByUser')

  Cookbook.findByOwner(request.params.user_id, (err, cookbooks) => {
    if (err) return Logger.error(err), reply(badRequest(err))
    return Logger.debug(cookbooks), reply(cookbooks).code(200)
  })
}

exports.create = function (request, reply) {
  Logger.debug('cookbook.create')

  Cookbook.create(request.payload, (err, id) => {
    if (err) return Logger.error(err), reply(badRequest(err))
    return Logger.debug(id), reply(id).code(201)
  })
}

exports.delete = function (request, reply) {
  Logger.debug('cookbook.delete')

  Cookbook.deleteById(request.params.id, (err) => {
    if (err) return Logger.error(err), reply(badRequest(err))
    return reply().code(204)
  })
}

exports.get = function (request, reply) {
  Logger.debug('cookbook.get')

  Cookbook.findById(request.params.id, (err, cookbook) => {
    if (err) return Logger.error(err), reply(badRequest(err))
    return Logger.debug(cookbook), eply(cookbook).code(200)
  })
}

exports.update = function (request, reply) {
  //
}
