const Joi = require('joi')

exports.general = Joi.object({
  user_id: Joi.number().integer().required(),
  title: Joi.string().min(3).max(255).required(),
  prep_time: Joi.number().integer().required(),
  cook_time: Joi.number().integer().required(),
  yield_amount: Joi.number().integer().required(),
  yield_unit_id: Joi.number().integer().required(),
  description: Joi.string().min(3).max(255),
  is_private: Joi.boolean(),
  updated_at: Joi.string().default('now()'),
  deleted_at: Joi.string().allow('now()')
})
