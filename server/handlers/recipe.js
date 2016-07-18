const Logger = require('franston')('server:handlers:recipe')

const CookbookModel = require('../models/cookbook')
const Errors = require('../utils/errors')
const RecipeModel = require('../models/recipe')
const UserModel = require('../models/user')

const Cookbook = new CookbookModel()
const Recipe = new RecipeModel()
const User = new UserModel()

exports.allByUser = function (request, reply) {
  Logger.debug('recipe.allByUser')

  let isLoaded = false

  if (request.query && request.query.full) isLoaded = true

  User.findById(request.params.id, (err) => {
    if (err) return Logger.error(err), reply(Errors.get(err))

    Recipe.findByUserId(request.params.id, isLoaded, (err, recipes) => {
      if (err) return Logger.error(err), reply(Errors.get(err))
      return Logger.debug(recipes), reply.treeize(recipes).code(200)
    })
  })
}

exports.allByCookbook = function (request, reply) {
  Logger.debug('recipe.allByCookbook')

  let isLoaded = false

  if (request.query && request.query.full) isLoaded = true

  Cookbook.findById(request.params.id, (err) => {
    if (err) return Logger.error(err), reply(Errors.get(err))

    Recipe.findByCookbookId(request.params.id, isLoaded, (err, recipes) => {
      if (err) return Logger.error(err), reply(Errors.get(err))
      return Logger.debug(recipes), reply.treeize(recipes).code(200)
    })
  })
}

exports.create = function (request, reply) {
  Logger.debug('recipe.create')

  request.payload.user_id = request.auth.credentials.user

  Recipe.create(request.payload, request.params.id, (err, id) => {
    if (err) return Logger.error(err), reply(Errors.get(err))
      console.log(id)
    return Logger.debug({ id }), reply({ id }).code(201)
  })
}

exports.delete = function (request, reply) {
  Logger.debug('recipe.delete')

  Recipe.deleteById(request.params.id, (err) => {
    if (err) return Logger.error(err), reply(Errors.get(err))
    return reply().code(204)
  })
}

exports.get = function (request, reply) {
  Logger.debug('recipe.get')

  Recipe.findById(request.params.id, (err, recipe) => {
    if (err) return Logger.error(err), reply(Errors.get(err))
    return Logger.debug(recipe), reply(recipe).code(200)
  })
}

exports.update = function (request, reply) {
  //
}
