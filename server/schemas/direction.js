const Joi = require('joi')

exports.direction = Joi.object({
  direction: Joi.string().required()
})
  .options({ stripUnknown: true })

exports.general = Joi.alternatives().try(
  exports.direction,
  Joi.array().items(exports.direction)
)

exports.createPayload = Joi.alternatives().try(
  exports.direction,
  Joi.array().items(exports.direction)
)
