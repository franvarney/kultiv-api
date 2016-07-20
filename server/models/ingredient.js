const IsEqual = require('lodash.isequal')
const Logger = require('franston')('server:models:ingredient')
const XorWith = require('lodash.xorwith')

const Base = require('./base')
const DB = require('../connections/postgres')
const IngredientSchema = require('../schemas/ingredient')

const TABLE_NAME = 'ingredients'

class Ingredient extends Base {
  constructor (data) {
    super(TABLE_NAME, IngredientSchema.general, data)
  }

  batchFindOrCreate(done) {
    Logger.debug('ingredient.batchFindOrCreate')

    this.knex(this.name)
      .select('id', 'amount', 'unit_id', 'food_id', 'optional')
      .where(function () {
        this.payload.ingredients.forEach((ingredient) => this.orWhere(ingredient))
      })
      .transacting(this.trx)
      .asCallback((err, found) => {
        if (err) {
          if (this.trx) Logger.error('Transaction Failed'), this.trx.rollback()
          return Logger.error(err), done()
        }

        let ids = []
        let create = XorWith(this.payload.ingredients, found.map((ingredient) => {
          ids.push(ingredient.id)
          delete ingredient.id
          ingredient.amount = Number(ingredient.amount)
          return Object.assign({}, ingredient)
        }), IsEqual)

        if (!create || !create.length) {
          if (this.trx && this.willCommit) {
            Logger.debug('Transaction Completed'), this.trx.commit()
          }
          return done(null, ids)
        }

        // TODO validate?

        DB.batchInsert(this.name, create)
          .returning('id')
          .transacting(this.trx)
          .then((created) => {
            if (this.trx && this.willCommit) {
              Logger.debug('Transaction Completed'), this.trx.commit()
            }
            return done(null, ids.concat(created))
          })
          .catch((err) => {
            if (this.trx) Logger.error('Transaction Failed'), this.trx.rollback()
            return Logger.error(err), done()
          })
      })
  }
}

module.exports = Ingredient
