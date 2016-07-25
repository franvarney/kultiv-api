const Logger = require('franston')('server:models:unit')

const Base = require('./base')
const DB = require('../connections/postgres')
const UnitSchema = require('../schemas/unit')

const TABLE_NAME = 'units'

class Unit extends Base {
  constructor (data) {
    super(TABLE_NAME, UnitSchema.general, data)
  }

  findOrCreate(done) {
    Logger.debug('unit.findOrCreate')

    this.knex(this.name)
      .select('id', 'name')
      .where('id', Number(this.payload.idOrName) || -1) // use -1, undefined throws error
      .orWhere('name', this.payload.idOrName)
      .first()
      .transacting(this.trx)
      .asCallback((err, found) => {
        if (err) {
          if (this.trx) Logger.error('Transaction failed'), trx.rollback()
          return Logger.error(err), done(err)
        }

        if (found) return done(null, Object.assign({}, found))

        this.validate({ name: this.payload.idOrName }, (err, validated) => {
          if (err) {
            if (this.trx) Logger.error('Transaction failed'), trx.rollback()
            return Logger.error(err), done(err)
          }

          return super.create(validated, ['id', 'name'], trx, done)
        })
      })
  }

  batchFindOrCreate(done) {
    Logger.debug('unit.batchFindOrCreate')

    this.knex(this.name)
      .select('id', 'name')
      .whereIn('name', this.payload)
      .transacting(this.trx)
      .asCallback((err, found) => {
        if (err) {
          if (this.trx) Logger.error('Transaction Failed'), this.trx.rollback()
          return Logger.error(err), done(err)
        }

        let names = found.map((unit) => unit.name)
        let create = this.payload.filter((unit) => {
          return names.indexOf(unit) === -1 ? true : false
        }).map((unit) => {
          return { name: unit }
        })

        if (!create || !create.length) {
          if (this.trx && this.willCommit) {
            Logger.error('Transaction Completed'), this.trx.commit()
          }
          return done(null, found)
        }

        // TODO validate?

        DB.batchInsert(this.name, create)
          .returning(['id', 'name'])
          .transacting(this.trx)
          .then((created) => {
            if (this.trx && this.willCommit) {
              Logger.error('Transaction Completed'), this.trx.commit()
            }
            return done(null, found.concat(created))
          })
          .catch((err) => {
            if (this.trx) Logger.error('Transaction Failed'), this.trx.rollback()
            return Logger.error(err), done(err)
          })
      })
  }
}

module.exports = Unit
