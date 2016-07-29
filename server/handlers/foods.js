const Logger = require('franston')('handlers:foods')

const Errors = require('../utils/errors')
const FoodModel = require('../models/food')

exports.create = function (request, reply) {
  Logger.debug('foods.create')

  const Food = new FoodModel({ payload: request.payload })

  let create = Function.prototype

  if (Array.isArray(request.payload)) create = Food.batchFindOrCreate.bind(Food)
  else create = Food.findOrCreate.bind(Food)

  create((err, created) => {
    if (err) return Logger.error(err), reply(Errors.get(err))

    let output = {}

    if (Array.isArray(created)) output = { ids: created }
    else output = { id: created }

    return Logger.debug(output), reply(output).code(201)
  })
}

exports.get = function (request, reply) {
  Logger.debug('foods.get')

  const Food = new FoodModel({
    payload: { id: request.params.id }
  })

  Food.findById(false, (err, food) => {
    if (err) return Logger.error(err), reply(Errors.get(err))
    return Logger.debug(food), reply(food).code(200)
  })
}
