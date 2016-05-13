const Base = require('./base')
const IngredientSchema = require('../schemas/ingredient')

const TABLE_NAME = 'ingredients'

class Ingredient extends Base {
  constructor () {
    super(TABLE_NAME, IngredientSchema)
  }
}

module.exports = new Ingredient()
