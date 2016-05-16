const {badRequest} = require('boom')
const Logger = require('franston')('server:handlers:user')

const User = require('../models/user')

exports.create = function (request, reply) {
  Logger.debug('user.create')

  User.create(request.payload, (err, id) => {
    if (err) return Logger.error(err), reply(badRequest(err))
    return Logger.debug(id), reply(id).code(201)
  })
}

exports.delete = function (request, reply) {
  Logger.debug('user.delete')

  User.deleteById(request.params.id, (err) => {
    if (err) return Logger.error(err), reply(badRequest(err))
    return reply().code(204)
  })
}

exports.get = function (request, reply) {
  Logger.debug('user.get')

  User.findById(request.params.id, (err, user) => {
    if (err) return Logger.error(err), reply(badRequest(err))
    return Logger.debug(user), reply(user).code(200)
  })
}

exports.update = function (request, reply) {
  Logger.debug('user.update')

  User.update(request.params.id, request.payload, (err, id) => {
    if (err) return Logger.error(err), reply(badRequest(err))
    return Logger.debug(id), eply(id).code(200)
  })
}
