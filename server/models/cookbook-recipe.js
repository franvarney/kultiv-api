const Logger = require('franston')('server:models:cookbook-recipe')

const Base = require('./base')
const CookbookRecipeSchema = require('../schemas/cookbook-recipe')

const TABLE_NAME = 'cookbooks_recipes'

class CookbookRecipe extends Base {
  constructor (data) {
    super(TABLE_NAME, CookbookRecipeSchema.general, data)
  }

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

        return super.create(done)
      })
  }
}

module.exports = CookbookRecipe
