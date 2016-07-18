const Joi = require('joi')

exports.createQuery = Joi.object({
  type: Joi.string().allow(['partial', 'fork']).default('fork').required()
})

exports.createPayloadFork = Joi.object({
  recipe_id: Joi.number().integer().required()
})

exports.createPayloadPartial = Joi.object({
  cookbook_id: Joi.number().integer(),
  title: Joi.string().min(3).max(255).required(),
  prep_time: Joi.number().integer().required(),
  cook_time: Joi.number().integer().required(),
  yield_amount: Joi.number().integer().required(),
  yield_unit: Joi.string().required(),
  description: Joi.string().max(255).allow(null),
  is_private: Joi.boolean(),
  source_type: Joi.string().allow('manual', 'fork', 'url'),
  source_value: Joi.string(),
  ingredients: Joi.string().required(),
  directions: Joi.string().required()
})

exports.createPayload = Joi.alternatives().try(
  exports.createPayloadFork,
  exports.createPayloadPartial
)
