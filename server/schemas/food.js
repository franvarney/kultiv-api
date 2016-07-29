const Joi = require('joi')

exports.food = Joi.object({
  id: Joi.number().integer(),
  name: Joi.string().required()
})
  .options({ stripUnknown: true })

exports.general = Joi.alternatives().try(
  exports.food,
  Joi.array().items(exports.food)
)

exports.createPayload = Joi.alternatives().try(
  exports.food,
  Joi.array().items(exports.food)
)
