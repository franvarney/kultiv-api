const Joi = require('joi')
const Logger = require('franston')('server:models:base')

const DB = require('../connections/postgres')

class Base {
  constructor (name, schema, data={}) {
    this.name = name
    this.schema = schema
    this.knex = DB
    this.trx = data.trx
    this.willCommit = data.willCommit || false
    this.payload = data.payload || {}
  }

  findById (done) {
    Logger.debug(`base.${this.name}.findById`)

    this.knex(this.name)
      .where('id', Number(this.payload.id))
      .whereNull('deleted_at')
      .transacting(this.trx)
      .first()
      .asCallback((err, found) => {
        if (err) {
          if (this.trx) {
            Logger.error('Transaction Failed'), this.trx.rollback()
          }
          return Logger.error(err), done(err)
        }

        if (!found) {
          let err = 'Not Found'
          return Logger.error(err), done(['notFound', err])
        }

        if (this.trx && this.willCommit) {
          Logger.debug('Transaction Completed'), this.trx.commit()
        }

        delete found.deleted_at
        return done(null, Object.assign({}, found))
      })
  }

  deleteById (done) {
    Logger.debug(`base.${this.name}.deleteById`)

    this.findById((err, result) => {
      if (err) return Logger.error(err), done(err)

      this.knex(this.name)
        .where('id', this.payload.id)
        .whereNull('deleted_at')
        .update('deleted_at', 'now()')
        .transacting(this.trx)
        .asCallback((err, count) => {
          if (err) {
            if (this.trx) {
              Logger.error('Transaction Failed'), this.trx.rollback()
            }
            return Logger.error(err), done(err)
          }

          if (this.trx && this.willCommit) {
            Logger.debug('Transaction Completed'), this.trx.commit()
          }
          return done(null, count)
        })
    })
  }

  create (returning = 'id', done) {
    Logger.debug(`base.${this.name}.create`)

    if (!done) {
      done = returning
      returning = 'id'
    }

    this.validate((err, validated) => {
      if (err) {
        if (this.trx) {
          Logger.error('Transaction Failed'), this.trx.rollback()
        }
        return Logger.error(err), done(err)
      }

      this.knex(this.name)
        .insert(validated)
        .transacting(this.trx)
        .returning(returning)
        .asCallback((err, id) => {
          if (err) {
            if (this.trx) {
              Logger.error('Transaction Failed'), this.trx.rollback()
            }
            return Logger.error(err), done(err)
          }

          if (this.trx && this.willCommit) {
            Logger.debug('Transaction Completed'), this.trx.commit()
          }
          return done(null, id[0])
        })
    })
  }

  update (returning = 'id', done) {
    Logger.debug(`base.${this.name}.update`)

    if (!done) {
      done = returning
      returning = 'id'
    }

    this.findById((err, results) => {
      if (err) return Logger.error(err), done(err)
      this.payload = Object.assign(results, this.payload)

      // TODO review why this is needed
      let id = this.payload.id
      delete this.payload.id
      delete this.payload.created_at
      delete this.payload.updated_at

      this.validate((err, validated) => {
        if (err) return Logger.error(err), done(err)

        this.knex(this.name)
          .where('id', id)
          .update(validated)
          .transacting(this.trx)
          .returning(returning)
          .asCallback((err, id) => {
            if (err) {
              if (this.trx) {
                Logger.error('Transaction Failed'), this.trx.rollback()
              }
              return Logger.error(err), done(err)
            }

            if (this.trx && this.willCommit) {
              Logger.debug('Transaction Completed'), this.trx.commit()
            }
            return done(null, id)
          })
      })
    })
  }

  toggleIsPrivate (done) {
    Logger.debug(`base.${this.name}.toggleIsPrivate`)

    this.findById((err, result) => {
      if (err) return done(err)

      this.knex(this.name)
        .where('id', this.payload.id)
        .transacting(this.trx)
        .returning('id')
        .asCallback((err) => {
          if (err) {
            if (this.trx) {
              Logger.error('Transaction Failed'), this.trx.rollback()
            }
            return Logger.error(err), done(err)
          }

          if (this.trx && this.willCommit) {
            Logger.debug('Transaction Completed'), this.trx.commit()
          }
          return done(null, true)
        })
    })
  }

  validate (done) {
    Logger.debug(`base.${this.name}.validate`)
    Joi.validate(this.payload, this.schema, done)
  }
}

module.exports = Base
