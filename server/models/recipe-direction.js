const Logger = require('franston')('server:models:recipe-direction')

const Base = require('./base')
const DB = require('../connections/postgres')
const Lodash = require('../utils/lodash')
const RecipeDirectionSchema = require('../schemas/recipe-direction')

const TABLE_NAME = 'recipes_directions'

class RecipeDirection extends Base {
  constructor (data) {
    super(TABLE_NAME, RecipeDirectionSchema.general, data)
  }

  batchFindOrCreate(done) {
    Logger.debug('recipe-direction.batchFindOrCreate')

    this.knex(this.name)
      .select('id', 'recipe_id', 'direction_id')
      .where(function () {
        this.payload.recipeDirections.forEach((recipeDirection) => {
          return this.orWhere(recipeDirection)
        })
      })
      .transacting(this.trx)
      .asCallback((err, found) => {
        if (err) {
          if (this.trx) Logger.error('Transaction Failed'), this.trx.rollback()
          return Logger.error(err), done()
        }

        let ids = []
        let create = Lodash.xorWith(
          this.payload.recipeDirections,
          found.map((recipeDirection) => {
            ids.push(Lodash.pick(found, 'id'))
            return {
              recipe_id: recipeDirection.recipe_id,
              direction_id: recipeDirection.direction_id
            }
          }), Lodash.isEqual)

        if (!create || !create.length) {
          if (this.trx && this.willCommit) {
            Logger.debug('Transaction Completed'), this.trx.commit()
          }
          return done(null, found)
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

module.exports = RecipeDirection
