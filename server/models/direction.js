const Logger = require('franston')('server:models:direction')

const Model = require('./base')
const DirectionSchema = require('../schemas/direction')
const Lodash = require('../utils/lodash')

const TABLE_NAME = 'directions'

const Direction = Model.createModel({
  name: TABLE_NAME,
  schema: DirectionSchema.general,

  findOrCreate(done) {
    Logger.debug('direction.findOrCreate')

    this.knex(this.name)
      .select('id')
      .where('direction', this.data.direction)
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

        return this._create(done)
      })
  },

  batchFindOrCreate(done) {
    Logger.debug('direction.batchFindOrCreate')

    let {data} = this

    this.knex(this.name)
      .select('id')
      .where(function () {
        data.forEach((direction) => this.orWhere(direction))
      })
      .transacting(this.trx)
      .asCallback((err, found) => {
        if (err) {
          if (this._rollback()) this._trxRollback()
          return this._errors(err, done)
        }

        let ids = []
        let create = Lodash.xorWith(
          data,
          found.map((direction) => {
            ids.push(direction.id)
            delete direction.id
            return Object.assign({}, direction)
          }), Lodash.isEqual)

        if (!create || !create.length) {
          if (this._commit()) this._trxComplete()
          return done(null, ids)
        }

        this.set(create)._create((err, created) => {
          if (err) return this._errors(err, done)
          return done(null, created.concat(ids))
        })
      })
  }
})

module.exports = Direction
