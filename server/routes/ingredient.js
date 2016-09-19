const Errors = require('../utils/errors')
const Ingredients = require('../handlers/ingredients')
const IngredientSchema = require('../schemas/ingredient')

module.exports = [
  {
    method: 'POST',
    path: '/ingredients',
    config: {
      handler: Ingredients.create,
      validate: {
        payload: IngredientSchema.createPayload,
        failAction: Errors.validate,
        options: { stripUnknown: true }
      }
    }
  },
  {
    method: 'GET',
    path: '/ingredients/{id}',
    handler: Ingredients.get
  }
]
