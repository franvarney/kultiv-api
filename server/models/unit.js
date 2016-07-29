const Logger = require('franston')('server:models:unit')

const Base = require('./base')
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
    Logger.debug('unit.batchFindOrCreate')

    this.knex(this.name)
      .select('id')
      .whereIn('name', this.payload)
      .transacting(this.trx)
      .asCallback((err, found) => {
        if (err) {
          if (this._rollback()) this._trxRollback()
          return this._errors(err, done)
        }

        let names = found.map((unit) => unit.name)
        let create = this.payload.filter((unit) => {
          return names.indexOf(unit) === -1 ? true : false
        }).map((unit) => {
          return { name: unit }
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

module.exports = Unit
