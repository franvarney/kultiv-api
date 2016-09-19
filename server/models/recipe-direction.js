const Logger = require('franston')('server:models:recipe-direction')

const Base = require('./base')
const DB = require('../connections/postgres')
const Lodash = require('../utils/lodash')
const RecipeDirectionSchema = require('../schemas/recipe-direction')

const TABLE_NAME = 'recipes_directions'

const RecipeDirection = Model.createModel({
  name: TABLE_NAME,
  schema: RecipeDirectionSchema.general,

  batchFindOrCreate(done) {
    Logger.debug('recipe-direction.batchFindOrCreate')

    let {data} = this

    this.knex(this.name)
      .select('id', 'recipe_id', 'direction_id')
      .where(function () {
        data.forEach((recipeDirection) => {
          return this.orWhere(recipeDirection)
        })
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

        this.set(create)._create((err, created) => {
          if (err) return this._errors(err, done)
          return done(null, created.concat(ids))
        })
      })
  }
})

module.exports = RecipeDirection
