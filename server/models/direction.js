const Logger = require('franston')('server:models:direction')

const Base = require('./base')
const DirectionSchema = require('../schemas/direction')
const Lodash = require('../utils/lodash')

const TABLE_NAME = 'directions'

class Direction extends Base {
  constructor (data) {
    super(TABLE_NAME, DirectionSchema.createPayload, data)
  }

  findOrCreate(done) {
    Logger.debug('direction.findOrCreate')

    this.knex(this.name)
      .select('id', 'direction')
      .where('direction', this.payload.direction)
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
    Logger.debug('direction.batchFindOrCreate')

    let {payload} = this

    this.knex(this.name)
      .select('id')
      .where(function () {
        payload.forEach((direction) => this.orWhere(direction))
      })
      .transacting(this.trx)
      .asCallback((err, found) => {
        if (err) {
          if (this._rollback()) this._trxRollback()
          return this._errors(err, done)
        }

        let ids = []
        let create = Lodash.xorWith(
          payload,
          found.map((direction) => {
            ids.push(direction.id)
            delete direction.id
            return Object.assign({}, direction)
          }), Lodash.isEqual)

        if (!create || !create.length) {
          if (this._commit()) this._trxComplete()
          return done(null, ids)
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

module.exports = Direction
