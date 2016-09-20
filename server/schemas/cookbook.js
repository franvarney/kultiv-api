const Joi = require('joi')

exports.create = Joi.object({
  owner_id: Joi.number().integer().required(),
  name: Joi.string().min(3).max(50),
  description: Joi.string().allow(null),
  is_private: Joi.boolean(),
  updated_at: Joi.string().default('now()').allow(null),
  deleted_at: Joi.string().allow(null)
})

exports.createPayload = Joi.object({
  name: Joi.string().min(3).max(50).required(),
  description: Joi.string().allow(null),
  is_private: Joi.boolean()
})

exports.update = Joi.object({
  name: Joi.string().min(3).max(50),
  description: Joi.string().allow(null),
  is_private: Joi.boolean(),
  updated_at: Joi.string().default('now()').allow(null),
  deleted_at: Joi.string().allow(null)
})

exports.updatePayload = Joi.object({
  name: Joi.string().min(3).max(50),
  description: Joi.string().allow(null),
  is_private: Joi.boolean()
})
