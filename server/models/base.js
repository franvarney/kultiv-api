const Assert = require('assert')
const Joi = require('joi')
const Logger = require('franston')('server:models:base')
const Treeize = require('treeize')

const DB = require('../connections/postgres')

const definition = Joi.object().keys({
  name: Joi.string().required(),
  trx: Joi.func(),
  willCommit: Joi.boolean().default(false),
  schema: Joi.object() // .schema()
}).options({ allowUnknown: true })

const methods = {
  set (data, trx = undefined, willCommit = false) {
    this.data = data || {}
    this.trx = trx
    this.willCommit = willCommit
    return this
  },

  setSelect () {
    let args = Array.prototype.slice.call(arguments)
    if (args.length) this.select = args
    else this.select = '*'
    return this
  },

  _errors (err, fn) {
    return Logger.error(err), fn(err)
  },

  _commit () {
    return !!(this.trx && this.willCommit)
  },

  _trxComplete () {
    return Logger.debug('Transaction Completed'), this.trx.commit()
  },

  _rollback () {
    return !!this.trx
  },

  _trxFailed() {
    return Logger.error('Transaction Failed'), this.trx.rollback()
  },

  validate (schema = {}, done) {
    Logger.debug(`base.${this.name}.validate`)

     if (!done) {
      done = schema
      schema = {}
    }

    if (this.schema.isJoi) schema = this.schema
    else schema = this.schema[schema]

    return Joi.validate(this.data, schema, (err, validated) => {
      if (err) return Logger.error(err), done(err)
      return done(null, validated)
    })
  },

  _create (returning = 'id', done) {
    Logger.debug(`base.${this.name}._create`)

    if (!done) {
      done = returning
      returning = 'id'
    }

    this.validate('create', (err, validated) => {
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
        .asCallback((err, created) => {
          if (err) {
            if (this.trx) {
              Logger.error('Transaction Failed'), this.trx.rollback()
            }
            return Logger.error(err), done(err)
          }

          if (this.trx && this.willCommit) {
            Logger.debug('Transaction Completed'), this.trx.commit()
          }

          if (!Array.isArray(this.data)) created = created[0] || created
          return done(null, created)
        })
    })
  },

  create (returning = 'id', done) {
    Logger.debug(`base.${this.name}.create`)
    return this._create(returning, done)
  },

  deleteById (done) {
    Logger.debug(`base.${this.name}.deleteById`)

    this.knex(this.name)
      .where('id', this.data.id)
      .whereNull('deleted_at')
      .update('deleted_at', 'now()')
      .asCallback((err, count) => {
        if (err) return Logger.error(err), done(err)
        return done(null, count)
      })
  },

  _findById (hasDeletedAt, done) {
    Logger.debug(`base.${this.name}._findById`)

    if (!done) {
      done = hasDeletedAt
      hasDeletedAt = true
    }

    let query = this.knex(this.name)

    if (hasDeletedAt) {
      query.whereNull('deleted_at')
    }

    if (Array.isArray(this.data)) query.whereIn('id', this.data)
    else query.where('id', Number(this.data.id)).first()

    query
      .select(this.select)
      .asCallback((err, found) => {
        if (err) return this._errors(err, done)

        if (!found || (Array.isArray(found) && !found.length)) {
          return Logger.error('Not Found'), done()
        }

        if (hasDeletedAt && Array.isArray(found)) {
          found.forEach((item) => delete item.deleted_at)
        } else if (hasDeletedAt) delete found.deleted_at

        return done(null, found)
      })
  },

  findById (hasDeletedAt = true, done) {
    Logger.debug(`base.${this.name}.findById`)
    return this._findById(hasDeletedAt, done)
  },

  _update (returning = 'id', done) {
    Logger.debug(`base.${this.name}._update`)

    if (!done) {
      done = returning
      returning = 'id'
    }

    let id = this.data.id
    delete this.data.id

    this.validate('update', (err, validated) => {
      if (err) return Logger.error(err), done(err)

      this.knex(this.name)
        .update(validated)
        .where('id', id)
        .transacting(this.trx)
        .returning(returning)
        .asCallback((err, resource) => {
          if (err) {
            if (this.trx) {
              Logger.error('Transaction Failed'), this.trx.rollback()
            }
            return Logger.error(err), done(err)
          }

          if (this.trx && this.willCommit) {
            Logger.debug('Transaction Completed'), this.trx.commit()
          }
          return done(null, resource[0] || resource)
        })
    })
  },

  update (returning = 'id', done) {
    Logger.debug(`base.${this.name}.update`)
    return this._update(returning, done)
  }
}

function validateModel (model, done) {
  return Joi.validate(model, definition, done)
}

function createResource (base, model) {
  return validateModel(model, (err, validated) => {
    Assert.equal(err, null, err)
    return Object.assign({}, base, methods, validated)
  })
}

function Model (base) {
  Assert.equal(typeof base.knex, 'function', 'Must include knex connection object')
  return { createModel: createResource.bind(this, base) }
}

module.exports = Model({ knex: DB })
