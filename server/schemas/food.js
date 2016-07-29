const Joi = require('joi')

exports.food = Joi.object({
  id: Joi.number().integer(),
  name: Joi.string().required()
})

exports.general = Joi.alternatives().try(
  exports.food,
  Joi.array().items(exports.food)
)

exports.createPayload = Joi.alternatives().try(
  exports.food,
  Joi.array().items(exports.food)
)
