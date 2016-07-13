const Joi = require('joi')

exports.unit = Joi.object({
  id: Joi.number().integer(),
  name: Joi.string().required()
})

exports.general = Joi.alternatives().try(exports.unit, Joi.array().items(exports.unit))
