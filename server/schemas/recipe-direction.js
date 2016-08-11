const Joi = require('joi')

exports.recipeDirection= Joi.object({
  id: Joi.number().integer(),
  recipe_id: Joi.number().integer(),
  direction_id: Joi.number().integer(),
  order: Joi.number().integer().required()
})

exports.general = Joi.alternatives().try(
  exports.recipeDirection,
  Joi.array().items(exports.recipeDirection)
)
