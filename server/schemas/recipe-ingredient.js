const Joi = require('joi')

exports.recipeIngredient = Joi.object({
  id: Joi.number().integer(),
  recipe_id: Joi.number().integer(),
  ingredient_id: Joi.number().integer()
})

exports.general = Joi.alternatives().try(
  exports.recipeIngredient,
  Joi.array().items(exports.recipeIngredient)
)
