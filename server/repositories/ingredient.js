'use strict'

const Base = require('./base')
const IngredientModel = require('../models/ingredient')

const TABLE_NAME = 'ingredients'

class Ingredient extends Base {
  constructor () {
    super(TABLE_NAME, IngredientModel)
  }
}

module.exports = new Ingredient()
