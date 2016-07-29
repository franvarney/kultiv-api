const Joi = require('joi')

exports.direction = Joi.object({
  direction: Joi.string().required()
})
  .options({ stripUnknown: true })

exports.createPayload = Joi.alternatives().try(
  exports.direction,
  Joi.array().items(exports.direction)
)
