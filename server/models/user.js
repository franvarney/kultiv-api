'use strict';

const Joi = require('joi');

const UserModel = Joi.object().keys({
  username: Joi.string().alphanum().min(3).max(50).required(),
  email: Joi.string().email().required(),
  password: Joi.string().required(),
  first_name: Joi.string().min(2).max(50),
  last_name: Joi.string().min(2).max(50),
  location: Joi.string().min(2).max(50),
  is_admin: Joi.boolean(),
  auth_token: Joi.string().guid(),
  updated_at: Joi.string().default('now()'),
  deleted_at: Joi.string().allow('now()')
});

module.exports = UserModel;
