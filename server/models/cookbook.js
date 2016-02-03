'use strict';

const Joi = require('joi');

module.exports = Joi.object().keys({
  user_id: Joi.integer().required(),
  name: Joi.string().min(3).max(50),
  description: Joi.string(),
  is_private: Joi.boolean(),
  updated_at: Joi.string().default('now()'),
  deleted_at: Joi.string().allow('now()')
});
