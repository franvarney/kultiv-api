'use strict';

const Joi = require('joi');

const CookbookModel = Joi.object().keys({
  owner_id: Joi.number().integer().required(),
  name: Joi.string().min(3).max(50),
  description: Joi.string(),
  is_private: Joi.boolean(),
  updated_at: Joi.string().default('now()'),
  deleted_at: Joi.string().allow('now()')
});

module.exports = CookbookModel;
