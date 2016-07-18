const Logger = require('franston')('server:models:food')

const Base = require('./base')
const DB = require('../connections/postgres')
const FoodSchema = require('../schemas/food')

const TABLE_NAME = 'foods'

class Food extends Base {
  constructor () {
    super(TABLE_NAME, FoodSchema.general)
  }

  findByName (name, done) {
    Logger.debug('food.findByName')

    this.knex(this.name)
      .where('name', 'LIKE', `%${name}%`)
      .whereNull('deleted_at')
      .asCallback((err, foods) => {
        if (err) return Logger.error(err), done(err)
        return done(null, foods)
      })
  }

  findOrCreate(idOrName, trx, done) {
    Logger.debug('food.findOrCreate')

    if (!done) {
      done = trx
      trx = undefined
    }

    this.knex(this.name)
      .select('id', 'name')
      .where('id', Number(idOrName) || -1) // use -1, undefined throws error
      .orWhere('name', idOrName)
      .first()
      .transacting(trx)
      .asCallback((err, found) => {
        if (err) {
          if (trx) Logger.error('Transaction failed'), trx.rollback()
          return Logger.error(err), done(err)
        }

        if (found) return done(null, Object.assign({}, found))

        this.validate({ name: idOrName }, (err, validated) => {
          if (err) {
            if (trx) Logger.error('Transaction failed'), trx.rollback()
            return Logger.error(err), done(err)
          }

          return super.create(validated, ['id', 'name'], trx, done)
        })
      })
  }

  batchFindOrCreate(foods, trx, done) {
    Logger.debug('food.batchFindOrCreate')

    if (!done) {
      done = trx
      trx = undefined
    }

    this.knex(this.name)
      .select('id', 'name')
      .whereIn('name', foods)
      .transacting(trx)
      .asCallback((err, found) => {
        if (err) {
          if (trx) Logger.error('Transaction Failed'), trx.rollback()
          return Logger.error(err), done()
        }

        let names = found.map((food) => food.name)
        let create = foods.filter((food) => {
          return names.indexOf(food) === -1 ? true : false
        }).map((food) => {
          return { name: food }
        })

        if (!create || !create.length) {
          // if (trx) Logger.error('Transaction Completed'), trx.commit()
          return done(null, found)
        }

        // TODO validate?

        DB.batchInsert(this.name, create)
          .returning(['id', 'name'])
          .transacting(trx)
          .then((created) => {
            // if (trx) Logger.error('Transaction Completed'), trx.commit()
            return done(null, found.concat(created))
          })
          .catch((err) => {
            if (trx) Logger.error('Transaction Failed'), trx.rollback()
            return Logger.error(err), done()
          })
      })
  }
}

module.exports = Food
