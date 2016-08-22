const Logger = require('franston')('handlers:foods')

const Errors = require('../utils/errors')
const Food = require('../models/food')

exports.create = function (request, reply) {
  Logger.debug('foods.create')

  let create = Function.prototype

  if (Array.isArray(request.payload)) {
    create = Food
              .set(request.payload)
              .batchFindOrCreate.bind(Food)
  } else {
    create = Food
              .set(request.payload)
              .findOrCreate.bind(Food)
  }

  create((err, created) => {
    if (err) return Logger.error(err), reply(Errors.get(err))

    let output = {}

    if (Array.isArray(created)) output = created.map((id) => ({ id }))
    else output = { id: created }

    return Logger.debug(output), reply(output).code(201)
  })
}

exports.get = function (request, reply) {
  Logger.debug('foods.get')

  Food
    .set({ id: request.params.id })
    .findById(false, (err, food) => {
      if (err) return Logger.error(err), reply(Errors.get(err))
      return Logger.debug(food), reply(food).code(200)
    })
}
