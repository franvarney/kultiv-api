const Bcrypt = require('bcryptjs')
const Logger = require('franston')('server:models:user')

const Base = require('./base')
const UserSchema = require('../schemas/user')

const TABLE_NAME = 'users'
const SALT_WORK_FACTOR = 10

function hashPassword (password, done) {
  Bcrypt.genSalt(SALT_WORK_FACTOR, (err, salt) => {
    if (err) return Logger.error(err), done(err)

    Bcrypt.hash(password, salt, (err, hashed) => {
      if (err) return Logger.error(err), done(err)
      return done(null, hashed)
    })
  })
}

class User extends Base {
  constructor () {
    super(TABLE_NAME, UserSchema.general)
  }

  create (payload, done) {
    Logger.debug('user.create')

    let email = payload.email
    let username = payload.username

    this.findByEmailOrUsername(email, username, (err, user) => {
      if (err) return Logger.error(err), done(err)
      if (user) return done(['conflict', 'User Already Exists'])

      hashPassword(payload.password, (err, hashed) => {
        if (err) return Logger.error(err), done(err)
        payload.password = hashed
        super.create(payload, done)
      })
    })
  }

  findByEmailOrUsername (email, username, done) {
    Logger.debug('user.findByEmailOrUsername')

    if (typeof username === 'function') {
      done = username
      username = null
    }

    if (!done) done = Function.prototype

    this.knex(this.name)
      .where(function () {
        if (username) this.where('username', username)
      })
      .orWhere('email', email)
      .whereNull('deleted_at')
      .first()
      .asCallback((err, user) => {
        if (err) return Logger.error(err), done(err)
        return done(null, user)
      })
  }

  update (id, payload, done) {
    Logger.debug('user.update')

    this.findById(id, (err, user) => {
      if (err) return Logger.error(err), done(err)

      this.findByEmailOrUsername(payload.email, (err, user) => {
        if (err) return Logger.error(err), done(err)
        if (user) return done(['conflict', 'Email Already Exists'])

        if (payload.password) {
          return hashPassword(payload.password, (err, hashed) => {
            if (err) return Logger.error(err), done(err)
            payload.password = hashed
            return super.update(id, payload, done)
          })
        }

        return super.update(id, payload, done)
      })
    })
  }
}

module.exports = User
