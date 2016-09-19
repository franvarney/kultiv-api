const Logger = require('franston')('server:models:cookbook-recipe')

const Model = require('./base')
const CookbookRecipeSchema = require('../schemas/cookbook-recipe')

const TABLE_NAME = 'cookbooks_recipes'

const CookbookRecipe = Model.createModel({
  name: TABLE_NAME,
  schema: CookbookRecipeSchema.general,

  findOrCreate(done) {
    Logger.debug('cookbook-recipe.findOrCreate')

    this.knex(this.name)
      .select('id')
      .where(this.payload)
      .first()
      .transacting(this.trx)
      .asCallback((err, found) => {
        if (err) {
          if (trx) Logger.error('Transaction failed'), this.trx.rollback()
          return Logger.error(err), done(err)
        }

        if (found) {
          if (this.trx && this.willCommit) {
            Logger.error('Transaction Completed'), this.trx.commit()
          }
          return done(null, Object.assign({}, found))
        }

        return this._create(done)
      })
  }
})

module.exports = CookbookRecipe
