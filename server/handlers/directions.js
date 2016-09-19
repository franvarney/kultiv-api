const Logger = require('franston')('handlers:directions')

const Direction = require('../models/direction')
const Errors = require('../utils/errors')

exports.create = function (request, reply) {
  Logger.debug('directions.create')

  let create = Function.prototype

  if (Array.isArray(request.payload)) {
    create = Direction
              .set(request.payload)
              .batchFindOrCreate.bind(Direction)
  } else {
    create = Direction
              .set(request.payload)
              .findOrCreate.bind(Direction)
  }

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

  Direction
    .set({ id: request.params.id })
    .findById(false, (err, direction) => {
      if (err) return Logger.error(err), reply(Errors.get(err))
      return Logger.debug(direction), reply(direction).code(200)
    })
}
