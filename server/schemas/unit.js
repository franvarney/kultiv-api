const Joi = require('joi')

exports.unit = Joi.object({
  id: Joi.number().integer(),
  name: Joi.string().required()
})
  .options({ stripUnknown: true })

exports.general = Joi.alternatives().try(
  exports.unit,
  Joi.array().items(exports.unit)
)

exports.createPayload = Joi.alternatives().try(
  exports.unit,
  Joi.array().items(exports.unit)
)
