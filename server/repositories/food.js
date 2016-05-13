'use strict'

const Base = require('./base')
const FoodModel = require('../models/food')

const TABLE_NAME = 'foods'

class Food extends Base {
  constructor () {
    super(TABLE_NAME, FoodModel)
  }

  findByName (name, done) {
    this.knex(this.name)
      .where('name', 'LIKE', `%${name}%`)
      .whereNull('deleted_at')
      .then((foods) => done(null, foods))
      .catch((err) => done(err))
  }
}

module.exports = new Food()
