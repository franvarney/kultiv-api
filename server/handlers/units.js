const Logger = require('franston')('handlers:units')

const Errors = require('../utils/errors')
const UnitModel = require('../models/unit')

exports.create = function (request, reply) {
  Logger.debug('units.create')

  const Unit = new UnitModel({ payload: request.payload })

  let create = Function.prototype

  if (Array.isArray(request.payload)) create = Unit.batchFindOrCreate.bind(Unit)
  else create = Unit.findOrCreate.bind(Unit)

  create((err, created) => {
    if (err) return Logger.error(err), reply(Errors.get(err))

    let output = {}

    if (Array.isArray(created)) output = { ids: created }
    else output = { id: created }

    return Logger.debug(output), reply(output).code(201)
  })
}

exports.get = function (request, reply) {
  Logger.debug('units.get')

  const Unit = new UnitModel({
    payload: { id: request.params.id }
  })

  Unit.findById(false, (err, food) => {
    if (err) return Logger.error(err), reply(Errors.get(err))
    return Logger.debug(food), reply(food).code(200)
  })
}
