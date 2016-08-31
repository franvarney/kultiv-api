const Logger = require('franston')('handlers:ingredients')

const Errors = require('../utils/errors')
const Ingredient = require('../models/ingredient')

exports.create = function (request, reply) {
  Logger.debug('ingredients.create')

  let create = Ingredient.set(request.payload)

  if (Array.isArray(request.payload)) {
    create = create.batchFindOrCreate.bind(Ingredient)
  } else create = create.findOrCreate.bind(Ingredient)

  create((err, created) => {
    if (err) return Logger.error(err), reply(Errors.get(err))

    let output

    if (Array.isArray(created)) output = created.map((id) => ({ id }))
    else output = { id: created }

    return Logger.debug(output), reply(output).code(201)
  })
}

exports.get = function (request, reply) {
  Logger.debug('ingredients.get')

  Ingredient
    .set({ id: request.params.id })
    .findById(false, (err, ingredient) => {
      if (err) return Logger.error(err), reply(Errors.get(err))
      return Logger.debug(ingredient), reply(ingredient).code(200)
    })
}
