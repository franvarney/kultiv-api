const Bcrypt = require('bcryptjs')
const Logger = require('franston')('server:models:auth')
const Uuid = require('uuid4')

const AuthKeySchema = require('../schemas/auth')
const Base = require('./base')
const DB = require('../connections/postgres')
const UserModel = require('./user')

const TABLE_NAME = 'user_auth_keys'

class Auth extends Base {
  constructor (data) {
    super(TABLE_NAME, AuthKeySchema.general, data)
  }

  create (done) { // aka login
    Logger.debug('auth.create')

    const User = new UserModel({
      payload: {
        email: this.payload.login,
        username: this.payload.login
      }
    })

    User.findByEmailOrUsername((err, user) => {
      if (err) return Logger.error(err), done(err)
      if (!user) {
        let err = 'User Not Found'
        return Logger.error(err), done(['notFound', err])
      }

      if (!Bcrypt.compareSync(this.payload.password, user.password)) {
        let err = 'Invalid Password'
        return Logger.error(err), done(['unauthorized', err])
      }

      this.payload = {
        user_id: user.id,
        hawk_id: Uuid(),
        hawk_key: Uuid()
      }

      super.create(['id', 'hawk_id', 'hawk_key'], (err, auth) => {
        if (err) return Logger.error(err), done(err)

        return done(null, {
          hawk_id: auth.hawk_id,
          hawk_key: auth.hawk_key,
          user_id: user.id
        })
      })
    })
  }

  deleteById (done) { // aka logout
    Logger.debug('auth.deleteById')

    this.knex(this.name)
      .where('hawk_id', this.payload.id)
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
  }

  findById (done) {
    Logger.debug('auth.findById')

    this.knex(this.name)
      .select('user_id AS user', 'hawk_id AS id', 'hawk_key AS key')
      .where('hawk_id', this.payload.id)
      .transacting(this.trx)
      .first()
      .asCallback((err, auth) => {
        if (err) {
          if (this.trx) {
            Logger.error('Transaction Failed'), this.trx.rollback()
          }
          return Logger.error(err), done(err)
        }

        if (!auth) {
          let err = 'Key Not Found'
          return Logger.error(err), done(['notFound', err])
        }

        if (this.trx && this.willCommit) {
          Logger.debug('Transaction Completed'), this.trx.commit()
        }

        if (auth) auth = Object.assign({}, auth)
        return done(null, auth)
      })
  }

  // TODO findUserByKey
}

module.exports = Auth
