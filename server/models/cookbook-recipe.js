const Logger = require('franston')('server:models:cookbook-recipe')

const Base = require('./base')
const CookbookRecipeSchema = require('../schemas/cookbook-recipe')

const TABLE_NAME = 'cookbooks_recipes'

class CookbookRecipe extends Base {
  constructor () {
    super(TABLE_NAME, CookbookRecipeSchema.general)
  }

  findOrCreate(payload, trx, done) {
    console.log(payload)
    Logger.debug('cookbook-recipe.findOrCreate')

    if (!done) {
      done = trx
      trx = undefined
    }

    this.knex(this.name)
      .select('id')
      .where(payload)
      .first()
      .transacting(trx)
      .asCallback((err, found) => {
        if (err) {
          if (trx) Logger.error('Transaction failed'), trx.rollback()
          return Logger.error(err), done(err)
        }

        if (found) {
          // trx.commit
          return done(null, Object.assign({}, found))
        }

        return super.create(payload, done)
      })
  }
}

module.exports = CookbookRecipe
