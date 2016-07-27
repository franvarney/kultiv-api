const Logger = require('franston')('server:models:direction')

const Base = require('./base')
const DB = require('../connections/postgres')
const DirectionSchema = require('../schemas/direction')
const Lodash = require('../utils/lodash')

const TABLE_NAME = 'directions'

class Direction extends Base {
  constructor (data) {
    super(TABLE_NAME, DirectionSchema.general, data)
  }

  findById (done) {
    Logger.debug('direction.findById')

    this.knex(this.name)
      .where('id', this.payload.id)
      .transacting(this.trx)
      .first('id', 'direction')
      .asCallback((err, direction) => {
        if (err) {
          if (this.trx) {
            Logger.error('Transaction Failed'), this.trx.rollback()
          }
          return Logger.error(err), done(err)
        }

        if (this.trx && this.willCommit) {
          Logger.debug('Transaction Completed'), this.trx.commit()
        }
        return done(null, direction)
      })
  }

  batchFindOrCreate(done) {
    Logger.debug('direction.batchFindOrCreate')

    let that = this

    // TODO handle for two directions being the same (with different order)?
    this.knex(this.name)
      .select('id', 'direction', 'order')
      .where(function () {
        that.payload.forEach((direction) => this.orWhere(direction))
      })
      .transacting(this.trx)
      .asCallback((err, found) => {
        if (err) {
          if (this.trx) Logger.error('Transaction Failed'), this.trx.rollback()
          return Logger.error(err), done(err)
        }

        let ids = []
        let create = Lodash.xorWith(
          that.payload,
          found.map((direction) => {
            ids.push(direction.id)
            delete direction.id
            return Object.assign({}, direction)
          }), Lodash.isEqual)

        if (!create || !create.length) {
          if (this.trx && this.willCommit) {
            Logger.error('Transaction Completed'), this.trx.commit()
          }
          return done(null, ids)
        }

        // TODO validate?

        this.batchInsert(['id', 'direction'], (err, created) => {
          if (err) {
            if (this.trx) {
              Logger.error('Transaction Failed'), this.trx.rollback()
            }
            return Logger.error(err), done(err)
          }

          if (this.trx && this.willCommit) {
            Logger.debug('Transaction Completed'), this.trx.commit()
          }
          return done(null, created.concat(found))
        })
      })
  }
}

module.exports = Direction
