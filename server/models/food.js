const Logger = require('franston')('server:models:food')

const Base = require('./base')
const DB = require('../connections/postgres')
const FoodSchema = require('../schemas/food')

const TABLE_NAME = 'foods'

class Food extends Base {
  constructor (data) {
    super(TABLE_NAME, FoodSchema.general, data)
  }

  findByName (done) {
    Logger.debug('food.findByName')

    this.knex(this.name)
      .where('name', 'LIKE', `%${this.payload.name}%`)
      .whereNull('deleted_at')
      .transacting(this.trx)
      .asCallback((err, foods) => {
        if (err) {
          if (this._rollback()) this._trxRollback()
          return this._errors(err, done)
        }

        if (this._commit()) this._trxComplete()
        return done(null, foods)
      })
  }

  findOrCreate(done) {
    Logger.debug('food.findOrCreate')

    this.knex(this.name)
      .select('id', 'name')
      .where('name', this.payload.name)
      .first()
      .transacting(this.trx)
      .asCallback((err, found) => {
        if (err) {
          if (this._rollback()) this._trxRollback()
          return this._errors(err, done)
        }

        if (found) {
          if (this._commit()) this._trxComplete()
          return done(null, found)
        }

        return super.create(done)
      })
  }

  batchFindOrCreate(done) {
    Logger.debug('food.batchFindOrCreate')

    this.knex(this.name)
      .select('id')
      .whereIn('name', this.payload)
      .transacting(this.trx)
      .asCallback((err, found) => {
        if (err) {
          if (this._rollback()) this._trxRollback()
          return this._errors(err, done)
        }

        let names = found.map((food) => food.name)
        let create = this.payload.filter((food) => {
          return names.indexOf(food) === -1 ? true : false
        }).map((food) => {
          return { name: food }
        })

        if (!create || !create.length) {
          if (this._commit()) this._trxComplete()
          return done(null, found)
        }

        // TODO validate?

        this.batchInsert((err, created) => {
          if (err) {
            if (this._rollback()) this._trxRollback()
            return this._errors(err, done)
          }

          if (this._commit()) this._trxComplete()
          return done(null, created.concat(found))
        })
      })
  }
}

module.exports = Food
