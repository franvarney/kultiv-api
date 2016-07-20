const Logger = require('franston')('server:models:recipe-ingredient')

const Base = require('./base')
const DB = require('../connections/postgres')
const Lodash = require('../utils/lodash')
const RecipeIngredientSchema = require('../schemas/recipe-ingredient')

const TABLE_NAME = 'recipes_ingredients'

class RecipeIngredient extends Base {
  constructor (data) {
    super(TABLE_NAME, RecipeIngredientSchema.general, data)
  }

  batchFindOrCreate(done) {
    Logger.debug('recipe-ingredient.batchFindOrCreate')

    this.knex(this.name)
      .select('id', 'recipe_id', 'ingredient_id')
      .where(function () {
        this.payload.recipeIngredients.forEach((recipeIngredient) => {
          return this.orWhere(recipeIngredient)
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
          this.payload.recipeIngredients,
          found.map((recipeIngredient) => {
            ids.push(Lodash.pick(found, 'id'))
            return {
              recipe_id: recipeIngredient.recipe_id,
              ingredient_id: recipeIngredient.ingredient_id
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

module.exports = RecipeIngredient
