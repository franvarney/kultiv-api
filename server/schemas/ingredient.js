const Joi = require('joi')

exports.ingredient = Joi.object({
  amount: Joi.number(),
  unit_id: Joi.number().integer(),
  food_id: Joi.number().integer().required(),
  optional: Joi.boolean().default(false)
})

exports.general = Joi.alternatives().try(
  exports.ingredient,
  Joi.array().items(exports.ingredient)
)

exports.createPayload = Joi.alternatives().try(
  exports.ingredient,
  Joi.array().items(exports.ingredient)
)
