const Joi = require('joi')

exports.general = Joi.object().keys({
  hawk_id: Joi.string().guid(),
  hawk_key: Joi.string().guid()
})

exports.loginPayload = Joi.object({
  login: Joi.alternatives().try(Joi.string(), Joi.string().email()).required(),
  password: Joi.string().required()
})

exports.loginResponse = Joi.object({
  id: Joi.string().guid().required(),
  key: Joi.string().guid().required(),
  userId: Joi.number().integer()
})
  .rename('hawk_id', 'id')
  .rename('hawk_key', 'key')
  .rename('user_id', 'userId')
