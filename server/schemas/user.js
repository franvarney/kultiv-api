const Joi = require('joi')

exports.create = Joi.object({
  username: Joi.string().alphanum().min(3).max(50).required(),
  email: Joi.string().email().required(),
  password: Joi.string().required(),
  first_name: Joi.string().min(2).max(50).allow(null),
  last_name: Joi.string().min(2).max(50).allow(null),
  location: Joi.string().min(2).max(50).allow(null),
  is_admin: Joi.boolean(),
  updated_at: Joi.date().timestamp('unix').allow('now()').default('now()')
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

exports.update = Joi.object({
  email: Joi.string().email(),
  password: Joi.string(),
  first_name: Joi.string().min(2).max(50).allow(null),
  last_name: Joi.string().min(2).max(50).allow(null),
  location: Joi.string().min(2).max(50).allow(null),
  is_admin: Joi.boolean(),
  updated_at: Joi.date().timestamp('unix').allow('now()').default('now()'),
  deleted_at: Joi.date().timestamp('unix').allow(null)
})

exports.updatePayload = Joi.object({
  email: Joi.string().email(),
  password: Joi.string(),
  first_name: Joi.string().allow(null),
  last_name: Joi.string().allow(null),
  location: Joi.string().allow(null),
})
  .options({ stripUnknown: true })
