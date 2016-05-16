const Logger = require('franston')('server:models:food')

const Base = require('./base')
const FoodSchema = require('../schemas/food')

const TABLE_NAME = 'foods'

class Food extends Base {
  constructor () {
    super(TABLE_NAME, FoodSchema)
  }

  findByName (name, done) {
    Logger.debug('food.findByName')

    this.knex(this.name)
      .where('name', 'LIKE', `%${name}%`)
      .whereNull('deleted_at')
      .asCallback((err, foods) => {
        if (err) return Logger.error(err), done(err)
        return done(null, foods)
      })
  }
}

module.exports = new Food()
