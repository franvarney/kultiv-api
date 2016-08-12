const Logger = require('franston')('server:models:food')

const Base = require('./base')
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
      .select('id')
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
          return done(null, found.id)
        }

        return super.create(done)
      })
  }

  batchFindOrCreate(done) {
    Logger.debug('food.batchFindOrCreate')

    let {payload} = this

    this.knex(this.name)
      .select('id', 'name')
      .where(function () {
        payload.map((food) => this.orWhere({ name: food.name }))
      })
      .transacting(this.trx)
      .asCallback((err, found) => {
        if (err) {
          if (this._rollback()) this._trxRollback()
          return this._errors(err, done)
        }

        let ids = found.map((food) => food.id)
        let names = found.map((food) => food.name)
        let create = this.payload.filter((food) => {
          return names.indexOf(food.name) === -1 ? true : false
        }).map((food) => ({ name: food.name }))

        if (!create || !create.length) {
          if (this._commit()) this._trxComplete()
          return done(null, ids)
        }

        this.payload = create

        this.create((err, created) => {
          if (err) return this._errors(err, done)
          return done(null, created.concat(ids))
        })
      })
  }
}

module.exports = Food
