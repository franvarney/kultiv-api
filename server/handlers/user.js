const Boom = require('boom')
// const Debug = require('debug')('cookbook/src/controllers/user')

const User = require('../models/user')

exports.create = function (request, reply) {
  User.create(request.payload, (err, id) => {
    if (err) return reply(Boom.badRequest(err))
    return reply(id).code(201)
  })
}

exports.delete = function (request, reply) {
  User.deleteById(request.params.id, (err) => {
    if (err) return reply(Boom.badRequest(err))
    return reply().code(204)
  })
}

exports.get = function (request, reply) {
  User.findById(request.params.id, (err, user) => {
    if (err) return reply(Boom.badRequest(err))
    return reply(user).code(200)
  })
}

exports.update = function (request, reply) {
  User.update(request.params.id, request.payload, (err, id) => {
    if (err) return reply(Boom.badRequest(err))
    return reply(id).code(200)
  })
}
