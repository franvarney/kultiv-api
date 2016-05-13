'use strict'

const Bcrypt = require('bcryptjs')
const Uuid = require('uuid4')

const Base = require('./base')
const UserModel = require('../models/user')

const SALT_WORK_FACTOR = 10
const TABLE_NAME = 'users'

function hashPassword (password, done) {
  Bcrypt.genSalt(SALT_WORK_FACTOR, (err, salt) => {
    if (err) return done(err)

    Bcrypt.hash(password, salt, (err, hashed) => {
      if (err) return done(err)
      done(null, hashed)
    })
  })
}

class User extends Base {
  constructor () {
    super(TABLE_NAME, UserModel)
  }

  create (payload, done) {
    var email = payload.email
    var username = payload.username

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
      .where(function () {
        if (username) this.where('username', username)
      })
      .orWhere('email', email)
      .whereNull('deleted_at')
      .first()
      .then((user) => {
        return done(null, user)
      })
      .catch((err) => done(err))
  }

  findByAuthToken (authToken, done) {
    this.knex(this.name)
      .Where('auth_token', authToken)
      .whereNull('deleted_at')
      .first()
      .then((user) => {
        if (!user) return done(null, false)
        return done(null, user)
      })
      .catch((err) => done(err))
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
