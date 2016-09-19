const Bcrypt = require('bcryptjs')
const Logger = require('franston')('server:models:auth')
const Uuid = require('uuid4')

const AuthKeySchema = require('../schemas/auth')
const Model = require('./base')
const User = require('./user')

const TABLE_NAME = 'user_auth_keys'

const Auth = Model.createModel({
  name: TABLE_NAME,
  schema: AuthKeySchema.general,

  create (done) { // aka login
    Logger.debug('auth.create')

    let data = {}

    if (this.data.login && this.data.login.indexOf('@') >= 0) {
      data = { email: this.data.login }
    } else data = { username: this.data.login }

    User
      .set(data)
      .findByEmailOrUsername((err, user) => {
        if (err) return Logger.error(err), done(err)
        if (!user) {
          let err = 'User Not Found'
          return Logger.error(err), done(['notFound', err])
        }

        if (!Bcrypt.compareSync(this.data.password, user.password)) {
          let err = 'Invalid Password'
          return Logger.error(err), done(['unauthorized', err])
        }

        return this.set({
          user_id: user.id,
          hawk_id: Uuid(),
          hawk_key: Uuid()
        })._create(done)
    })
  },

  deleteById (done) { // aka logout
    Logger.debug('auth.deleteById')

    this.knex(this.name)
      .where('hawk_id', this.data.id)
      .del()
      .transacting(this.trx)
      .asCallback((err, count) => {
        if (err) {
          if (this.trx) {
            Logger.error('Transaction Failed'), this.trx.rollback()
          }
          return Logger.error(err), done(err)
        }
        // TODO do something with count?

        if (this.trx && this.willCommit) {
          Logger.debug('Transaction Completed'), this.trx.commit()
        }
        return done()
      })
  },

  findById (done) {
    Logger.debug('auth.findById')

    this.knex(this.name)
      .select('user_id AS user', 'hawk_id AS id', 'hawk_key AS key')
      .where('hawk_id', this.data.id)
      .first()
      .asCallback((err, auth) => {
        if (err) return Logger.error(err), done(err)

        if (!auth) {
          let err = 'Key Not Found'
          return Logger.error(err), done(['notFound', err])
        }

        return done(null, auth)
      })
  }

  // TODO findUserByKey
})

module.exports = Auth
