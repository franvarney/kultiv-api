const Logger = require('franston')('server:models:food')

const Model = require('./base')
const FoodSchema = require('../schemas/food')

const TABLE_NAME = 'foods'

const Food = Model.createModel({
  name: TABLE_NAME,
  schema: FoodSchema.general,

  findByName (done) {
    Logger.debug('food.findByName')

    this.knex(this.name)
      .select('id', 'name')
      .where('name', 'LIKE', `%${this.data.name}%`)
      .whereNull('deleted_at')
      .asCallback((err, foods) => {
        if (err) return this._errors(err, done)
        return done(null, foods)
      })
  },

  findOrCreate(done) {
    Logger.debug('food.findOrCreate')

    this.knex(this.name)
      .select('id')
      .where('name', this.data.name)
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

        return this._create(done)
      })
  },

  batchFindOrCreate(done) {
    Logger.debug('food.batchFindOrCreate')

    let {data} = this

    this.knex(this.name)
      .select('id', 'name')
      .where(function () {
        data.map((food) => this.orWhere({ name: food.name }))
      })
      .transacting(this.trx)
      .asCallback((err, found) => {
        if (err) {
          if (this._rollback()) this._trxRollback()
          return this._errors(err, done)
        }

        let ids = found.map((food) => food.id)
        let names = found.map((food) => food.name)
        let create = data.filter((food) => {
          return names.indexOf(food.name) === -1 ? true : false
        }).map((food) => ({ name: food.name }))

        if (!create || !create.length) {
          if (this._commit()) this._trxComplete()
          return done(null, ids)
        }

        this.data = create

        this._create((err, created) => {
          if (err) return this._errors(err, done)
          return done(null, created.concat(ids))
        })
      })
  }
})

module.exports = Food
