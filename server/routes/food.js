const Errors = require('../utils/errors')
const Foods = require('../handlers/foods')
const FoodSchema = require('../schemas/food')

module.exports = [
  {
    method: 'POST',
    path: '/foods',
    config: {
      handler: Foods.create,
      validate: {
        payload: FoodSchema.createPayload,
        failAction: Errors.validate,
        options: { stripUnknown: true }
      }
    }
  },
  { method: 'GET', path: '/foods/{id}', handler: Foods.get }
]
