'use strict'

const Joi = require('joi')

const FoodModel = Joi.object().keys({
  name: Joi.string().min(2).max(255).required()
})

module.exports = FoodModel
