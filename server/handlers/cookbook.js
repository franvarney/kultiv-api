const {badRequest} = require('boom')
// const Debug = require('debug')('cookbook/src/controllers/cookbook')

const Cookbook = require('../models/cookbook')

exports.allByUser = function (request, reply) {
  Cookbook.findByOwner(request.params.user_id, (err, cookbooks) => {
    if (err) return reply(badRequest(err))
    reply(cookbooks).code(200)
  })
}

exports.create = function (request, reply) {
  Cookbook.create(request.payload, (err, id) => {
    if (err) return reply(badRequest(err))
    return reply(id).code(201)
  })
}

exports.delete = function (request, reply) {
  Cookbook.deleteById(request.params.id, (err) => {
    if (err) return reply(badRequest(err))
    return reply().code(204)
  })
}

exports.get = function (request, reply) {
  Cookbook.findById(request.params.id, (err, cookbook) => {
    if (err) return reply(badRequest(err))
    return reply(cookbook).code(200)
  })
}

exports.update = function (request, reply) {
  //
}
