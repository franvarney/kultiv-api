const Logger = require('franston')('server:models:base')
const Joi = require('joi')

const DB = require('../connections/postgres')

class Base {
  constructor (name, schema) {
    this.name = name
    this.schema = schema
    this.knex = DB
  }

  findById (id, done) {
    Logger.debug(`base.${this.name}.findById`)

    this.knex(this.name)
      .where('id', id)
      .whereNull('deleted_at')
      .first()
      .asCallback((err, found) => {
        if (err) return Logger.error(err), done(err)
        return done(null, Object.assign({}, found))
      })
  }

  deleteById (id, done) {
    Logger.debug(`base.${this.name}.deleteById`)

    this.findById(id, (err, result) => {
      if (err) return Logger.error(err), done(err)

      this.knex(this.name)
        .where('id', id)
        .whereNull('deleted_at')
        .update('deleted_at', 'now()')
        .asCallback((err, count) => {
          if (err) return Logger.error(err), done(err)
          return done(null, count)
        })
    })
  }

  create (payload, returning = 'id', done) {
    Logger.debug(`base.${this.name}.create`)

    if (typeof returning === 'function') {
      done = returning
      returning = 'id'
    }

    this.validate(payload, (err, validated) => {
      if (err) return done(err)

      this.knex(this.name)
        .insert(validated)
        .returning(returning)
        .asCallback((err, id) => {
          if (err) return Logger.error(err), done(err)
          return done(null, id[0])
        })
    })
  }

  update (id, payload, returning = 'id', done) {
    Logger.debug(`base.${this.name}.update`)

    this.findById(id, (err, results) => {
      if (err) return Logger.error(err), done(err)
      payload = Object.assign(results, payload)

      delete payload.id
      delete payload.created_at
      delete payload.updated_at

      this.validate(payload, (err, validated) => {
        if (err) return Logger.error(err), done(err)

        this.knex(this.name)
          .where('id', id)
          .update(validated)
          .returning(returning)
          .asCallback((err, id) => {
            if (err) return Logger.error(err), done(err)
            return done(null, id)
          })
      })
    })
  }

  toggleIsPrivate (id, done) {
    Logger.debug(`base.${this.name}.toggleIsPrivate`)

    this.findById(id, (err, result) => {
      if (err) return done(err)

      this.knex(this.name)
        .where('id', id)
        .update('is_private', !result.is_private)
        .returning('id')
        .asCallback((err) => {
          if (err) return Logger.error(err), done(err)
          return done(null, true)
        })
    })
  }

  validate (payload, done) {
    Logger.debug(`base.${this.name}.validate`)
    Joi.validate(payload, this.schema, done)
  }
}

module.exports = Base
