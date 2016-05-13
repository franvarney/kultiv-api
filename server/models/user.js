const Bcrypt = require('bcryptjs')
const Uuid = require('uuid4')

const Base = require('./base')
const UserSchema = require('../schemas/user')

const TABLE_NAME = 'users'
const SALT_WORK_FACTOR = 10

function hashPassword (password, done) {
  Bcrypt.genSalt(SALT_WORK_FACTOR, (err, salt) => {
    if (err) return done(err)

    Bcrypt.hash(password, salt, (err, hashed) => {
      if (err) return done(err)
      return done(null, hashed)
    })
  })
}

class User extends Base {
  constructor () {
    super(TABLE_NAME, UserSchema)
  }

  create (payload, done) {
    let email = payload.email
    let username = payload.username

    this.findByEmailOrUsername(email, username, (err, user) => {
      if (err) return done(err)
      if (user) return done(new Error('User already exists.'))

      payload.auth_token = Uuid()
      hashPassword(payload.password, (err, hashed) => {
        if (err) return done(err)
        payload.password = hashed
        super.create(payload, done)
      })
    })
  }

  findByEmailOrUsername (email, username, done) {
    if (typeof username === 'function') {
      done = username
      username = null
    }

    if (!done) done = Function.prototype

    this.knex(this.name)
      .where(() => {
        if (username) this.where('username', username)
      })
      .orWhere('email', email)
      .whereNull('deleted_at')
      .first()
      .asCallback((err, user) => {
        if (err) return done(err)
        return done(null, user)
      })
  }

  findByAuthToken (authToken, done) {
    this.knex(this.name)
      .Where('auth_token', authToken)
      .whereNull('deleted_at')
      .first()
      .asCallback((err, user) => {
        if (err) return done(err)
        if (!user) return done(null, false)
        return done(null, user)
      })
  }

  update (id, payload, done) {
    if (payload.username) return done(new Error('Username can not be updated.'))
    this.findByEmailOrUsername(payload.email, (err, user) => {
      if (err) return done(err)
      if (user) return done(new Error('Email already exists.'))
      return super.update(id, payload, done)
    })
  }
}

module.exports = new User()
