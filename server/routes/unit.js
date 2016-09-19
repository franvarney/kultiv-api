const Errors = require('../utils/errors')
const Units = require('../handlers/units')
const UnitSchema = require('../schemas/unit')

module.exports = [
  {
    method: 'POST',
    path: '/units',
    config: {
      validate: {
        payload: UnitSchema.createPayload,
        failAction: Errors.validate,
        options: { stripUnknown: true }
      },
      handler: Units.create
    }
  },
  {
    method: 'GET',
    path: '/units/{id}',
    handler: Units.get
  }
]
