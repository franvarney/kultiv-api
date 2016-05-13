'use strict'

const Joi = require('joi')

const UserModel = Joi.object().keys({
  username: Joi.string().alphanum().min(3).max(50).required(),
  email: Joi.string().email().required(),
  password: Joi.string().required(),
  first_name: Joi.string().min(2).max(50).allow(null),
  last_name: Joi.string().min(2).max(50).allow(null),
  location: Joi.string().min(2).max(50).allow(null),
  is_admin: Joi.boolean(),
  auth_token: Joi.string().guid(),
  updated_at: Joi.string().default('now()').allow(null),
  deleted_at: Joi.string().allow(null)
})

module.exports = UserModel
