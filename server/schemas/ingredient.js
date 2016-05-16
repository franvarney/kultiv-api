const Joi = require('joi')

const IngredientModel = Joi.object().keys({
  amount: Joi.number(),
  unit_id: Joi.number().integer().required(),
  food_id: Joi.number().integer().required(),
  optional: Joi.boolean(),
  updated_at: Joi.string().default('now()'),
  deleted_at: Joi.string().allow('now()')
})

module.exports = IngredientModel
