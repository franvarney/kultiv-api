const Directions = require('./handlers/directions')
const DirectionSchema = require('../schemas/direction')
const Errors = require('../utils/errors')

module.exports = [
  {
    method: 'POST',
    path: '/directions',
    config: {
      handler: Directions.create,
      validate: {
        payload: DirectionSchema.createPayload,
        failAction: Errors.validate,
        options: { stripUnknown: true }
      }
    }
  },
  {
    method: 'GET',
    path: '/directions/{id}',
    handler: Directions.get
  }
]
