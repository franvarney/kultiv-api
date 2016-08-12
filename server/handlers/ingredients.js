const Logger = require('franston')('handlers:ingredients')

const Errors = require('../utils/errors')
const IngredientModel = require('../models/ingredient')

exports.create = function (request, reply) {
  Logger.debug('ingredients.create')

  const Ingredient = new IngredientModel({ payload: request.payload })

  let create = Function.prototype

  if (Array.isArray(request.payload)) create = Ingredient.batchFindOrCreate.bind(Ingredient)
  else create = Ingredient.findOrCreate.bind(Ingredient)

  create((err, created) => {
    if (err) return Logger.error(err), reply(Errors.get(err))

    let output

    if (Array.isArray(created)) {
      output = created.map((id) => ({ id }))
    } else output = { id: created }

    return Logger.debug(output), reply(output).code(201)
  })
}

exports.get = function (request, reply) {
  Logger.debug('ingredients.get')

  const Ingredient = new IngredientModel({
    payload: { id: request.params.id }
  })

  Ingredient.findById(false, (err, ingredient) => {
    if (err) return Logger.error(err), reply(Errors.get(err))
    return Logger.debug(ingredient), reply(ingredient).code(200)
  })
}
