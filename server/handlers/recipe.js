const Logger = require('franston')('server:handlers:recipe')

const CookbookModel = require('../models/cookbook')
const Errors = require('../utils/errors')
const RecipeModel = require('../models/recipe')
const UserModel = require('../models/user')

exports.allByUser = function (request, reply) {
  Logger.debug('recipes.allByUser')

  let isLoaded = false

  if (request.query && request.query.full) isLoaded = true

  const User = new UserModel({ payload: { id: request.params.id }})

  User.findById((err) => {
    if (err) return Logger.error(err), reply(Errors.get(err))

    const Recipe = new RecipeModel({ payload: { id: request.params.id }})

    Recipe.findByUserId(isLoaded, (err, recipes) => {
      if (err) return Logger.error(err), reply(Errors.get(err))
      return Logger.debug(recipes), reply.treeize(recipes).code(200)
    })
  })
}

exports.allByCookbook = function (request, reply) {
  Logger.debug('recipes.allByCookbook')

  let isLoaded = false

  if (request.query && request.query.full) isLoaded = true

  const Cookbook = new CookbookModel({ payload: { id: request.params.id }})

  Cookbook.findById(request.params.id, (err) => {
    if (err) return Logger.error(err), reply(Errors.get(err))

    const Recipe = new RecipeModel({ payload: { id: request.params.id }})

    Recipe.findByCookbookId(request.params.id, isLoaded, (err, recipes) => {
      if (err) return Logger.error(err), reply(Errors.get(err))
      return Logger.debug(recipes), reply.treeize(recipes).code(200)
    })
  })
}

exports.create = function (request, reply) {
  Logger.debug('recipes.create')

  request.payload.user_id = request.auth.credentials.user

  const Recipe = new RecipeModel({ payload: request.payload })

  Recipe.create((err, id) => {
    if (err) return Logger.error(err), reply(Errors.get(err))
    return Logger.debug({ id }), reply({ id }).code(201)
  })
}

exports.delete = function (request, reply) {
  Logger.debug('recipes.delete')

  const Recipe = new RecipeModel({ payload: { id: request.params.id }})

  Recipe.deleteById((err) => {
    if (err) return Logger.error(err), reply(Errors.get(err))
    return reply().code(204)
  })
}

exports.get = function (request, reply) {
  Logger.debug('recipes.get')

  const Recipe = new RecipeModel({ payload: { id: request.params.id }})

  Recipe.findById((err, recipe) => {
    if (err) return Logger.error(err), reply(Errors.get(err))
    return Logger.debug(recipe), reply(recipe).code(200)
  })
}

exports.update = function (request, reply) {
  //
}
