const Joi = require('joi')

exports.general = Joi.object({
  recipe_id: Joi.number().integer(),
  cookbook_id: Joi.number().integer()
})
