const Logger = require('franston')('handlers:directions')

const Errors = require('../utils/errors')
const DirectionModel = require('../models/direction')

exports.create = function (request, reply) {
  Logger.debug('directions.create')

  const Direction = new DirectionModel({ payload: request.payload })

  let create = Function.prototype

  if (Array.isArray(request.payload)) create = Direction.batchFindOrCreate.bind(Direction)
  else create = Direction.findOrCreate.bind(Direction)

  create((err, created) => {
    if (err) return Logger.error(err), reply(Errors.get(err))

    let output = {}

    if (Array.isArray(created)) output = { ids: created }
    else output = { id: created }

    return Logger.debug(output), reply(output).code(201)
  })
}

exports.get = function (request, reply) {
  Logger.debug('directions.get')

  const Direction = new DirectionModel({
    payload: { id: request.params.id }
  })

  Direction.findById(false, (err, direction) => {
    if (err) return Logger.error(err), reply(Errors.get(err))
    return Logger.debug(direction), reply(direction).code(200)
  })
}
