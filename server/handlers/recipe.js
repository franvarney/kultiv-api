const Logger = require('franston')('server:handlers:recipe')

const Cookbook = require('../models/cookbook')
const Errors = require('../utils/errors')
const Recipe = require('../models/recipe')
const User = require('../models/user')

exports.allByUser = function (request, reply) {
  Logger.debug('recipes.allByUser')

  let isLoaded = false

  if (request.query && request.query.full) isLoaded = true

  User
    .set({ id: request.params.id })
    .findById((err) => {
      if (err) return Logger.error(err), reply(Errors.get(err))

      Recipe
        .set({ id: request.params.id })
        .findByUserId(isLoaded, (err, recipes) => {
          if (err) return Logger.error(err), reply(Errors.get(err))
          return Logger.debug(recipes), reply.treeize(recipes).code(200)
        })
    })
}

exports.allByCookbook = function (request, reply) {
  Logger.debug('recipes.allByCookbook')

  let isLoaded = false

  if (request.query && request.query.full) isLoaded = true

  Cookbook
    .set({ id: request.params.id })
    .findById(request.params.id, (err) => {
      if (err) return Logger.error(err), reply(Errors.get(err))

      Recipe
        .set({ id: request.params.id })
        .findByCookbookId(request.params.id, isLoaded, (err, recipes) => {
          if (err) return Logger.error(err), reply(Errors.get(err))
          return Logger.debug(recipes), reply.treeize(recipes).code(200)
        })
    })
}

exports.create = function (request, reply) {
  Logger.debug('recipes.create')

  request.payload.user_id = request.auth.credentials.user

  Recipe
    .set(request.payload)
    .create((err, id) => {
      if (err) return Logger.error(err), reply(Errors.get(err))
      return Logger.debug({ id }), reply({ id }).code(201)
    })
}

exports.delete = function (request, reply) {
  Logger.debug('recipes.delete')

  Recipe
    .set({ id: request.params.id })
    .deleteById((err) => {
      if (err) return Logger.error(err), reply(Errors.get(err))
      return reply().code(204)
    })
}

exports.get = function (request, reply) {
  Logger.debug('recipes.get')

  Recipe
    .set({ id: request.params.id })
    .findById((err, recipe) => {
      if (err) return Logger.error(err), reply(Errors.get(err))
      return Logger.debug(recipe), reply(recipe).code(200)
    })
}

exports.update = function (request, reply) {
  //
}
