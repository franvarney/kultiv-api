const Logger = require('franston')('server:models:recipe-ingredient')

const Base = require('./base')
const DB = require('../connections/postgres')
const Lodash = require('../utils/lodash')
const RecipeIngredientSchema = require('../schemas/recipe-ingredient')

const TABLE_NAME = 'recipes_ingredients'

class RecipeIngredient extends Base {
  constructor () {
    super(TABLE_NAME, RecipeIngredientSchema.general)
  }

  batchFindOrCreate(recipeIngredients, trx, done) {
    Logger.debug('recipe-ingredient.batchFindOrCreate')

    if (!done) {
      done = trx
      trx = undefined
    }

    this.knex(this.name)
      .select('id', 'recipe_id', 'ingredient_id')
      .where(function () {
        recipeIngredients.forEach((recipeIngredient) => {
          return this.orWhere(recipeIngredient)
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
          recipeIngredients,
          found.map((recipeIngredient) => {
            ids.push(Lodash.pick(found, 'id'))
            return {
              recipe_id: recipeIngredient.recipe_id,
              ingredient_id: recipeIngredient.ingredient_id
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

module.exports = RecipeIngredient
