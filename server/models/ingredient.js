const IsEqual = require('lodash.isequal')
const Logger = require('franston')('server:models:ingredient')
const XorWith = require('lodash.xorwith')

const Base = require('./base')
const DB = require('../connections/postgres')
const IngredientSchema = require('../schemas/ingredient')

const TABLE_NAME = 'ingredients'

class Ingredient extends Base {
  constructor () {
    super(TABLE_NAME, IngredientSchema.general)
  }

  batchFindOrCreate(ingredients, trx, done) {
    Logger.debug('ingredient.batchFindOrCreate')

    if (!done) {
      done = trx
      trx = undefined
    }

    this.knex(this.name)
      .select('id', 'amount', 'unit_id', 'food_id', 'optional')
      .where(function () {
        ingredients.forEach((ingredient) => this.orWhere(ingredient))
      })
      .transacting(trx)
      .asCallback((err, found) => {
        if (err) {
          if (trx) Logger.error('Transaction Failed'), trx.rollback()
          return Logger.error(err), done()
        }

        let ids = []
        let create = XorWith(ingredients, found.map((ingredient) => {
          ids.push(ingredient.id)
          delete ingredient.id
          ingredient.amount = Number(ingredient.amount)
          return Object.assign({}, ingredient)
        }), IsEqual)

        if (!create || !create.length) {
          // if (trx) Logger.error('Transaction Completed'), trx.commit()
          return done(null, ids)
        }

        // TODO validate?

        DB.batchInsert(this.name, create)
          .returning('id')
          .transacting(trx)
          .then((created) => {
            // if (trx) Logger.error('Transaction Completed'), trx.commit()
            return done(null, ids.concat(created))
          })
          .catch((err) => {
            if (trx) Logger.error('Transaction Failed'), trx.rollback()
            return Logger.error(err), done()
          })
      })
  }
}

module.exports = Ingredient
