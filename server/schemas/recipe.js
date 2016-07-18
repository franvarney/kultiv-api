const Joi = require('joi')

const DirectionSchema = require('./direction')
const IngredientSchema = require('./ingredient')

exports.general = Joi.object({
  user_id: Joi.number().integer().required(),
  title: Joi.string().min(3).max(255).required(),
  prep_time: Joi.number().integer().required(),
  cook_time: Joi.number().integer().required(),
  yield_amount: Joi.number().integer().required(),
  yield_unit_id: Joi.number().integer().required(),
  description: Joi.string().max(255).allow(null),
  is_private: Joi.boolean(),
  updated_at: Joi.string().default('now()'),
  deleted_at: Joi.string().allow('now()')
})
  .options({ stripUnknown: true })

exports.createPayload = Joi.object({
  cookbook_id: Joi.number().integer(),
  title: Joi.string().min(3).max(255).required(),
  prep_time: Joi.number().integer().required(),
  cook_time: Joi.number().integer().required(),
  yield_amount: Joi.number().integer().required(),
  yield_unit: Joi.string().required(),
  description: Joi.string().max(255).allow(null),
  is_private: Joi.boolean(),
  source_type: Joi.string().allow('manual', 'fork', 'url').default('manual'),
  source_value: Joi.string(),
  ingredients: Joi.array().items(IngredientSchema.createPayload).required(),
  directions: Joi.array().items(DirectionSchema.createPayload).required()
})
