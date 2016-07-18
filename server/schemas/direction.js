const Joi = require('joi')

exports.general = Joi.object({
  direction: Joi.string().required(),
  order: Joi.number().integer().required()
})
  .options({ stripUnknown: true })

exports.createPayload = Joi.object({
  direction: Joi.string().required(),
  order: Joi.number().integer()
})
