const Logger = require('franston')('handlers:units')

const Errors = require('../utils/errors')
const Unit = require('../models/unit')

exports.create = function (request, reply) {
  Logger.debug('units.create')

  let create = Function.prototype

  if (Array.isArray(request.payload)) {
    create = Unit
              .set(request.payload)
              .batchFindOrCreate.bind(Unit)
  } else {
    create = Unit
              .set(request.payload)
              .findOrCreate.bind(Unit)
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
  Logger.debug('units.get')

  Unit
    .set({ id: request.params.id })
    .findById(false, (err, unit) => {
      if (err) return Logger.error(err), reply(Errors.get(err))
      return Logger.debug(unit), reply(unit).code(200)
    })
}
