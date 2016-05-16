const {badRequest} = require('boom')
const Logger = require('franston')('server:handlers:recipe')

const Recipe = require('../models/recipe')

exports.allByUser = function (request, reply) {
  Logger.debug('recipe.allByUser')

  let isLoaded = false

  if (request.query && request.query.full) isLoaded = true

  Recipe.findByUserId(request.params.id, isLoaded, (err, recipes) => {
    if (err) return Logger.error(err), reply(badRequest(err))
    return Logger.debug(recipes), reply(recipes).code(200)
  })
}

exports.create = function (request, reply) {
  Logger.debug('recipe.create')

  Recipe.create(request.payload, (err, id) => {
    if (err) return Logger.error(err), reply(badRequest(err))
    return Logger.debug(id), reply(id).code(201)
  })
}

exports.delete = function (request, reply) {
  Logger.debug('recipe.delete')

  Recipe.deleteById(request.params.id, (err) => {
    if (err) return Logger.error(err), reply(badRequest(err))
    return reply().code(204)
  })
}

exports.get = function (request, reply) {
  Logger.debug('recipe.get')

  Recipe.findById(request.params.id, (err, recipe) => {
    if (err) return Logger.error(err), reply(badRequest(err))
    return Logger.debug(recipe), reply(recipe).code(200)
  })
}

exports.update = function (request, reply) {
  //
}
