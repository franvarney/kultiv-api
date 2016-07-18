const Logger = require('franston')('server:models:recipe-direction')

const Base = require('./base')
const DB = require('../connections/postgres')
const Lodash = require('../utils/lodash')
const RecipeDirectionSchema = require('../schemas/recipe-direction')

const TABLE_NAME = 'recipes_directions'

class RecipeDirection extends Base {
  constructor () {
    super(TABLE_NAME, RecipeDirectionSchema.general)
  }

  batchFindOrCreate(recipeDirections, trx, done) {
    Logger.debug('recipe-direction.batchFindOrCreate')

    if (!done) {
      done = trx
      trx = undefined
    }

    this.knex(this.name)
      .select('id', 'recipe_id', 'direction_id')
      .where(function () {
        recipeDirections.forEach((recipeDirection) => {
          return this.orWhere(recipeDirection)
        })
      })
      .transacting(trx)
      .asCallback((err, found) => {
        if (err) {
          if (trx) Logger.error('Transaction Failed'), trx.rollback()
          return Logger.error(err), done()
        }

        let ids = []
        let create = Lodash.xorWith(
          recipeDirections,
          found.map((recipeDirection) => {
            ids.push(Lodash.pick(found, 'id'))
            return {
              recipe_id: recipeDirection.recipe_id,
              direction_id: recipeDirection.direction_id
            }
          }), Lodash.isEqual)

        if (!create || !create.length) {
          // if (trx) Logger.error('Transaction Completed'), trx.commit()
          return done(null, found)
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

module.exports = RecipeDirection
