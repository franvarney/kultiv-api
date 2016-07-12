const Bcrypt = require('bcryptjs')
const Logger = require('franston')('server:models:auth')
const Uuid = require('uuid4')

const AuthKeySchema = require('../schemas/auth')
const Base = require('./base')
const DB = require('../connections/postgres')

const UserModel = require('./user')

const TABLE_NAME = 'user_auth_keys'
const User = new UserModel()

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
        user_id: user.id,
        hawk_id: Uuid(),
        hawk_key: Uuid()
      }

      super.create(payload, ['id', 'hawk_id', 'hawk_key'], (err, auth) => {
        if (err) return Logger.error(err), done(err)

        return done(null, {
          hawk_id: auth.hawk_id,
          hawk_key: auth.hawk_key,
          user_id: user.id
        })
      })
    })
  }

  deleteById (hawkId, userId, done) { // aka logout
    Logger.debug(`${this.name}.deleteById`)

    this.knex(this.name)
      .where('hawk_id', hawkId)
      .del()
      .asCallback((err, count) => {
        if (err) return Logger.error(err), done(err)
        // TODO do something with count?

        return done()
      })
  }

  findById (hawkId, done) {
    Logger.debug(`${this.name}.findById`)

    this.knex(this.name)
      .select('user_id AS user', 'hawk_id AS id', 'hawk_key AS key')
      .where('hawk_id', hawkId)
      .first()
      .asCallback((err, auth) => {
        if (err) return Logger.error(err), done(err)
        if (!auth) {
          let err = 'Key Not Found'
          return Logger.error(err), done(['notFound', err])
        }

        if (auth) auth = Object.assign({}, auth)
        return done(null, auth)
      })
  }

  // TODO findUserByKey
}

module.exports = Auth
