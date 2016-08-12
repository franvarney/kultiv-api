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
    Logger.debug('unit.batchFindOrCreate')

    let {payload} = this

    this.knex(this.name)
      .select('id', 'name')
      .where(function () {
        payload.map((unit) => this.orWhere({ name: unit.name }))
      })
      .transacting(this.trx)
      .asCallback((err, found) => {
        if (err) {
          if (this._rollback()) this._trxRollback()
          return this._errors(err, done)
        }

        let ids = found.map((unit) => unit.id)
        let names = found.map((unit) => unit.name)
        let create = this.payload.filter((unit) => {
          return names.indexOf(unit.name) === -1 ? true : false
        }).map((unit) => ({ name: unit.name }))

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

module.exports = Unit
