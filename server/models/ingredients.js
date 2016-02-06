'use strict';

const Joi = require('joi');

const IngredientModel = Joi.object().keys({
  amount: Joi.integer(),
  unit_id: Joi.integer().required(),
  food_id: Joi.integer().required(),
  optional: Joi.boolean(),
  updated_at: Joi.string().default('now()'),
  deleted_at: Joi.string().allow('now()')
});

module.exports = IngredientModel;
