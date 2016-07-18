const Logger = require('franston')('server:models:unit')

const Base = require('./base')
const DB = require('../connections/postgres')
const UnitSchema = require('../schemas/unit')

const TABLE_NAME = 'units'

class Unit extends Base {
  constructor () {
    super(TABLE_NAME, UnitSchema.general)
  }

  findOrCreate(idOrName, trx, done) {
    Logger.debug('unit.findOrCreate')

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

  batchFindOrCreate(units, trx={}, done) {
    Logger.debug('unit.batchFindOrCreate')

    if (!done) {
      done = trx
      trx = undefined
    }

    this.knex(this.name)
      .select('id', 'name')
      .whereIn('name', units)
      .transacting(trx)
      .asCallback((err, found) => {
        if (err) {
          if (trx) Logger.error('Transaction Failed'), trx.rollback()
          return Logger.error(err), done()
        }

        let names = found.map((unit) => unit.name)
        let create = units.filter((unit) => {
          return names.indexOf(unit) === -1 ? true : false
        }).map((unit) => {
          return { name: unit }
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

module.exports = Unit
