const Bcrypt = require('bcryptjs')
const Logger = require('franston')('server:models:auth')
const Uuid = require('uuid4')

const AuthKeySchema = require('../schemas/auth')
const Base = require('./base')
const DB = require('../connections/postgres')

const User = require('./user')

const TABLE_NAME = 'auth_keys'

class Auth extends Base {
  constructor () {
    super(TABLE_NAME, AuthKeySchema.general)
  }

  create (login, password, done) { // aka login
    Logger.debug(`${this.name}.create`)

    let email = login.indexOf('@') >= 0 ? login : undefined
    let username = login.indexOf('@') === -1 ? login : undefined

    User.findByEmailOrUsername(email, username, (err, user) => {
      if (err) return Logger.error(err), done(err)
      if (!user) {
        let err = 'User Not Found'
        return Logger.error(err), done(['notFound', err])
      }

      if (!Bcrypt.compareSync(password, user.password)) {
        let err = 'Invalid Password'
        return Logger.error(err), done(['unauthorized', err])
      }

      let payload = {
        hawk_id: Uuid(),
        hawk_key: Uuid()
      }

      // TODO transaction?
      super.create(payload, ['id', 'hawk_id', 'hawk_key'], (err, auth) => {
        if (err) return Logger.error(err), done(err)

        DB('user_auth_keys')
          .insert({
            user_id: user.id,
            auth_key_id: auth.id
          })
          .asCallback((err) => {
            if (err) return Logger.error(err), done(err)
            return done(null, {
              hawk_id: auth.hawk_id,
              hawk_key: auth.hawk_key,
              user_id: user.id
            })
          })
      })
    })
  }

  deleteById (hawkId, userId, done) { // aka logout
    Logger.debug(`${this.name}.deleteById`)

    // TODO transaction?
    this.knex(this.name)
      .select('auth_keys.id AS auth_key_id', 'UAK.id AS user_auth_key_id')
      .innerJoin('user_auth_keys AS UAK', 'UAK.auth_key_id', 'auth_keys.id')
      .where('auth_keys.hawk_id', hawkId)
      .andWhere('UAK.user_id', userId)
      .first()
      .asCallback((err, auth) => {
        if (err) return Logger.error(err), done(err)

        DB('user_auth_keys')
          .where('id', auth.user_auth_key_id)
          .del()
          .asCallback((err, count) => {
            if (err) return Logger.error(err), done(err)
            // TODO do something with count?

            this.knex(this.name)
              .where('id', auth.auth_key_id)
              .del()
              .asCallback((err, count) => {
                if (err) return Logger.error(err), done(err)
                // TODO do something with count?

                return done()
              })
          })
      })
  }

  findById (hawkId, done) {
    Logger.debug(`${this.name}.findById`)

    this.knex(this.name)
      .select('UAK.user_id AS user_id', 'auth_keys.hawk_id AS id', 'auth_keys.hawk_key AS key')
      .innerJoin('user_auth_keys AS UAK', 'UAK.auth_key_id', 'auth_keys.id')
      .where('auth_keys.hawk_id', hawkId)
      .first()
      .asCallback((err, auth) => {
        if (err) return Logger.error(err), done(err)
        return done(null, Object.assign({}, auth))
      })
  }

  // TODO findUserByKey
}

module.exports = Auth
