'use strict'

const Joi = require('joi')

const CookbookModel = Joi.object().keys({
  owner_id: Joi.number().integer().required(),
  name: Joi.string().min(3).max(50),
  description: Joi.string().allow(null),
  is_private: Joi.boolean(),
  updated_at: Joi.string().default('now()').allow(null),
  deleted_at: Joi.string().allow(null)
})

module.exports = CookbookModel
