const Joi = require('joi')

exports.general = Joi.object({
  username: Joi.string().alphanum().min(3).max(50).required(),
  email: Joi.string().email().required(),
  password: Joi.string().required(),
  first_name: Joi.string().min(2).max(50).allow(null),
  last_name: Joi.string().min(2).max(50).allow(null),
  location: Joi.string().min(2).max(50).allow(null),
  is_admin: Joi.boolean(),
  updated_at: Joi.string().default('now()').allow(null),
  deleted_at: Joi.string().allow(null)
})

exports.createPayload = Joi.object({
  username: Joi.string().alphanum().min(3).max(50).required(),
  email: Joi.string().email().required(),
  password: Joi.string().required(),
  first_name: Joi.string().min(2).max(50).allow(null),
  last_name: Joi.string().min(2).max(50).allow(null),
  location: Joi.string().min(2).max(50).allow(null),
  is_admin: Joi.boolean()
})

exports.sanitize = Joi.object({
  id: Joi.number().integer().required(),
  username: Joi.string().required(),
  email: Joi.string().email().required(),
  first_name: Joi.string().allow(null),
  last_name: Joi.string().allow(null),
  location: Joi.string().allow(null),
  created_at: Joi.date().timestamp('unix').required(),
  updated_at: Joi.date().timestamp('unix').required()
})
  .options({ stripUnknown: true })
