const Joi = require('joi')

exports.general = Joi.object({
  amount: Joi.number(),
  unit_id: Joi.number().integer(),
  food_id: Joi.number().integer().required(),
  optional: Joi.boolean(),
  updated_at: Joi.string().default('now()'),
  deleted_at: Joi.string().allow('now()')
})

exports.createPayload = Joi.object({
  amount: Joi.number().precision(2).allow(null),
  unit: Joi.string().required().default('none'),
  food: Joi.string().required(),
  optional: Joi.boolean().default(false)
})
