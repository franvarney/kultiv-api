'use strict';

const Joi = require('joi');

const DirectionModel = Joi.object().keys({
  direction: Joi.string(),
  updated_at: Joi.string().default('now()')
});

module.exports = DirectionModel;
