const Logger = require('franston')('server:models:direction')

const Base = require('./base')
const DB = require('../connections/postgres')
const DirectionSchema = require('../schemas/direction')
const Lodash = require('../utils/lodash')

const TABLE_NAME = 'directions'

class Direction extends Base {
  constructor () {
    super(TABLE_NAME, DirectionSchema.general)
  }

  findById (id, done) {
    Logger.debug('direction.findById')

    this.knex(this.name)
      .where('id', id)
      .first('id', 'direction')
      .asCallback((err, direction) => {
        if (err) return Logger.error(err), done(err)
        return done(null, direction)
      })
  }

  batchFindOrCreate(directions, trx, done) {
    Logger.debug('direction.batchFindOrCreate')

    if (!done) {
      done = trx
      trx = undefined
    }

    // TODO handle for two directions being the same (with different order)?
    this.knex(this.name)
      .select('id', 'direction', 'order')
      .where(function () {
        directions.forEach((direction) => this.orWhere(direction))
      })
      .transacting(trx)
      .asCallback((err, found) => {
        if (err) {
          if (trx) Logger.error('Transaction Failed'), trx.rollback()
          return Logger.error(err), done()
        }

        let ids = []
        let create = Lodash.xorWith(
          directions,
          found.map((direction) => {
            ids.push(direction.id)
            delete direction.id
            return Object.assign({}, direction)
          }), Lodash.isEqual)

        if (!create || !create.length) {
          // if (trx) Logger.error('Transaction Completed'), trx.commit()
          return done(null, ids)
        }

        // TODO validate?

        DB.batchInsert(this.name, create)
          .returning('id', 'direction')
          .transacting(trx)
          .then((created) => {
            // if (trx) Logger.error('Transaction Completed'), trx.commit()
            return done(null, ids.concat(created))
          })
          .catch((err) => {
            if (trx) Logger.error('Transaction Failed'), trx.rollback()
            return Logger.error(err), done()
          })
      })
  }
}

module.exports = Direction
