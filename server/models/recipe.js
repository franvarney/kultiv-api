'use strict';

const Joi = require('joi');

const RecipeModel = Joi.object().keys({
  user_id: Joi.integer().required(),
  title: Joi.string().min(3).max(255).required(),
  prep_time: Joi.integer().required(),
  cook_time: Joi.integer().required(),
  yield_amount: Joi.integer().required(),
  yield_unit_id: Joi.integer().required(),
  description: Joi.string().min(3).max(255),
  is_private: Joi.boolean(),
  updated_at: Joi.string().default('now()'),
  deleted_at: Joi.string().allow('now()')
});

module.exports = RecipeModel;
