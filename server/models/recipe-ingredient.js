const Logger = require('franston')('server:models:recipe-ingredient')

const Model = require('./base')
const DB = require('../connections/postgres')
const Lodash = require('../utils/lodash')
const RecipeIngredientSchema = require('../schemas/recipe-ingredient')

const TABLE_NAME = 'recipes_ingredients'

const CookbookRecipe = Model.createModel({
  name: TABLE_NAME,
  schema: RecipeIngredientSchema.general,

  batchFindOrCreate(done) {
    Logger.debug('recipe-ingredient.batchFindOrCreate')

    let {data} = this

    this.knex(this.name)
      .select('id', 'recipe_id', 'ingredient_id')
      .where(function () {
        data.map((recipeIngredient) => this.orWhere(recipeIngredient))
      })
      .transacting(this.trx)
      .asCallback((err, found) => {
        if (err) {
          if (this.trx) Logger.error('Transaction Failed'), this.trx.rollback()
          return Logger.error(err), done(err)
        }

        let ids = []
        let create = Lodash.xorWith(
          data,
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

        this.set(create)._create((err, created) => {
          if (err) return this._errors(err, done)
          return done(null, created.concat(ids))
        })
      })
  }
})

module.exports = RecipeIngredient
